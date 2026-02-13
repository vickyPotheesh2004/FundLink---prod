const functions = require("firebase-functions");
const express = require("express");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());

// Note: In Cloud Functions, static files are served by Firebase Hosting, NOT Express.
// But valid API routes must be handled here.

// --- Core API Routes (Deterministic) ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mode: 'DEMO-CLOUD' });
});

// Mock AI Analysis Endpoint
app.post('/api/ai/analyze', (req, res) => {
    // Simulate processing time
    setTimeout(() => {
        res.json({
            success: true,
            data: {
                score: 78,
                risks: ["Market saturation", "High burn rate"],
                thesis: "Technically sound but commercially risky."
            }
        });
    }, 1500);
});

// Export the Express app as a Cloud Function called 'api'
exports.api = functions.https.onRequest(app);
