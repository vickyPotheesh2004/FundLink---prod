const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
// Serve root as static - Adjusted for Cloud Functions environment if needed, 
// but local serving still works.
app.use(express.static(path.join(__dirname, '../')));

// --- Core API Routes (Deterministic) ---

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mode: 'DEMO' });
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

// Fallback for SPA routing (if needed, though mostly static here)
app.get('*', (req, res) => {
    // Check if it's an API call
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
    }
    // Default to landing page or specific file if exists
    res.sendFile(path.join(__dirname, '../frontend/fundlink_public_landing_page.html'));
});

// Only listen if not running in Cloud Functions (detected via exports)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`FundLink Demo Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;
