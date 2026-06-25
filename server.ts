import express from "express";
import path from "path";
import dotenv from "dotenv";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// Initialize Gemini SDK with custom user agent and key from environment variables
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// API Route 1: Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Play Store Compliance: Serve Privacy Policy publicly
app.get("/privacy", (req, res) => {
  res.sendFile(path.join(process.cwd(), "privacy.html"));
});

app.get("/privacy-policy", (req, res) => {
  res.sendFile(path.join(process.cwd(), "privacy.html"));
});

// ==========================================
// OPEN WEARABLES (THE-MOMENTUM) STANDARD INTEGRATION ROUTES
// ==========================================

app.post("/api/open-wearables/sync", async (req, res) => {
  try {
    const { provider, userId, accessToken, endpointUrl } = req.body;
    
    // Check if we have a real custom endpoint to query
    const targetUrl = endpointUrl || process.env.OPEN_WEARABLES_URL;
    const apiKey = process.env.OPEN_WEARABLES_API_KEY;

    if (targetUrl && (accessToken || apiKey)) {
      console.log(`Open Wearables proxying to: ${targetUrl} for user: ${userId}`);
      try {
        const queryParams = new URLSearchParams({
          user_id: userId || "default_user",
          provider: provider || "all",
          start_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        });

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
        if (apiKey) headers["x-api-key"] = apiKey;

        const apiResponse = await fetch(`${targetUrl}/api/v1/biometrics?${queryParams}`, {
          method: "GET",
          headers
        });

        if (apiResponse.ok) {
          const remoteData = await apiResponse.json();
          return res.json({
            isSandbox: false,
            provider: provider || "unified",
            ...remoteData
          });
        } else {
          console.warn(`Open Wearables remote returned ${apiResponse.status}, falling back to standardized simulator`);
        }
      } catch (err) {
        console.error("Failed fetching live Open Wearables data: ", err);
      }
    }

    // High-Fidelity Sandbox Standard Generator adhering to Open Wearables developer specifications:
    // https://github.com/the-momentum/open-wearables
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const baseTime = now - oneDayMs;

    // 1. Activity data
    const activity = {
      provider: provider || "fitbit",
      date: new Date().toISOString().split("T")[0],
      steps: 8740,
      stepsGoal: 10000,
      calories: 2240, 
      activeMinutes: 52,
      distanceMeters: 6150,
      lastSync: new Date().toISOString()
    };

    // 2. Continuous Heart Rate Timeseries (96 points representing a 24h diurnal rhythm)
    const heartRateSeries = [];
    for (let i = 0; i < 96; i++) {
      const timeOffset = i * 15 * 60 * 1000; 
      const pointTime = new Date(baseTime + timeOffset);
      const hour = pointTime.getHours();
      
      let bpm = 68;
      if (hour >= 0 && hour < 6) {
        bpm = 58 + Math.round(Math.sin(i * 0.1) * 3); 
      } else if (hour >= 7 && hour < 10) {
        bpm = 75 + Math.round(Math.sin(i * 0.2) * 8); 
      } else if (hour >= 10 && hour < 14) {
        bpm = 68 + Math.round(Math.cos(i * 0.1) * 4); 
      } else if (hour >= 14 && hour < 16) {
        bpm = 112 + Math.round(Math.sin(i * 0.5) * 12); 
      } else if (hour >= 16 && hour < 22) {
        bpm = 72 + Math.round(Math.sin(i * 0.15) * 6);
      } else {
        bpm = 62 + Math.round(Math.cos(i * 0.1) * 3); 
      }

      heartRateSeries.push({
        timestamp: pointTime.getTime(),
        time: pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        value: bpm
      });
    }

    // 3. Sleep Session Data (Standard sleep architecture split)
    const sleep = {
      durationSeconds: 26100, 
      sleepScore: 82, 
      startTime: new Date(baseTime + 22.5 * 60 * 60 * 1000).toISOString(), 
      endTime: new Date(baseTime + 29.75 * 60 * 60 * 1000).toISOString(), 
      stagesSeconds: {
        deep: 5040,      
        light: 14760,    
        rem: 4500,       
        awake: 1800      
      }
    };

    // 4. Oxygen Saturation (SpO2) Trends
    const spo2Series = [];
    for (let i = 0; i < 24; i++) {
      const timeOffset = i * 60 * 60 * 1000;
      const pointTime = new Date(baseTime + timeOffset);
      const isSleeping = pointTime.getHours() < 6 || pointTime.getHours() >= 23;
      
      const basePercentage = isSleeping ? 95.8 : 98.2;
      const variation = Math.sin(i * 0.7) * 1.2;

      spo2Series.push({
        timestamp: pointTime.getTime(),
        time: pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        value: parseFloat((basePercentage + variation).toFixed(1))
      });
    }

    // 5. HRV (Heart Rate Variability, standard ms index)
    const hrv = {
      averageMs: 48,
      readings: Array.from({ length: 12 }, (_, idx) => ({
        time: `${String(idx * 2).padStart(2, "0")}:00`,
        value: Math.max(30, 48 + Math.round(Math.sin(idx * 1.3) * 11))
      }))
    };

    return res.json({
      isSandbox: true,
      provider: provider || "fitbit",
      userId: userId || "patient_dev",
      activity,
      heartRateSeries,
      sleep,
      spo2Series,
      hrv,
    });
  } catch (error: any) {
    console.error("Open Wearables sync error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch metrics from Open Wearables proxy." });
  }
});

