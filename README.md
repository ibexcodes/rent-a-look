<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ea9509cb-5ef8-441b-8276-3ae8ef184a67

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This project is configured to deploy to GitHub Pages automatically when you push to the `main` branch.

### Setup Steps:

1. **Configure GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Build and deployment**, set **Source** to `GitHub Actions`

2. **Add Optional Secrets (if needed):**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add `GEMINI_API_KEY` as a repository secret if your app uses Gemini AI features

3. **Deploy:**
   - Push your changes to the `main` branch
   - GitHub Actions will automatically build and deploy your app
   - Access your app at `https://YOUR_USERNAME.github.io/rent-a-look`

### Manual Deployment:

You can also deploy manually by running:
```bash
npm run deploy
```

### Notes:

- The app uses **HashRouter** for client-side routing, which works perfectly with GitHub Pages
- PWA (Progressive Web App) features are enabled
- The build output is configured with the base path `/rent-a-look/` for GitHub Pages
