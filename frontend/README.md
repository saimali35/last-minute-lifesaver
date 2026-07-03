# ⚡ LifeSaver AI — Last-Minute Productivity Companion

AI-powered task manager with urgency scoring and a built-in Gemini chat assistant.

## Tech Stack
- **React 18** + **Vite**
- **Tailwind CSS v3**
- **Gemini 1.5 Flash** (free tier)

## Folder Structure
```
src/
├── components/
│   ├── AddTaskForm.jsx   # Form to add tasks
│   ├── ChatMessage.jsx   # Single chat bubble
│   ├── StatsBar.jsx      # Critical / Urgent / Done counts + progress bar
│   ├── TaskCard.jsx      # Task row with urgency ring
│   └── UrgencyRing.jsx   # SVG circular score indicator
├── services/
│   └── gemini.js         # All Gemini API calls
├── utils/
│   └── helpers.js        # Shared pure functions
├── App.jsx               # Root component + state
├── index.css             # Tailwind directives + global styles
└── main.jsx              # React entry point
```

## Setup

1. **Clone & install**
   ```bash
   npm install
   ```

2. **Add your Gemini API key**
   ```bash
   cp .env.example .env
   # Edit .env and paste your key from https://aistudio.google.com/app/apikey
   ```

3. **Run**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

