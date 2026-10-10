# Deployment Guide for FinPulse-AI

To deploy this complex stack completely in the cloud while respecting Vercel's Serverless constraints, I have refactored the codebase to use **Firebase Storage** instead of local disks, and updated the AI Service to fetch documents over the network.

Here is the exact step-by-step guide to deploying your application.

## 1. Prerequisites

Before deploying, ensure you have set up the following external cloud services:

1.  **PostgreSQL Database**: You need a cloud Postgres instance.
    *   **Recommended**: Go to [Supabase](https://supabase.com/) or [Neon](https://neon.tech/) and create a free PostgreSQL database. Get the Connection String (starts with `postgresql://`).
2.  **Firebase Storage**: We migrated file uploads to Firebase.
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
    *   Enable **Storage** (in Test Mode or Production Mode).
    *   Go to **Project Settings > Service Accounts** and generate a new private key. You'll need these credentials for the Backend environment variables.

## 2. Deploy the AI Service (Render or Railway)

Vercel's 250MB size limit and 10-second timeout on Serverless Functions will crash the heavy Python AI Service (PyTorch, FAISS, Sentence-Transformers). We must deploy this on a platform designed for long-running processes.

**Using Render (Recommended):**
1. Create a free account on [Render](https://render.com/).
2. Create a **New Web Service**.
3. Connect your GitHub repository.
4. Set the Root Directory to `ai-service`.
5. Environment setup:
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add the following Environment Variables:
    *   `DATABASE_URL`: Your cloud PostgreSQL URL (from Supabase/Neon).
    *   `INTERNAL_SERVICE_KEY`: A random secure string (e.g., `my_super_secret_key`).
    *   `GEMINI_API_KEY`: Your Gemini API key.
7. Deploy the service. Once deployed, note down the URL (e.g., `https://complygem-ai.onrender.com`).

## 3. Deploy the Backend (Vercel)

I have already added the `vercel.json` configuration and refactored the `multer` uploads to use memory storage, making it fully Vercel-ready!

1. Go to [Vercel](https://vercel.com/) and create a **New Project**.
2. Import your GitHub repository.
3. Edit the **Root Directory** and set it to `backend`.
4. Ensure the Framework Preset is set to **Other**.
5. The Build Command should be overridden to `npm install && npx prisma generate` to ensure Prisma client is generated.
6. Add the following Environment Variables:
    *   `DATABASE_URL`: Your cloud PostgreSQL URL (same one used above).
    *   `AI_SERVICE_URL`: The URL of your Render AI Service (e.g., `https://complygem-ai.onrender.com`).
    *   `INTERNAL_SERVICE_KEY`: The exact same secret string used in the AI Service.
    *   `FIREBASE_PROJECT_ID`: Your Firebase Project ID.
    *   `FIREBASE_CLIENT_EMAIL`: Your Firebase Service Account Email.
    *   `FIREBASE_PRIVATE_KEY`: Your Firebase Private Key (must include the `-----BEGIN PRIVATE KEY-----` block).
    *   `FIREBASE_STORAGE_BUCKET`: E.g., `your-project.appspot.com`.
7. Click **Deploy**. Once finished, note down the Backend Vercel URL.

## 4. Deploy the Frontend (Vercel)

1. Go back to the Vercel Dashboard and create another **New Project**.
2. Import the same GitHub repository.
3. Edit the **Root Directory** and set it to `frontend`.
4. The Framework Preset should automatically detect **Vite**.
5. Add the following Environment Variable:
    *   `VITE_API_URL`: Your Vercel Backend URL (e.g., `https://finpulse-backend.vercel.app`).
    *   *(If your frontend relies on Firebase directly, add the `VITE_FIREBASE_*` variables from your `.env.example` as well).*
6. Click **Deploy**.

## 5. Final Step: Database Schema

Because Vercel Serverless Functions do not automatically run database migrations on startup, you must push the Prisma schema to your new Cloud PostgreSQL database once.

From your local machine terminal:
1. `cd backend`
2. Run `set DATABASE_URL=postgresql://your_cloud_url_here`
3. Run `npx prisma db push`

---
**Summary of Architectural Changes Made:**
- ✅ Rewrote the backend document vault and tender uploads to upload directly to Firebase Storage using memory buffers instead of local disks.
- ✅ Updated the Python AI Service to use `httpx` to download documents from Firebase URLs into temporary storage before running OCR, bypassing the need for shared local disks.
- ✅ Added a `vercel.json` and adjusted the Node.js entry point to prevent port binding issues in Vercel's environment.
