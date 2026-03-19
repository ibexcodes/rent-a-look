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
