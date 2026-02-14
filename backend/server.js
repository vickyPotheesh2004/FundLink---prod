/**
 * FundLink Backend Server
 * Production-ready Express.js server with security middleware
 */

// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const PORT = process.env.PORT || 3000;

// Environment validation
const requiredEnvVars = [];
const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);
if (missingEnvVars.length > 0) {
    console.warn(`[Server] Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
}

// CORS Configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400 // 24 hours
};

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://api.openai.com", "https://generativelanguage.googleapis.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' })); // Increased limit for pitch deck data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip} - RequestID: ${requestId}`);
    next();
});

// Serve root as static - Adjusted for Cloud Functions environment if needed
app.use(express.static(path.join(__dirname, '../')));

// --- Request Validation Middleware ---
const validateRequest = (req, res, next) => {
    // Check content type for POST requests
    if (req.method === 'POST' && !req.is('application/json')) {
        return res.status(415).json({
            success: false,
            error: 'Content-Type must be application/json'
        });
    }

    // Check for required headers
    if (req.path.startsWith('/api/') && req.method === 'POST') {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Request body is required'
            });
        }
    }

    next();
};

// Apply validation to API routes
app.use('/api/', validateRequest);

// --- Core API Routes ---

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        mode: process.env.AI_PROVIDER || 'demo',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// AI Routes
const aiController = require('./controllers/aiController');

// AI Analysis Endpoint - Evaluates startup readiness
app.post('/api/ai/analyze', aiController.evaluateReadiness);

// Senior Analyst Report Endpoint - Generates due diligence report
app.post('/api/ai/report', aiController.generateSeniorAnalystReport);

// Match Score Endpoint - Calculates startup-investor compatibility
app.post('/api/ai/match', aiController.calculateMatch);

// AI Status Endpoint - Returns configuration status (for admin)
app.get('/api/ai/status', aiController.getStatus);

// --- Error Handling Middleware ---

// 404 handler for API routes
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[Server] Unhandled error:', err);

    // Don't expose internal errors in production
    const isDev = process.env.NODE_ENV !== 'production';

    res.status(err.status || 500).json({
        success: false,
        error: isDev ? err.message : 'Internal server error',
        ...(isDev && { stack: err.stack })
    });
});

// Fallback for SPA routing
app.get('*', (req, res) => {
    // Check if it's an API call that wasn't caught
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            error: 'Endpoint not found'
        });
    }
    // Default to SPA index
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Only listen if not running in Cloud Functions (detected via exports)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    FundLink Server Started                   ║
╠══════════════════════════════════════════════════════════════╣
║  URL:  http://localhost:${PORT}                                 ║
║  Mode: ${process.env.AI_PROVIDER || 'demo'}                                              ║
║  Time: ${new Date().toISOString()}              ║
╚══════════════════════════════════════════════════════════════╝
        `);
    });
}

module.exports = app;
