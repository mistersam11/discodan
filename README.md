# Disco Dan

An interactive, cinematic onboarding sequence that starts with ordinary questions and turns into the reveal of a mysterious champion: **Disco Dan**.

## What It Does

- Shows one question at a time on a black screen.
- Collects name, today's date, and the current time.
- Transitions into fast typewritten system code.
- Reveals the contest backstory line by line.
- Ends with a colorful paint-particle explosion and the title smash: **Disco Dan**.

## Stack

- Vite
- React
- TypeScript
- Motion for React
- Canvas 2D

## Local Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Setup

From this folder:

```bash
git init
git add .
git commit -m "Build Disco Dan intro"
```

Then create a new empty GitHub repo and follow GitHub's "push an existing repository" commands. They will look roughly like this:

```bash
git remote add origin https://github.com/YOUR_USERNAME/disco-dan.git
git branch -M main
git push -u origin main
```

## Vercel Setup

1. Create or sign into a Vercel account.
2. Connect Vercel to GitHub.
3. Import the GitHub repo.
4. Leave the framework preset as **Vite**.
5. Use the default commands:
   - Build command: `npm run build`
   - Output directory: `dist`
6. Deploy.

Vercel will make preview deployments for future GitHub pull requests and production deployments when you push to `main`.