app.post("/api/open-wearables/chat", async (req, res) => {
  try {
    const { message, chatHistory, biometrics } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!ai) {
      const lowerMessage = message.toLowerCase();
      const steps = biometrics?.activity?.steps || 8740;
      const stepsGoal = biometrics?.activity?.stepsGoal || 10000;
      const activeMins = biometrics?.activity?.activeMinutes || 52;
      const sleepScore = biometrics?.sleep?.sleepScore || 82;
      const deepMin = Math.round((biometrics?.sleep?.stagesSeconds?.deep || 5040) / 60);
      const remMin = Math.round((biometrics?.sleep?.stagesSeconds?.rem || 4500) / 60);
      const hrvVal = biometrics?.hrv?.averageMs || 48;
      const providerName = biometrics?.provider || "wearable";

      let replyText = "";

      if (lowerMessage.includes("sleep") || lowerMessage.includes("night") || lowerMessage.includes("cortisol") || lowerMessage.includes("dawn")) {
        replyText = `### Clinical Rest State Analysis (Open Wearables Standard: **${providerName.toUpperCase()}**)

Based on your overnight biometric stream, here is a detailed breakdown of your sleep architecture and metabolic implications:

1. **Restorative Sleep Cycles**:
   - Your sleep duration of **${Math.floor((biometrics?.sleep?.durationSeconds || 26100) / 3600)}h ${Math.round(((biometrics?.sleep?.durationSeconds || 26100) % 3600) / 60)}m** reached an overall **Sleep Score of ${sleepScore}/100**. This denotes stable, consolidated deep and REM blocks.
   - **Deep Sleep Stage (SWS)**: Your deep sleep logged **${deepMin} minutes** (~19% of your total sleep architecture). During slow-wave deep sleep, the autonomic nervous system shifts heavily into parasympathetic dominance.

2. **Metabolic Implications (Glycemic Homeostasis & Cortisol Control)**:
   - Achieving at least 60-90 minutes of deep slow-wave sleep is vital for metabolic restoration. It optimizes insulin sensitivity by minimizing nocturnal **cortisol secretion** (a major glucocorticoid which drives glycogenolysis).
   - Solid slow-wave architecture mitigates the severity of the **Dawn Phenomenon**—the physiological surge in blood glucose that often occurs between 4:00 AM and 8:00 AM driven by counter-regulatory hormones (cortisol, growth hormone).

3. **Autonomic Balance (HRV Index)**:
   - Your night-time Heart Rate Variability averaged **${hrvVal} ms**. This indicates robust vagal tone and healthy recovery of the autonomic nervous system, putting minimal strain on fasting insulin-resistance indices.

*💡 Clinical Sandbox stand-by response optimized for offline testing. Configure \`GEMINI_API_KEY\` in environment settings for live custom AI dialogue.*`;
      } else if (lowerMessage.includes("step") || lowerMessage.includes("exercise") || lowerMessage.includes("active") || lowerMessage.includes("insulin") || lowerMessage.includes("clearance")) {
        const burn = biometrics?.activity?.calories || 2240;
        replyText = `### Exertion & Insulin Response Evaluation (Open Wearables Standard: **${providerName.toUpperCase()}**)

Your daily activity stream indicates a powerful metabolic boost through physical loading:

1. **Cardiovascular & Physical Pacing**:
   - You have logged **${steps.toLocaleString()} steps** today out of your **${stepsGoal.toLocaleString()}** target, with **${activeMins} active minutes** of moderate-to-vigorous exertion. This represents beautiful metabolic power, yielding **${burn} kcal** of thermodynamic energy burn.

2. **Mechanism of Muscle-Mediated Glucose Clearance (GLUT4 Activation)**:
   - During continuous walking and physical activity, skeletal muscle contractions stimulate the migration of **GLUT4 glucose transporter proteins** directly to the cell membrane.
   - This process is entirely **insulin-independent**. It allows your muscles to clear circulating blood glucose directly from your bloodstream without requiring additional insulin secretion from the pancreas.
   - Immediate physiological response: This reduces post-prandial (post-meal) blood sugar excursions significantly and preserves long-term beta-cell function.

3. **Actionable Guidance**:
   - To maximize this clearance effect, distribute your **${activeMins} active minutes** throughout the day—specifically in short 10-15 minute "exercise snacks" within 30 minutes after completing principal meals.

*💡 Clinical Sandbox stand-by response optimized for offline testing. Configure \`GEMINI_API_KEY\` in environment settings for live custom AI dialogue.*`;
      } else {
        replyText = `### Unified Biometric Diagnostics (Open Wearables Standard: **${providerName.toUpperCase()}**)

Welcome! I have compiled your current raw wearable telemetry streams into a holistic glycemic and autonomic wellness audit:

1. **Restorative Sleep Architecture** (**Sleep Score: ${sleepScore}/100**):
   - You logged **${deepMin} minutes of Deep Sleep** and **${remMin} minutes of REM Sleep**. Restorative sleep directly minimizes circulating glucocorticoids (cortisol), preventing sharp morning liver-glucose dumps (Dawn Phenomenon protection).

2. **Cardiopulmonary & Physical Output** (**${steps.toLocaleString()} Steps / ${activeMins} Active Mins**):
   - Physical exertion drives non-insulin-mediated glucose transporter (GLUT4) translocation, allowing active tissues to clear post-meal glucose spikes directly from circulation.

3. **Autonomic Integrity** (**HRV Index: ${hrvVal} ms**):
   - A healthy average Heart Rate Variability suggests strong parasympathetic rebound, lower systemic baseline inflammation, and better insulin sensitivity profiles.

*💡 Clinical Sandbox stand-by response optimized for offline testing. To access bespoke live AI recommendations, please add the \`GEMINI_API_KEY\` environment identifier in your workspace setting.*`;
      }

      const updatedHistory = [
        ...(chatHistory || []),
        { role: "user", parts: [{ text: message }] },
        { role: "model", parts: [{ text: replyText }] }
      ];

      return res.json({
        text: replyText,
        history: updatedHistory
      });
    }

    const systemInstruction = `You are a clinical Open Wearables AI Companion specialized in metabolic stability and continuous biometric analysis (designed in partnership with The Momentum).
You help diabetic patients interpret continuous raw stream parameters (such as circadian heart rate fluctuations, sleep architecture REM/deep stages, daily walking targets, and overnight SpO2 trends).
When explaining telemetry data, link it clearly to diabetic or metabolic outcomes:
  - Explain how active steps (muscle contractions) improve immediate insulin sensitivity and lower post-meal glucose spikes.
  - Explain how deep sleep is critical for hormonal control (cortisol reduction) to mitigate fasting dawn-phenomenon glucose rises.
  - Keep your advice strictly clinical, encouraging, and highly professional. Refrain from claiming ultimate medical authority but give superb evidence-based clinical context. Format findings using neat bullet points and markdown.`;

    // Package the current biometrics as user background info
    const backgroundPrompt = biometrics 
      ? `[CURRENT NORMALIZED OPEN WEARABLES TELEMETRY]:
- Provider: ${biometrics.provider || "Unknown"}
- Activity: ${biometrics.activity?.steps || 0} steps of ${biometrics.activity?.stepsGoal || 10000} goal, ${biometrics.activity?.activeMinutes || 0} active minutes, ${biometrics.activity?.calories || 0} kcal burnt.
- Sleep Score: ${biometrics.sleep?.sleepScore || "N/A"}/100, SLEEP STAGES: Deep Sleep: ${Math.round((biometrics.sleep?.stagesSeconds?.deep || 0)/60)} min, REM Sleep: ${Math.round((biometrics.sleep?.stagesSeconds?.rem || 0)/60)} min, Light: ${Math.round((biometrics.sleep?.stagesSeconds?.light || 0)/60)} min.
- Heart Rate: resting minimum is ${Math.min(...(biometrics.heartRateSeries || [{value: 70}]).map((h: any) => h.value))} bpm, peak active is ${Math.max(...(biometrics.heartRateSeries || [{value: 110}]).map((h: any) => h.value))} bpm.
- SpO2 Average: ${((biometrics.spo2Series || []).reduce((acc: number, s: any) => acc + s.value, 0) / (biometrics.spo2Series || []).length || 97).toFixed(1)}%.
- Average Heart Rate Variability (HRV): ${biometrics.hrv?.averageMs || 48} ms.`
      : "[No active telemetry has been fetched yet. Prompt the user to sync their Open Wearables account.]";

    const fullMessage = `${backgroundPrompt}\n\nPatient Query: "${message}"`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
      },
      history: chatHistory || []
    });

    const result = await chat.sendMessage({ message: fullMessage });
    const updatedHistory = await chat.getHistory();

    res.json({
      text: result.text,
      history: updatedHistory
    });

  } catch (error: any) {
    console.error("Open Wearables AI Chat Error:", error);
    res.status(500).json({ error: error.message || "Failed running Open Wearables clinical AI diagnostics." });
  }
});

