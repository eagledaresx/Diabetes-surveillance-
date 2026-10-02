# Remix: Diabetes Surveillance App

An Android-inspired, comprehensive blood glucose monitoring and diabetes surveillance suite built with React, TypeScript, Tailwind CSS, Express, and Google Gemini AI.

---

## 🌟 Highlights

- **Glycemic Surveillance & Logs**: Fasting, pre-meal, post-meal, and bedtime glucose tracking with rolling glycemic variability and dynamic HbA1c estimation.
- **Visual Analytics**: Interactive multi-period trend visualizers, standard deviation monitors, and hypo/hyper risk markers.
- **Compliance & Adherence Engine**: Daily management tracking, medication timers with log dose adjustments, and adherence warning systems.
- **Smart Diet & Food Analysis**: AI-powered low-GI recipe conversion, glycemic load calculators, and meal planning.
- **Wearable & Continuous Monitoring**: Support for continuous glucose monitoring streams and health integrations.
- **Doctor Report Export**: Clinical summary exports ready for physician visits.

---

## 🚀 Quickstart

For detailed instructions, see the **[Quickstart Guide](docs/quickstart.md)**.

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your `GEMINI_API_KEY` in `.env`.

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📜 Available Scripts

- `npm run dev`: Starts the local development server on port 3000.
- `npm run build`: Builds the static frontend and bundles the Express server into `dist/`.
- `npm start`: Starts the compiled production server.
- `npm run lint`: Runs TypeScript validation.

---

## ⚖️ Medical Disclaimer
This application is designed for informational and self-monitoring purposes only. It does not provide medical diagnosis, prescription advice, or emergency treatment. Always consult a qualified physician or healthcare provider for clinical decisions.
