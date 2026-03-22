# WebGrade Deployment Guide 🚀

Your codebase is **100% production-ready**. I have configured the CORS rules, environment variables, and build scripts so that you can deploy this project online for free with zero mistakes. 

Follow these steps exactly.

---

## Step 1: Push Code to GitHub
Both Vercel (Frontend) and Render (Backend) require your code to be on GitHub.
1. Open your terminal in the root `webgrade` folder.
2. Run these commands:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for production"
   ```
3. Go to GitHub, create a new repository called `webgrade`, and follow the instructions to push your code there.

---

## Step 2: Deploy Backend to Render (Free)
Render is perfect for hosting your Node.js/Express backend API.

1. Go to [Render.com](https://render.com) and sign in with GitHub.
2. Click **New +** and select **Web Service**.
3. Connect your new `webgrade` GitHub repository.
4. **Configuration:**
   - **Name**: `webgrade-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Create Web Service**.
6. Wait 2-3 minutes for the build to finish. Once it's live, copy the URL (e.g., `https://webgrade-api.onrender.com`). You will need this for the frontend!

---

## Step 3: Deploy Frontend to Vercel (Free)
Vercel is the fastest and easiest way to host React/Vite applications.

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New** > **Project**.
3. Import your `webgrade` GitHub repository.
4. **Configuration:**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client` (Click edit and select the `client` folder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   - Open the **Environment Variables** tab.
   - Name: `VITE_API_URL`
   - Value: Paste the URL from Render (e.g., `https://webgrade-api.onrender.com` — *no tracking slash at the end!*)
6. Click **Deploy**.

---

## Step 4: Add Live Domain to Firebase Auth Domains
Since you are using Firebase Authentication, Google needs to know your new live Vercel domain is "safe".

1. Go to the [Firebase Console](https://console.firebase.google.com).
2. Open the **Authentication** tab on the left.
3. Go to the **Settings** tab (or "Authorized domains" list).
4. Click **Add Domain** and paste your new Vercel URL (e.g., `webgrade.vercel.app`), then click Add.

🎉 **That's it! Your application is now live on the internet!**
