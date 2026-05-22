# Portfolio — The Neural Orchestrator

Surya Teja Pinninti's interactive 3D portfolio. React + Vite + three.js, deployed to GitHub Pages via GitHub Actions.

Live: https://surya2106.github.io/portfolio/

## Local dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy

Pushes to `main` trigger `.github/workflows/deploy.yml` which builds and publishes to GitHub Pages.
One-time setup: in repo Settings → Pages, set Source to "GitHub Actions".
