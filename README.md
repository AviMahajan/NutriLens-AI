# 🥗 NutriLens AI — Food Nutrition Analyzer

NutriLens AI is an AI-powered prototype that analyzes food images and provides instant nutrition insights — including calories, macros, and dietary assessment.

> 📸 Snap your meal → ⚡ Get insights → 📊 No manual logging

---

## 🎯 Problem

Most calorie tracking apps are **high-friction**:
- Manual food logging is tedious  
- Portion estimation is difficult  
- Searching food databases is time-consuming  

This leads to **low consistency and high drop-off**.

---

## 💡 Solution

NutriLens AI removes friction by enabling:

- 📷 Image-based food input (natural interaction)
- ⚡ Instant AI-powered analysis  
- 📊 Structured nutrition insights  

No typing. No searching. Just upload and know.

---

## ✨ Features

- 🍽 **Food Detection** — Identifies food items from images  
- 🔥 **Calorie Estimation** — Approximate calorie count  
- 🥩 **Macronutrient Breakdown** — Protein, carbs, fats  
- 🧠 **Health Assessment** — Healthy / Moderate / Unhealthy  
- 🥗 **Diet Classification** — High protein, balanced, etc.  
- 💡 **Smart Suggestions** — Actionable improvements  
- 📊 **Confidence Score** — Transparency in AI predictions  

---

## 🧠 Product Thinking (AI PM Lens)

This project focuses on **real-world AI product trade-offs**:

- **Speed over perfection** → Fast responses improve usability  
- **Structured outputs** → AI responses formatted into usable data  
- **Trust through transparency** → Confidence levels + assumptions  
- **Low-friction UX** → Designed for habit formation  

---

## ⚠️ Limitations

- Estimates are **approximate, not exact**  
- Accuracy depends on image quality  
- Complex/mixed dishes may reduce precision  

> This is a prototype and not intended for medical or dietary advice.

---

## 🛠 Tech Stack

- **AI Model:** Google Gemini (via Google AI Studio)  
- **Frontend:** React + Vite  
- **Deployment:** Vercel  
- **Language:** TypeScript  

---

## ⚙️ How It Works

1. User uploads a food image  
2. Image is processed via Gemini API  
3. Prompt engineering structures the response  
4. Output is formatted into UI-friendly insights  

---

## 🔐 Security & Cost Considerations

- API keys are managed via environment variables  
- Usage is controlled using quota limits  
- Designed for demo-scale usage (not production)  

---

## 🚀 Future Roadmap

Planned enhancements to evolve from prototype → product:

- 📅 Daily / weekly / monthly tracking  
- 👤 User profiles & personalized goals  
- 📊 Historical analytics  
- 🧠 Context-aware memory (meal patterns)  

---

## 📸 Screenshots

![LP new](https://github.com/user-attachments/assets/01ae4e7e-40d4-4d10-93d1-88dac5cce2fc)

![analysis New](https://github.com/user-attachments/assets/d6b47dcf-653f-423d-b364-6654c3e69e55)

---

## 🧪 Setup Instructions

```bash
# Clone the repo
git clone https://github.com/your-username/nutrilens-ai.git

# Install dependencies
npm install

# Run locally
npm run dev
