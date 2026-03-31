/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { 
  Camera, 
  Upload, 
  Loader2, 
  Utensils, 
  Flame, 
  Brain, 
  Salad, 
  Lightbulb, 
  BarChart3, 
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Info,
  ArrowRight,
  Zap,
  ShieldCheck,
  Beef
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

// Initialize Gemini API
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface NutritionData {
  foodItems: string[];
  calories: string;
  macros: {
    protein: string;
    carbs: string;
    fats: string;
  };
  healthAssessment: {
    status: 'Healthy' | 'Moderate' | 'Unhealthy' | string;
    explanation: string;
  };
  dietType: string;
  suggestions: string[];
  confidence: string;
  assumptions: string[];
  raw: string;
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NutritionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const parseResult = (text: string): NutritionData => {
    const data: NutritionData = {
      foodItems: [],
      calories: '0',
      macros: { protein: '0', carbs: '0', fats: '0' },
      healthAssessment: { status: 'Unknown', explanation: '' },
      dietType: 'Unknown',
      suggestions: [],
      confidence: 'Medium',
      assumptions: [],
      raw: text
    };

    const lines = text.split('\n');
    let currentSection = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('🍽 Food Items Detected:')) currentSection = 'food';
      else if (trimmed.startsWith('🔥 Estimated Calories:')) currentSection = 'calories';
      else if (trimmed.startsWith('🥩 Macronutrients:')) currentSection = 'macros';
      else if (trimmed.startsWith('🧠 Health Assessment:')) currentSection = 'health';
      else if (trimmed.startsWith('🥗 Diet Type:')) currentSection = 'diet';
      else if (trimmed.startsWith('💡 Suggestions:')) currentSection = 'suggestions';
      else if (trimmed.startsWith('📊 Confidence Level:')) currentSection = 'confidence';
      else if (trimmed.startsWith('⚠️ Assumptions:')) currentSection = 'assumptions';
      else if (trimmed) {
        switch (currentSection) {
          case 'food':
            if (trimmed.startsWith('-')) data.foodItems.push(trimmed.replace('-', '').trim());
            break;
          case 'calories':
            data.calories = trimmed.replace('kcal', '').trim();
            break;
          case 'macros':
            if (trimmed.toLowerCase().includes('protein:')) data.macros.protein = trimmed.split(':')[1].trim();
            if (trimmed.toLowerCase().includes('carbohydrates:')) data.macros.carbs = trimmed.split(':')[1].trim();
            if (trimmed.toLowerCase().includes('fats:')) data.macros.fats = trimmed.split(':')[1].trim();
            break;
          case 'health':
            if (!data.healthAssessment.status || data.healthAssessment.status === 'Unknown') {
              const parts = trimmed.split('\n');
              data.healthAssessment.status = parts[0].trim();
              if (parts.length > 1) data.healthAssessment.explanation = parts.slice(1).join(' ');
            } else {
              data.healthAssessment.explanation += ' ' + trimmed;
            }
            break;
          case 'diet':
            data.dietType = trimmed;
            break;
          case 'suggestions':
            if (trimmed.startsWith('-')) data.suggestions.push(trimmed.replace('-', '').trim());
            break;
          case 'confidence':
            data.confidence = trimmed;
            break;
          case 'assumptions':
            if (trimmed.startsWith('-')) data.assumptions.push(trimmed.replace('-', '').trim());
            break;
        }
      }
    });

    // Clean up health assessment status if it contains the explanation
    if (data.healthAssessment.status.includes('\n')) {
      const parts = data.healthAssessment.status.split('\n');
      data.healthAssessment.status = parts[0];
      data.healthAssessment.explanation = parts.slice(1).join(' ');
    }

    return data;
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const base64Data = image.split(',')[1];
      const model = "gemini-3-flash-preview";

      const prompt = `You are an AI-powered nutrition analysis assistant embedded inside a web application called "NutriLens AI".
Analyze the food image and generate structured nutritional insights.

OUTPUT FORMAT (STRICT):

🍽 Food Items Detected:
- [Item 1]
- [Item 2]

🔥 Estimated Calories:
[Number] kcal

🥩 Macronutrients:
- Protein: [Number] g
- Carbohydrates: [Number] g
- Fats: [Number] g

🧠 Health Assessment:
[Healthy/Moderate/Unhealthy]
[1-2 line explanation]

🥗 Diet Type:
[Classification]

💡 Suggestions:
- [Suggestion 1]
- [Suggestion 2]

📊 Confidence Level:
[Low/Medium/High]

⚠️ Assumptions:
- [Assumption 1]
- [Assumption 2]`;

      const response: GenerateContentResponse = await genAI.models.generateContent({
        model: model,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data,
                },
              },
            ],
          },
        ],
      });

      if (response.text) {
        setResult(parseResult(response.text));
      } else {
        throw new Error("No analysis result received.");
      }
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  const getHealthColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('healthy')) return 'bg-emerald-500 shadow-emerald-500/30';
    if (s.includes('moderate')) return 'bg-amber-500 shadow-amber-500/30';
    if (s.includes('unhealthy')) return 'bg-rose-500 shadow-rose-500/30';
    return 'bg-indigo-500 shadow-indigo-500/30';
  };

  const getHealthBg = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('healthy')) return 'bg-emerald-50/50 text-emerald-700 border-emerald-100/50';
    if (s.includes('moderate')) return 'bg-amber-50/50 text-amber-700 border-amber-100/50';
    if (s.includes('unhealthy')) return 'bg-rose-50/50 text-rose-700 border-rose-100/50';
    return 'bg-indigo-50/50 text-indigo-700 border-indigo-100/50';
  };

  const tryExample = () => {
    setImage("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000");
    setResult({
      foodItems: ["Grilled Chicken Breast", "Steamed Broccoli", "Quinoa", "Cherry Tomatoes"],
      calories: "450",
      macros: { protein: "35g", carbs: "42g", fats: "12g" },
      healthAssessment: { status: "Healthy", explanation: "High protein and fiber content with balanced micronutrients from vegetables." },
      dietType: "High Protein / Balanced",
      suggestions: ["Add a healthy fat source like avocado", "Increase hydration"],
      confidence: "High",
      assumptions: ["Standard portion sizes", "No added oils or dressings"],
      raw: ""
    });
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      {/* Hero Background with Overlay */}
      <div className="hero-bg">
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2000" 
          alt="" 
          className="hero-bg-image"
          referrerPolicy="no-referrer"
        />
        <div className="hero-overlay" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/5">
              <Camera className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">NutriLens AI</span>
          </div>
          {image && (
            <button 
              onClick={reset}
              className="px-4 py-2 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-16"
            >
              {/* Hero Section */}
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.1,
                    duration: 0.8,
                    ease: "easeOut"
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 backdrop-blur-md"
                >
                  <Zap className="w-3 h-3" />
                  Powered by Gemini 3 Flash
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.1] text-balance text-white"
                >
                  Snap your meal. Get instant <span className="text-indigo-400">calories & macros.</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-white/70 max-w-xl mx-auto leading-relaxed font-medium"
                >
                  The fastest way to track your nutrition using advanced AI. Just upload a photo and get a full breakdown in seconds.
                </motion.p>
              </div>

              {/* Main Interaction Area */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
                {/* Left: Upload Box */}
                <div className="space-y-8">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative w-full aspect-[4/3] glass border-2 border-dashed border-white/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all duration-500 shadow-2xl"
                  >
                    <div className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
                    <div className="absolute -inset-4 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500 relative z-10">
                      <Upload className="w-10 h-10 text-white/60 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-center space-y-2 relative z-10">
                      <p className="font-bold text-xl text-white">Drop your photo here</p>
                      <p className="text-white/40 text-sm font-medium">Tap to browse your library</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                      {/* Step by Step Flow */}
                  <div className="grid grid-cols-3 gap-4 relative z-10">
                    {[
                      { step: "1", label: "Snap", desc: "Take a photo" },
                      { step: "2", label: "Analyze", desc: "AI processing" },
                      { step: "3", label: "Track", desc: "Get insights" }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center text-center space-y-2">
                        <div className="w-8 h-8 rounded-full glass border border-white/20 flex items-center justify-center text-xs font-bold shadow-sm text-white">
                          {item.step}
                        </div>
                        <p className="font-bold text-sm text-white">{item.label}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Sample Preview / Intent */}
                <div className="glass rounded-[2.5rem] p-8 border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="font-bold text-xl text-white">See how it works</h3>
                    <button 
                      onClick={tryExample}
                      className="text-xs font-bold text-white bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors border border-white/10"
                    >
                      Try Example
                    </button>
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex gap-4 items-center p-4 bg-white/5 rounded-2xl border border-white/10 shadow-sm">
                      <div className="w-16 h-16 bg-white/10 rounded-xl overflow-hidden shrink-0">
                        <img 
                          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200" 
                          alt="Sample" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">Quinoa Salad with Avocado</p>
                        <p className="text-xs text-white/40">Analyzed in 1.2s</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Calories</p>
                        <p className="text-2xl font-black text-emerald-400">420 <span className="text-xs font-medium">kcal</span></p>
                      </div>
                      <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Health</p>
                        <p className="text-lg font-black text-blue-400">Healthy</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white/60">Protein</span>
                        <span className="font-black text-white">18g</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-[60%] h-full bg-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-white/40 font-medium">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      98% Accuracy on common food items
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Left Column: Image & Controls (4 cols) */}
              <div className="lg:col-span-4 space-y-8 relative z-10">
                <div className="relative aspect-square glass rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/10 border border-white/40">
                  <img 
                    src={image} 
                    alt="Meal" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {loading && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-xl flex flex-col items-center justify-center gap-6 overflow-hidden">
                      <div className="absolute inset-0 shimmer opacity-30" />
                      <div className="relative">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40"
                        >
                          <Zap className="w-10 h-10 text-white" />
                        </motion.div>
                        <div className="absolute -inset-4 border-2 border-indigo-500/20 rounded-[2rem] animate-[ping_3s_linear_infinite]" />
                      </div>
                      <div className="text-center space-y-1 relative z-10">
                        <p className="font-black text-2xl tracking-tight text-white">AI is thinking...</p>
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-[0.2em]">Analyzing pixels & textures</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {!result && !loading && (
                  <button
                    onClick={analyzeImage}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-3 group"
                  >
                    Analyze Meal
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                {error && (
                  <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex gap-4 items-start">
                    <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-bold text-rose-900">Analysis Failed</p>
                      <p className="text-sm text-rose-700 leading-relaxed">{error}</p>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="p-6 glass rounded-3xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-widest text-white/40">Confidence</span>
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-sm text-white">{result.confidence}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                      <Info className="w-4 h-4 text-white/40 shrink-0 mt-0.5" />
                      <p className="text-[10px] leading-relaxed text-white/60 font-medium">
                        AI estimates are based on visual data. Portions are assumed. For medical tracking, verify with a professional.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Results (8 cols) */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div 
                      key="results-content"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-8"
                    >
                      {/* Top Row: Calories & Health */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 glass p-8 rounded-[2.5rem] border border-white/10 shadow-xl flex items-center justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                          <div className="space-y-1 relative z-10">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Total Calories</p>
                            <h3 className="text-6xl font-black tracking-tighter text-white">
                              {result.calories} <span className="font-bold text-white/20 text-[28px] leading-[30px] font-['Arial']">kcal</span>
                            </h3>
                          </div>
                          <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center relative z-10">
                            <Flame className="w-8 h-8 text-orange-500" />
                          </div>
                        </div>
                        
                        <div className={`p-8 rounded-[2.5rem] border flex flex-col justify-center items-center text-center space-y-3 glass shadow-xl shadow-indigo-500/5 ${getHealthBg(result.healthAssessment.status)}`}>
                          <p className="font-bold uppercase tracking-[0.2em] opacity-60 text-[14px] font-sans no-underline">Health Score</p>
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-lg ${getHealthColor(result.healthAssessment.status)}`}
                          >
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </motion.div>
                          <p className="text-2xl font-black leading-none">{result.healthAssessment.status}</p>
                        </div>
                      </div>

                      {/* Macros Grid */}
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { label: "Protein", value: result.macros.protein, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: Beef },
                          { label: "Carbs", value: result.macros.carbs, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Utensils },
                          { label: "Fats", value: result.macros.fats, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Salad }
                        ].map((macro, i) => (
                          <div key={i} className={`p-6 rounded-3xl border glass ${macro.bg} ${macro.border} space-y-4 shadow-xl`}>
                            <div className="flex items-center justify-between">
                              <macro.icon className={`w-5 h-5 ${macro.color}`} />
                              <span className={`text-[10px] font-black uppercase tracking-widest ${macro.color} opacity-70`}>{macro.label}</span>
                            </div>
                            <p className={`text-3xl font-black ${macro.color}`}>{macro.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Detailed Insights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Food Items & Diet */}
                        <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-xl space-y-6">
                          <div className="space-y-4">
                            <h4 className="font-bold text-lg flex items-center gap-2 text-white">
                              <Utensils className="w-5 h-5 text-indigo-400" />
                              Detected Items
                            </h4>
                            <ul className="space-y-2">
                              {result.foodItems.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm font-medium text-white/70">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-6 border-t border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Diet Classification</p>
                            <span className="inline-block px-4 py-2 bg-white/5 rounded-full text-sm font-bold text-indigo-400 border border-white/10">
                              {result.dietType}
                            </span>
                          </div>
                        </div>

                        {/* Suggestions */}
                        <div className="glass-dark p-8 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                          <h4 className="font-bold text-lg flex items-center gap-2 relative z-10">
                            <Lightbulb className="w-5 h-5 text-amber-400" />
                            AI Suggestions
                          </h4>
                          <div className="space-y-4 relative z-10">
                            {result.suggestions.map((s, i) => (
                              <div key={i} className="flex gap-4 items-start">
                                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-amber-400">
                                  {i + 1}
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">{s}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Assumptions & Raw Output (Optional) */}
                      <div className="p-6 glass rounded-3xl border border-white/10 shadow-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Portion Assumptions & Context</p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {result.assumptions.map((a, i) => (
                            <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                              <Info className="w-3 h-3 mt-0.5 shrink-0 text-indigo-400" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ) : !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 glass border-2 border-dashed border-white/10 rounded-[2.5rem] shadow-xl">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <Brain className="w-10 h-10 text-white/20" />
                      </div>
                      <h3 className="text-2xl font-black mb-2 text-white">Ready for Analysis</h3>
                      <p className="text-white/60 max-w-xs mx-auto leading-relaxed font-medium">
                        Click the "Analyze Meal" button to see the magic happen. Our AI will break down every macro for you.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold tracking-tight text-white">NutriLens AI</span>
          </div>
          <p className="text-xs text-white/40 max-w-md text-center md:text-right leading-relaxed">
            NutriLens AI leverages advanced computer vision to provide nutritional estimates. 
            Always consult with a healthcare professional before making significant dietary changes.
          </p>
        </div>
      </footer>
    </div>
  );
}
