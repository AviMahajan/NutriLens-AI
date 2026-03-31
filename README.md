# NutriScan AI - Vercel Deployment Guide

This project is optimized for deployment on [Vercel](https://vercel.com). Follow these steps to deploy your application:

## 1. Prerequisites

- A [Vercel account](https://vercel.com/signup).
- [Vercel CLI](https://vercel.com/download) (optional, but recommended for local testing).
- A [Gemini API Key](https://aistudio.google.com/app/apikey).

## 2. Deployment Steps

### Option A: Via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket.**
2. **Import the project in Vercel:**
   - Go to the [Vercel Dashboard](https://vercel.com/dashboard).
   - Click **"New Project"**.
   - Select your repository.
3. **Configure the project:**
   - **Framework Preset:** Vercel should automatically detect **Vite**.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Set Environment Variables:**
   - In the **"Environment Variables"** section, add:
     - `GEMINI_API_KEY`: Your Google Gemini API Key.
5. **Click "Deploy".**

### Option B: Via Vercel CLI

1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Follow the prompts to link your project.
4. Set the environment variable: `vercel env add GEMINI_API_KEY`
5. Deploy: `vercel --prod`

## 3. Configuration Details

- **`vercel.json`**: Handles client-side routing by rewriting all non-asset requests to `index.html`.
- **`vite.config.ts`**: Injects the `GEMINI_API_KEY` into the client-side bundle at build time.

## 4. Important Note on API Keys

The current setup injects the `GEMINI_API_KEY` into the client-side bundle at build time for convenience. For production environments where security is paramount, consider moving the Gemini API calls to a serverless function (Vercel Functions) to keep your API key hidden from the browser.
