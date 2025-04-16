# 🌊 Flood Management & Prediction System

A modern web application designed to predict flood risks, visualize affected areas, and guide evacuation plans. Built using **Next.js** and **TypeScript**, this project aims to assist both citizens and authorities in making informed, life-saving decisions during flood-prone periods.

## 🚀 Features

- 📍 **Flood Risk Mapping**  
  Interactive map displaying flood-prone zones with real-time risk levels.

- 🤖 **Flood Prediction System**  
  Machine-learning integrated prediction model to forecast flood likelihood based on environmental factors.

- 🛣️ **Evacuation Route Planner**  
  Suggests optimal escape routes to safety during emergencies.

## 🛠 Tech Stack

- **Frontend:** React with Next.js (TypeScript)
- **Styling:** Tailwind CSS
- **Mapping:** Mapbox
- **Tooling:** PostCSS, ESLint, Prettier

## 📂 Project Structure

```
flood-management---prediction/
├── app/                    # Main app pages and layout
│   ├── favicon.ico         # App icon
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Main page component
├── components/             # Reusable UI components
│   ├── evacuation-routes.tsx       # Evacuation route planner component
│   ├── flood-prediction-system.tsx # Flood prediction system component
│   ├── flood-risk-map.tsx          # Flood risk map component
│   ├── location-selector.tsx       # User location selector component
│   ├── project-home.tsx            # Project home component
│   ├── rainfall-history.tsx        # Rainfall history visualization
│   └── rainfall-prediction.tsx     # Rainfall prediction component
├── public/                 # Static assets (images, fonts, etc.)
├── .gitignore              # Files and directories to ignore in Git
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Locked versions of dependencies
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
├── postcss.config.mjs      # PostCSS configuration
└── components.json         # UI library configuration (if applicable)
```

## 📦 Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/vish3949/flood-management---prediction.git
   cd flood-management---prediction
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run the Development Server**

   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000` in your browser to view the app.

## ✅ TODO

- [ ] Integrate real-time flood data API
- [ ] Add user location tracking for personalized route planning
- [ ] Implement offline support for emergency cases
- [ ] Deploy to Vercel or similar for live access

## 🧠 Inspiration

Inspired by the increasing need for proactive disaster response systems in flood-prone regions.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Designed to save lives through innovation and technology.
