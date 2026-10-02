# Quickstart Guide

This guide walks you through setting up and running **Remix: Diabetes Surveillance App** locally.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [Clone the Repository](#clone-the-repository)
- [Install Dependencies](#install-dependencies)
- [Environment Configuration](#environment-configuration)
- [Run Development Server](#run-development-server)
- [Build for Production](#build-for-production)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure your system meets the following requirements:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher (or `pnpm` / `bun`)
- **Git**: Installed and configured on your path
- **Gemini API Key**: (Optional for basic UI, required for AI food scanning, diet conversion, and medical assistant features) — Get one from [Google AI Studio](https://aistudio.google.com/).

---

## Clone the Repository

To clone this repository to your local machine:

### Option A: Via GitHub (if exported to GitHub)
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### Option B: Via AI Studio ZIP Export
1. In Google AI Studio Build, click the settings/export menu and select **Export to ZIP**.
2. Unpack the ZIP archive to your desired directory:
   ```bash
   unzip remix-diabetes-surveillance-app.zip -d remix-diabetes-surveillance-app
   cd remix-diabetes-surveillance-app
   ```

---

## Install Dependencies

Install the project dependencies using `npm`:

```bash
npm install
```

*(You can also use `bun install` or `pnpm install` if preferred).*

---

## Environment Configuration

Create a `.env` file in the root directory by copying the provided example:

```bash
cp .env.example .env
```

Open `.env` and set your configuration variables:

```env
# Gemini API Key (Required for server-side AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# App URL (Defaults to http://localhost:3000 in local dev)
APP_URL=http://localhost:3000

# Wearable Integrations (Optional)
SPIKE_API_KEY=
SPIKE_CLIENT_ID=
SPIKE_CLIENT_SECRET=
SPIKE_HMAC_KEY=

OPEN_WEARABLES_URL=
OPEN_WEARABLES_API_KEY=
OPEN_WEARABLES_CLIENT_ID=
```

---

## Run Development Server

Start the full-stack development server (Express + Vite with `tsx`):

```bash
npm run dev
```

Once started, open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

## Build for Production

To build the client application and bundle the backend server:

```bash
npm run build
```

This compiles:
- The React client assets into `/dist`
- The Node.js Express server into `/dist/server.cjs` via `esbuild`

To start the production server:

```bash
npm start
```

---

## Code Quality & Verification

Run the TypeScript and linter checks:

```bash
npm run lint
```

---

## Troubleshooting

- **Port 3000 is already in use:**
  Terminate any existing process using port 3000 or check active processes:
  ```bash
  # Linux/macOS:
  lsof -i :3000
  kill -9 <PID>
  ```
- **Gemini API calls return 500:**
  Confirm that `GEMINI_API_KEY` is present in your `.env` file and has valid API permissions.