// API Dexcom Route 1: Token Exchange (OAuth proxy matching api-evangelist spec)
app.post("/api/dexcom/token", async (req, res) => {
  try {
    const { code, clientId, clientSecret, redirectUri, isSandbox } = req.body;
    
    const clientToUse = clientId || process.env.DEXCOM_CLIENT_ID;
    const secretToUse = clientSecret || process.env.DEXCOM_CLIENT_SECRET;

    if (isSandbox || !clientToUse) {
      // Return high-fidelity mock token if sandbox or no credentials provided
      return res.json({
        access_token: "mock_dexcom_api_evangelist_token_xyz123",
        expires_in: 28800,
        token_type: "Bearer",
        refresh_token: "mock_dexcom_refresh_token_abc789",
        isSandbox: true,
        message: "Synchronized with Simulated Dexcom OpenAPI environment successfully."
      });
    }

    const host = isSandbox ? "sandbox-api.dexcom.com" : "api.dexcom.com";
    const tokenUrl = `https://${host}/v2/oauth2/token`;

    const bodyParams = new URLSearchParams();
    bodyParams.append("client_id", clientToUse);
    bodyParams.append("client_secret", secretToUse);
    bodyParams.append("code", code);
    bodyParams.append("grant_type", "authorization_code");
    bodyParams.append("redirect_uri", redirectUri || "http://localhost:3000/api/dexcom/callback");

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: bodyParams.toString()
    });

    if (!response.ok) {
      const errorTxt = await response.text();
      throw new Error(`Dexcom Token Exchange Failed: ${errorTxt}`);
    }

    const tokenData = await response.json();
    return res.json({
      ...tokenData,
      isSandbox: false
    });
  } catch (error: any) {
    console.error("Dexcom API token error:", error);
    return res.status(500).json({ 
      error: error.message || "OAuth proxy failed.",
      isSandbox: true,
      message: "Automatically falling back to Simulated Sandbox authentication."
    });
  }
});

// API Dexcom Route 2: Fetch Estimated Glucose Values (matching github.com/api-evangelist/dexcom)
app.post("/api/dexcom/egvs", async (req, res) => {
  try {
    const { accessToken, isSandbox, startDate, endDate } = req.body;

    if (isSandbox || !accessToken || accessToken.startsWith("mock_")) {
      // Sandbox mode: Generate continuous glucose values matching Dexcom v3 schema exactly
      const now = new Date();
      const egvs = [];
      
      // Calculate start and end offset
      const itemsCount = 48; // generate 4 hours of readings, one point every 5 mins = 48 data points
      const baseTime = now.getTime() - itemsCount * 5 * 60 * 1000;

      const trends = ["doubleUp", "singleUp", "fortyFiveUp", "flat", "fortyFiveDown", "singleDown", "doubleDown"];

      for (let i = 0; i < itemsCount; i++) {
        const pointTime = new Date(baseTime + i * 5 * 60 * 1000);
        
        // Realistic continuous curve
        const progress = i / itemsCount;
        // Moderate glucose cycle going up and down
        let val = Math.round(112 + Math.sin(progress * Math.PI * 2.5) * 38);
        
        // Add minimal noise
        val += Math.round(Math.sin(i * 0.9) * 2);
        
        // Determine trend index relative to slope
        const slope = Math.cos(progress * Math.PI * 2.5);
        let trend = "flat";
        if (slope > 0.6) trend = "singleUp";
        else if (slope > 0.25) trend = "fortyFiveUp";
        else if (slope < -0.6) trend = "singleDown";
        else if (slope < -0.25) trend = "fortyFiveDown";

        // Convert times
        const systemTimeUTC = pointTime.toISOString();
        const displayTimeLocal = pointTime.toLocaleDateString() + "T" + pointTime.toLocaleTimeString([], { hour12: false });
        
        egvs.push({
          recordId: `gitspec_record_${100000 + i}`,
          systemTime: systemTimeUTC,
          displayTime: displayTimeLocal.replace(/\//g, "-"),
          value: Math.max(39, Math.min(401, val)),
          unit: "mg/dL",
          trend: trend,
          trendRate: parseFloat(slope.toFixed(2))
        });
      }

      return res.json({
        recordType: "egvs",
        recordVersion: "3.0",
        userId: "gitspec_sandbox_user",
        egvs: egvs,
        source: "api-evangelist/dexcom GitHub Spec (Mock Context)"
      });
    }

    // Real Dexcom API Call
    // Endpoint: GET https://sandbox-api.dexcom.com/v3/users/self/egvs
    // Headers: Authorization: Bearer <token>
    // Parameters: startDate, endDate
    const host = isSandbox ? "sandbox-api.dexcom.com" : "api.dexcom.com";
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    const egvsUrl = `https://${host}/v3/users/self/egvs?${queryParams.toString()}`;
    
    const response = await fetch(egvsUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Dexcom GET /v3/users/self/egvs failed: ${errTxt}`);
    }

    const payload = await response.json();
    return res.json({
      ...payload,
      source: `Official Dexcom ${isSandbox ? "Sandbox" : "Production"} Server`
    });
  } catch (error: any) {
    console.error("Dexcom API egvs retrieval error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch values from Dexcom EGV proxy." });
  }
});

// API Dexcom Route 3: Fetch Registered Devices (matching Dexcom v3 schema)
app.post("/api/dexcom/devices", async (req, res) => {
  try {
    const { accessToken, isSandbox } = req.body;

    if (isSandbox || !accessToken || accessToken.startsWith("mock_")) {
      return res.json({
        devices: [
          {
            deviceName: "Dexcom G7 Transmitter",
            transmitterId: "G7-TX-9876",
            softwareVersion: "2.5.1",
            serialNumber: "SN39482934",
            manufacturer: "Dexcom Inc.",
            modelNumber: "G7-M01"
          },
          {
            deviceName: "Dexcom Receiver G7",
            transmitterId: "G7-RX-5432",
            softwareVersion: "1.0.8",
            serialNumber: "SN58392019",
            manufacturer: "Dexcom Inc.",
            modelNumber: "G7-R03"
          }
        ],
        source: "api-evangelist/dexcom GitHub Spec (Mock Context)"
      });
    }

    const host = isSandbox ? "sandbox-api.dexcom.com" : "api.dexcom.com";
    const devicesUrl = `https://${host}/v3/users/self/devices`;
    
    const response = await fetch(devicesUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Dexcom GET /v3/users/self/devices failed: ${errTxt}`);
    }

    const payload = await response.json();
    return res.json({
      ...payload,
      source: `Official Dexcom ${isSandbox ? "Sandbox" : "Production"} Server`
    });
  } catch (error: any) {
    console.error("Dexcom API devices error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch devices from Dexcom proxy." });
  }
});

// API Dexcom Route 4: Fetch Calibration Logs (matching Dexcom v3 schema)
app.post("/api/dexcom/calibrations", async (req, res) => {
  try {
    const { accessToken, isSandbox, startDate, endDate } = req.body;

    if (isSandbox || !accessToken || accessToken.startsWith("mock_")) {
      const now = new Date();
      return res.json({
        calibrations: [
          {
            recordId: "cal_rec_45932",
            systemTime: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
            displayTime: new Date(now.getTime() - 24 * 3600 * 1000).toISOString().replace("Z", ""),
            value: 98,
            unit: "mg/dL",
            transmitterId: "G7-TX-9876"
          }
        ],
        source: "api-evangelist/dexcom GitHub Spec (Mock Context)"
      });
    }

    const host = isSandbox ? "sandbox-api.dexcom.com" : "api.dexcom.com";
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    const calibrationsUrl = `https://${host}/v3/users/self/calibrations?${queryParams.toString()}`;
    
    const response = await fetch(calibrationsUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Dexcom GET /v3/users/self/calibrations failed: ${errTxt}`);
    }

    const payload = await response.json();
    return res.json({
      ...payload,
      source: `Official Dexcom ${isSandbox ? "Sandbox" : "Production"} Server`
    });
  } catch (error: any) {
    console.error("Dexcom API calibrations error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch calibrations from Dexcom proxy." });
  }
});

// API Dexcom Route 5: Fetch Events (Insulin doses, carbohydrates, exercise) (matching Dexcom v3 schema)
app.post("/api/dexcom/events", async (req, res) => {
  try {
    const { accessToken, isSandbox, startDate, endDate } = req.body;

    if (isSandbox || !accessToken || accessToken.startsWith("mock_")) {
      const now = new Date();
      return res.json({
        events: [
          {
            recordId: "event_rec_91023",
            systemTime: new Date(now.getTime() - 10 * 3600 * 1000).toISOString(),
            displayTime: new Date(now.getTime() - 10 * 3600 * 1000).toISOString().replace("Z", ""),
            eventType: "insulin",
            eventSubType: "fastActing",
            value: "4.0",
            unit: "units"
          },
          {
            recordId: "event_rec_91024",
            systemTime: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
            displayTime: new Date(now.getTime() - 8 * 3600 * 1000).toISOString().replace("Z", ""),
            eventType: "carbs",
            eventSubType: "meal",
            value: "45",
            unit: "grams"
          },
          {
            recordId: "event_rec_91025",
            systemTime: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
            displayTime: new Date(now.getTime() - 4 * 3600 * 1000).toISOString().replace("Z", ""),
            eventType: "exercise",
            eventSubType: "light",
            value: "25",
            unit: "minutes"
          }
        ],
        source: "api-evangelist/dexcom GitHub Spec (Mock Context)"
      });
    }

    const host = isSandbox ? "sandbox-api.dexcom.com" : "api.dexcom.com";
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("startDate", startDate);
    if (endDate) queryParams.append("endDate", endDate);

    const eventsUrl = `https://${host}/v3/users/self/events?${queryParams.toString()}`;
    
    const response = await fetch(eventsUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Dexcom GET /v3/users/self/events failed: ${errTxt}`);
    }

    const payload = await response.json();
    return res.json({
      ...payload,
      source: `Official Dexcom ${isSandbox ? "Sandbox" : "Production"} Server`
    });
  } catch (error: any) {
    console.error("Dexcom API events error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch events from Dexcom proxy." });
  }
});

// API Dexcom Route 6: Data Range Checks (matching Dexcom v3 schema)
app.post("/api/dexcom/datarange", async (req, res) => {
  try {
    const { accessToken, isSandbox } = req.body;

    if (isSandbox || !accessToken || accessToken.startsWith("mock_")) {
      const now = new Date();
      return res.json({
        dataRange: {
          egvs: {
            start: {
              systemTime: new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString(),
              displayTime: "2026-05-04T00:00:00"
            },
            end: {
              systemTime: now.toISOString(),
              displayTime: "2026-06-03T23:59:59"
            }
          },
          events: {
            start: {
              systemTime: new Date(now.getTime() - 15 * 24 * 3600 * 1000).toISOString(),
              displayTime: "2026-05-19T00:00:00"
            },
            end: {
              systemTime: now.toISOString(),
              displayTime: "2026-06-03T23:59:59"
            }
          }
        },
        source: "api-evangelist/dexcom GitHub Spec (Mock Context)"
      });
    }

    const host = isSandbox ? "sandbox-api.dexcom.com" : "api.dexcom.com";
    const dataRangeUrl = `https://${host}/v3/users/self/dataRange`;
    
    const response = await fetch(dataRangeUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Dexcom GET /v3/users/self/dataRange failed: ${errTxt}`);
    }

    const payload = await response.json();
    return res.json({
      ...payload,
      source: `Official Dexcom ${isSandbox ? "Sandbox" : "Production"} Server`
    });
  } catch (error: any) {
    console.error("Dexcom API data range error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch data range from Dexcom proxy." });
  }
});

// API Glooko Route 1: Token Handshake (OAuth matching Glooko externalapi.glooko.com)
app.post("/api/glooko/token", async (req, res) => {
  try {
    const { code, clientId, clientSecret, redirectUri, isSandbox } = req.body;
    
    const clientToUse = clientId || process.env.GLOOKO_CLIENT_ID;
    const secretToUse = clientSecret || process.env.GLOOKO_CLIENT_SECRET;

    if (isSandbox || !clientToUse) {
      // High-fidelity Glooko mock token
      return res.json({
        access_token: "mock_glooko_external_api_token_abc555",
        expires_in: 3600,
        token_type: "Bearer",
        refresh_token: "mock_glooko_refresh_token_xyz999",
        isSandbox: true,
        message: "Synchronized with Simulated Glooko External OpenAPI Environment successfully."
      });
    }

    const tokenUrl = "https://externalapi.glooko.com/oauth/token";

    const bodyParams = new URLSearchParams();
    bodyParams.append("client_id", clientToUse);
    bodyParams.append("client_secret", secretToUse);
    bodyParams.append("code", code);
    bodyParams.append("grant_type", "authorization_code");
    if (redirectUri) {
      bodyParams.append("redirect_uri", redirectUri);
    }

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: bodyParams.toString()
    });

    if (!response.ok) {
      const errorTxt = await response.text();
      throw new Error(`Glooko Handshake Refused: ${errorTxt}`);
    }

    const tokenData = await response.json();
    return res.json({
      ...tokenData,
      isSandbox: false
    });
  } catch (error: any) {
    console.error("Glooko API token error:", error);
    return res.status(500).json({
      error: error.message || "Glooko OAuth handshake proxy failed.",
      isSandbox: true,
      message: "Automatically falling back to Simulated Sandbox authentication."
    });
  }
});

// API Glooko Route 2: Fetch Diabetes Readings (matching Glooko Patient Data specs)
app.post("/api/glooko/readings", async (req, res) => {
  try {
    const { accessToken, isSandbox, startDate, endDate } = req.body;

    if (isSandbox || !accessToken || accessToken.startsWith("mock_")) {
      // Mock Glooko clinical payload containing SMBG and CGM data streams
      const now = new Date();
      const readings = [];
      let daysCount = 3;
      if (startDate) {
        const parsedStart = new Date(startDate);
        if (!isNaN(parsedStart.getTime())) {
          const diffTime = Math.abs(now.getTime() - parsedStart.getTime());
          daysCount = Math.min(14, Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));
        }
      }

      // Generate a comprehensive set of readings for the past 3 days
      for (let dayOffset = daysCount - 1; dayOffset >= 0; dayOffset--) {
        const dayTime = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
        const dateStr = dayTime.toISOString().split("T")[0];

        // 1. SMBG discrete finger-pricks (Self-Monitored Blood Glucose)
        // 4 standard checks per day: Breakfast, Lunch, Dinner, Bedtime
        const meals = [
          { time: "07:30", type: "fasting", label: "Fasting Breakfast Check", baseVal: 95 },
          { time: "12:15", type: "post_fasting", label: "Pre-lunch Check", baseVal: 110 },
          { time: "18:30", type: "post_fasting", label: "Pre-dinner Check", baseVal: 105 },
          { time: "22:00", type: "fasting", label: "Bedtime Check", baseVal: 120 }
        ];

        meals.forEach((meal, mealIdx) => {
          // Add some glycemic drift based on dayOffset and index
          const randomDrift = Math.round(Math.sin(dayOffset * 1.5 + mealIdx) * 12);
          const val = meal.baseVal + randomDrift;
          readings.push({
            id: `glooko_smbg_${dateStr.replace(/-/g, "")}_${mealIdx}`,
            type: "smbg",
            timestamp: new Date(`${dateStr}T${meal.time}:00`).toISOString(),
            value: Math.max(40, Math.min(350, val)),
            unit: "mg/dL",
            readingType: meal.type,
            notes: `${meal.label} logged via Glooko Remote Patient Monitoring`
          });
        });

        // 2. Continuous flow (synthetic hourly sensor values)
        for (let hour = 0; hour < 24; hour += 1) {
          const progress = hour / 24;
          const wave = Math.sin(progress * Math.PI * 2.5) * 35;
          const val = Math.round(112 + wave + Math.cos(hour * 0.8) * 8);
          
          readings.push({
            id: `glooko_cgm_${dateStr.replace(/-/g, "")}_${hour}`,
            type: "cgm",
            timestamp: new Date(`${dateStr}T${hour.toString().padStart(2, "0")}:00:00`).toISOString(),
            value: Math.max(40, Math.min(380, val)),
            unit: "mg/dL",
            readingType: hour < 8 ? "fasting" : "post_fasting",
            notes: "Glooko Telemetry CGM auto-stream"
          });
        }
      }

      return res.json({
        recordType: "glooko_patients_data",
        schemaVersion: "1.0",
        patients: [
          {
            patientId: "glooko_pat_99824",
            name: "Simulated Glooko User",
            readings: readings
          }
        ],
        source: "glooko External OpenAPI Spec (Mock Context)"
      });
    }

    // Real Glooko API fetch
    const url = `https://externalapi.glooko.com/v1/patients/data?startDate=${startDate || ""}&endDate=${endDate || ""}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json"
      }
    });

    if (!response.ok) {
      const errTxt = await response.text();
      throw new Error(`Glooko GET /v1/patients/data failed: ${errTxt}`);
    }

    const payload = await response.json();
    return res.json({
      ...payload,
      source: "Official Glooko Enterprise Server (externalapi.glooko.com)"
    });
  } catch (error: any) {
    console.error("Glooko readings retrieval error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch values from Glooko External API proxy." });
  }
});

// API Route 2: Analyze Medicine Details & Safety
app.post("/api/analyze-medicine", async (req, res) => {
  try {
    const { medicineName, searchType } = req.body;
    if (!medicineName) {
      return res.status(400).json({ error: "Medicine name is required" });
    }

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API configuration is missing. Please add your GEMINI_API_KEY in the Secrets panel.",
      });
    }

    const queryPrompt = `Provide comprehensive, professional medical information about the diabetes or relevant general medicine: "${medicineName}".
The search request parameter details type is "${searchType || "General Information"}".
Structure the response to include the following detailed segments:
1. "description": A concise medical description of what this medicine is and how it works.
2. "purpose": Why it is prescribed (e.g. Type 1 vs Type 2 diabetes control).
3. "typicalDosage": Typical administration timing, especially in relation to fasting or post-fasting glucose monitoring (e.g., take with first bite, take before breakfast, etc.).
4. "fastingImpact": Very specific explanation of how it affects fasting and post-fasting blood sugar levels, and potential risk of hypoglycemia.
5. "commonSideEffects": List of common side effects.
6. "dietaryInteractions": Essential food or drink interactions (e.g. alcohol, carb loading).
7. "warnings": Bold warning safety signs the patient should look out for (e.g. symptoms of lactic acidosis for metformin, severe low blood sugar).
Include a clear, bold medical disclaimer at the top stating that this is AI-guided information and should always be cross-referenced with their treating physician.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: queryPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            disclaimer: { type: Type.STRING, description: "A standard, mandatory medical disclaimer." },
            description: { type: Type.STRING, description: "Description of the drug and its class." },
            purpose: { type: Type.STRING, description: "Primary purpose of the medicine." },
            typicalDosage: { type: Type.STRING, description: "Typical dosage guidelines and meal timing relation." },
            fastingImpact: { type: Type.STRING, description: "Hypoglycemia risk, fasting versus post-meal implications." },
            commonSideEffects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of common side effects." },
            dietaryInteractions: { type: Type.STRING, description: "Key food, beverages, or supplement interactions." },
            warnings: { type: Type.STRING, description: "Critical warnings and extreme symptoms to look out for." },
          },
          required: [
            "disclaimer",
            "description",
            "purpose",
            "typicalDosage",
            "fastingImpact",
            "commonSideEffects",
            "dietaryInteractions",
            "warnings"
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error analyzing medicine:", error);
    res.status(500).json({ error: error.message || "An error occurred while fetching medical information." });
  }
});

// API Route 2.5: Customize Cultural Dish for Low-Glycemic Diabetes Control
app.post("/api/customize-diet-dish", async (req, res) => {
  try {
    const { dishName, region, dietaryGoal } = req.body;
    if (!dishName) {
      return res.status(400).json({ error: "Dish name is required" });
    }

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is missing. Please add GEMINI_API_KEY to start using the smart diet customizer.",
      });
    }

    const customizationPrompt = `You are an expert Diabetes Clinical Nutritionist. A user wants to safely consume their classic, traditional cultural dish: "${dishName}", belonging to the culture/region profile: "${region || "Global"}".
Our clinical goal is to adapt this recipe to fit their selected target health goal: "${dietaryGoal || "Low-glycemic and High-fiber"}".

Structure your advice to be fully low-glycemic, clinical, and helpful.
Provide a JSON response with the following fields:
1. "originalDish": The name of the input dish.
2. "region": The cultural region.
3. "whyItSpikes": Clear, empathetic explanation of why the traditional version tends to spike blood sugar rapidly (e.g., fast starches, refined oils).
4. "diabeticSubstitutions": Array of items with 'traditionalIngredient', 'healthyAlternative', and 'why' explaining the clinical benefits of the swap.
5. "modifiedRecipe": An object containing:
   - "prepTime": preparation time estimate (e.g., "15 mins").
   - "cookTime": cooking time estimate (e.g., "30 mins").
   - "ingredients": Array of strings representing the modified, diabetes-friendly ingredients.
   - "instructions": Array of strings representing step-by-step cooking steps.
6. "glycemicCheckNote": A final concise tip on how this modified dish aligns with target fasting levels or insulin action (e.g. 'This contains active soluble fiber which delays stomach emptying. Ideal for post-lunch stability').`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: customizationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            originalDish: { type: Type.STRING },
            region: { type: Type.STRING },
            whyItSpikes: { type: Type.STRING },
            diabeticSubstitutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  traditionalIngredient: { type: Type.STRING },
                  healthyAlternative: { type: Type.STRING },
                  why: { type: Type.STRING },
                },
                required: ["traditionalIngredient", "healthyAlternative", "why"],
              },
            },
            modifiedRecipe: {
              type: Type.OBJECT,
              properties: {
                prepTime: { type: Type.STRING },
                cookTime: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["prepTime", "cookTime", "ingredients", "instructions"],
            },
            glycemicCheckNote: { type: Type.STRING },
          },
          required: [
            "originalDish",
            "region",
            "whyItSpikes",
            "diabeticSubstitutions",
            "modifiedRecipe",
            "glycemicCheckNote",
          ],
        },
      },
    });

    const parsedRecipe = JSON.parse(response.text || "{}");
    res.json(parsedRecipe);
  } catch (error: any) {
    console.error("Error customizing dish:", error);
    res.status(500).json({ error: error.message || "An error occurred while customizing your cultural diet program." });
  }
});

// API Route 3: Surveillance Smart Log Insights
app.post("/api/surveillance-insights", async (req, res) => {
  try {
    const { readings, userProfile } = req.body;
    if (!readings || !Array.isArray(readings) || readings.length === 0) {
      return res.json({
        summary: "No blood glucose readings found to analyze. Please log some fasting or post-fasting measurements first.",
        alerts: [],
        recommendations: ["Log regular blood sugar levels.", "Ensure you note the timing of readings (fasting vs. post-meal)."],
      });
    }

    if (!ai) {
      return res.status(503).json({
        error: "Gemini API key is missing. Please add GEMINI_API_KEY to start using smart health insights.",
      });
    }

    const readingsSummary = readings
      .slice(-15) // Keep last 15 for analysis context
      .map(
        (r) =>
          `- ${r.date} ${r.time}: ${r.type === "fasting" ? "Fasting" : "Post-Fasting (After Meal)"} Blood Sugar: ${r.value} mg/dL. Notes: ${r.notes || "None"}`
      )
      .join("\n");

    const profileSummary = userProfile
      ? `Age: ${userProfile.age || "N/A"}, Diabetes Type: ${userProfile.diabetesType || "N/A"}, Medications: ${userProfile.medications || "N/A"}, Target Fasting: ${userProfile.targetFastingMin || 70}-${userProfile.targetFastingMax || 130} mg/dL, Target Post-Fasting: ${userProfile.targetPostMin || 100}-${userProfile.targetPostMax || 180} mg/dL.`
      : "N/A";

    const insightPrompt = `You are an expert Diabetes Surveillance Assistant. Analyze the customer's blood glucose logs and profile below. Provide professional surveillance feedback.
USER PROFILE:
${profileSummary}

RECENT GLUCOSE LOGS (Fasting & Post-Fasting):
${readingsSummary}

Perform surveillance and provide feedback using JSON.
Identify:
1. "summary": Structured conversational analysis of their glucose control (such as overall trends, average fasting, average post-fasting levels, comparison against standard targets, and whether their levels fluctuate significantly).
2. "alerts": High-priority alerts if they have multiple hyper/hypoglycemia anomalies, or trends going in dangerous directions (e.g. persistently rising morning fasting sugar).
3. "recommendations": Professional lifestyle, logging frequency, hydration, and medication timing habits they could discuss with their doctor. Always reference specific patterns found in their logs.
Always include a clear medical disclaimer reminding the user that this does not constitute medical advice or substitute a real-time doctor's visit.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: insightPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            disclaimer: { type: Type.STRING, description: "Professional medical disclaimer." },
            summary: { type: Type.STRING, description: "Conversational synthesis of the blood sugar logs and overall glycemic variability." },
            alerts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of serious glucose levels alerts or negative trends spotted in the metrics." },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific steps, lifestyle habits, or testing adjustment ideas to ask their doctor." },
          },
          required: ["disclaimer", "summary", "alerts", "recommendations"],
        },
      },
    });

    const recommendationData = JSON.parse(response.text || "{}");
    res.json(recommendationData);
  } catch (error: any) {
    console.error("Error analyzing blood glucose logs:", error);
    res.status(500).json({ error: error.message || "An error occurred while generating insights." });
  }
});

// Configure Vite middleware for development
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up development server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production files from dist/");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express medical server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
