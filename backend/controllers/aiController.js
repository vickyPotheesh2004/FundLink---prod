/**
 * AI Controller
 * Handles "Senior Business Analyst" AI logic with production-ready LLM integration.
 * Supports OpenAI, Google Gemini, and demo mode fallback.
 */

// Configuration - In production, these should be environment variables
const AI_CONFIG = {
    provider: process.env.AI_PROVIDER || 'demo', // 'openai', 'gemini', or 'demo'
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    },
    rateLimit: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: parseInt(process.env.AI_RATE_LIMIT) || 20
    }
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map();

/**
 * Check rate limit for a client
 * @param {string} clientId - Client identifier (IP or user ID)
 * @returns {Object} Rate limit status
 */
function checkRateLimit(clientId = 'default') {
    const now = Date.now();
    const windowStart = now - AI_CONFIG.rateLimit.windowMs;

    // Get or create client record
    let clientRecord = rateLimitStore.get(clientId);
    if (!clientRecord || clientRecord.windowStart < windowStart) {
        clientRecord = { count: 0, windowStart: now };
    }

    // Check limit
    if (clientRecord.count >= AI_CONFIG.rateLimit.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetIn: clientRecord.windowStart + AI_CONFIG.rateLimit.windowMs - now
        };
    }

    // Increment and store
    clientRecord.count++;
    rateLimitStore.set(clientId, clientRecord);

    return {
        allowed: true,
        remaining: AI_CONFIG.rateLimit.maxRequests - clientRecord.count,
        resetIn: clientRecord.windowStart + AI_CONFIG.rateLimit.windowMs - now
    };
}

/**
 * Simulated latency helper for demo mode
 * @param {number} ms - Milliseconds to wait
 */
const simulateLatency = (ms = 1500) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Validate pitch data input
 * @param {Object} pitchData - Pitch data to validate
 * @returns {Object} Validation result
 */
function validatePitchData(pitchData) {
    const errors = [];
    const warnings = [];

    if (!pitchData || typeof pitchData !== 'object') {
        errors.push('Invalid pitch data format');
        return { valid: false, errors, warnings };
    }

    // Check required fields
    if (!pitchData.description || pitchData.description.trim().length < 10) {
        warnings.push('Description is too short for meaningful analysis');
    }

    // Check for potentially harmful content (basic sanitization)
    const suspiciousPatterns = [
        /<script\b/i,
        /javascript:/i,
        /on\w+\s*=/i
    ];

    const dataString = JSON.stringify(pitchData);
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(dataString)) {
            errors.push('Invalid content detected');
            break;
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Generate system prompt for readiness analysis
 * @param {Object} pitchData - Pitch data
 * @returns {string} System prompt
 */
function generateReadinessPrompt(pitchData) {
    return `You are a Senior Business Analyst AI for FundLink, a venture capital matchmaking platform. 
Analyze the following startup pitch and provide a comprehensive readiness assessment.

PITCH DATA:
${JSON.stringify(pitchData, null, 2)}

Respond with a JSON object containing:
1. "score" (0-100): Overall investor readiness score
2. "status": Either "INVESTOR_READY" (score > 70) or "NEEDS_WORK"
3. "analysis": Object containing:
   - "strengths": Array of 3-5 key strengths
   - "weaknesses": Array of 3-5 areas for improvement
   - "gap_analysis": Object with "critical" and "recommended" arrays
   - "next_steps": Array of 3-5 actionable recommendations

Be objective, specific, and actionable. Focus on investor-relevant metrics.`;
}

/**
 * Generate system prompt for senior analyst report
 * @param {string} startupId - Startup identifier
 * @param {Object} startupData - Startup data (if available)
 * @returns {string} System prompt
 */
function generateReportPrompt(startupId, startupData = {}) {
    return `You are a Senior Investment Analyst at a top-tier VC firm. 
Generate a comprehensive due diligence report for startup ID: ${startupId}

AVAILABLE DATA:
${JSON.stringify(startupData, null, 2)}

Respond with a JSON object containing:
1. "meta": Object with type, author, timestamp, classification
2. "executive_framing": Object with problem_statement, solution_thesis, roi_projection
3. "strategic_diagnosis": Object with market_context, pestel_analysis, swot, gap_analysis
4. "financial_risk_assessment": Object with financials and risk_matrix array
5. "implementation_governance": Object with roadmap array and raci
6. "final_verdict": Object with decision ("INVEST", "PASS", or "WATCH_LIST") and rationale

Be thorough, professional, and investment-focused.`;
}

/**
 * Call OpenAI API
 * @param {string} prompt - System prompt
 * @param {string} content - User content
 * @returns {Promise<Object>} API response
 */
async function callOpenAI(prompt, content = '') {
    if (!AI_CONFIG.openai.apiKey) {
        throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`
        },
        body: JSON.stringify({
            model: AI_CONFIG.openai.model,
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: content || 'Analyze this startup.' }
            ],
            max_tokens: AI_CONFIG.openai.maxTokens,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

/**
 * Call Google Gemini API
 * @param {string} prompt - System prompt
 * @param {string} content - User content
 * @returns {Promise<Object>} API response
 */
async function callGemini(prompt, content = '') {
    if (!AI_CONFIG.gemini.apiKey) {
        throw new Error('Gemini API key not configured');
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.gemini.model}:generateContent?key=${AI_CONFIG.gemini.apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${prompt}\n\n${content || 'Analyze this startup.'}`
                    }]
                }],
                generationConfig: {
                    response_mime_type: 'application/json'
                }
            })
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(textContent);
}

/**
 * Generate demo readiness response
 * @param {Object} pitchData - Pitch data
 * @returns {Object} Demo response
 */
function generateDemoReadinessResponse(pitchData) {
    const descriptionLength = pitchData?.description?.length || 0;
    const hasTeam = pitchData?.team && Object.keys(pitchData.team).length > 0;
    const hasFinancials = pitchData?.financials && Object.keys(pitchData.financials).length > 0;
    const hasMarket = pitchData?.marketSize || pitchData?.tam;

    // Calculate score based on available data
    let score = 35; // Base score
    if (descriptionLength > 50) score += 10;
    if (descriptionLength > 150) score += 10;
    if (descriptionLength > 300) score += 5;
    if (hasTeam) score += 15;
    if (hasFinancials) score += 15;
    if (hasMarket) score += 10;
    score = Math.min(score, 92);

    return {
        score: score,
        status: score > 70 ? 'INVESTOR_READY' : 'NEEDS_WORK',
        analysis: {
            strengths: [
                "Clear problem identification in pitch",
                hasTeam ? "Team structure defined" : "Opportunity for team expansion",
                hasMarket ? "Market size articulated" : "Market opportunity to be detailed",
                "Foundational business model outlined"
            ].filter(s => s),
            weaknesses: [
                !hasFinancials ? "Financial projections need development" : "Financial model requires validation",
                "Go-to-market strategy could be more detailed",
                !hasTeam ? "Team completeness needs attention" : "Team track record to be highlighted",
                "Unit economics require clarification"
            ].filter(w => w),
            gap_analysis: {
                critical: [
                    "Detailed 18-month financial projections",
                    "Customer acquisition cost (CAC) analysis",
                    "Monthly burn rate and runway calculation"
                ],
                recommended: [
                    "Competitive landscape mapping",
                    "Key partnership strategy",
                    "Regulatory compliance assessment"
                ]
            },
            next_steps: [
                "Complete financial model with 3 scenarios",
                "Define CAC and LTV targets by segment",
                "Prepare investor deck with clear ask",
                "Document team credentials and advisors",
                "Create milestone-based roadmap"
            ]
        },
        _meta: {
            demo: true,
            provider: 'demo',
            generatedAt: new Date().toISOString()
        }
    };
}

/**
 * Generate demo senior analyst report
 * @param {string} startupId - Startup identifier
 * @returns {Object} Demo report
 */
function generateDemoReport(startupId) {
    return {
        meta: {
            type: "SENIOR_BA_DUE_DILIGENCE",
            author: "FundLink AI (Senior Business Analyst Mode)",
            timestamp: new Date().toISOString(),
            classification: "CONFIDENTIAL",
            startupId: startupId,
            demo: true
        },
        executive_framing: {
            problem_statement: "Legacy infrastructure in target sector causes 30% efficiency loss, creating opportunity for technology-enabled disruption.",
            solution_thesis: "AI-driven orchestration layer reduces operational latency by 40% based on pilot program results.",
            roi_projection: "Projected 3.5x ROI within 24 months based on current trajectory and market conditions."
        },
        strategic_diagnosis: {
            market_context: "Sector is consolidating. First-mover advantage is eroding; execution speed is now the primary differentiator.",
            pestel_analysis: {
                political: "Neutral. No immediate regulatory threats identified.",
                economic: "Favorable. Enterprise spend on automation is up 15% YoY.",
                social: "High adoption readiness among target workforce demographic.",
                technological: "Core IP appears defensible but requires rapid iteration to maintain edge.",
                environmental: "Low direct impact. ESG considerations minimal.",
                legal: "Data privacy compliance (GDPR/CCPA) is a critical path item."
            },
            swot: {
                strengths: [
                    "Proprietary algorithm with demonstrated results",
                    "Low churn rate (<2%) indicating product-market fit",
                    "Experienced technical leadership"
                ],
                weaknesses: [
                    "High customer acquisition cost relative to LTV",
                    "Sales team capacity constraints",
                    "Limited brand equity in enterprise segment"
                ],
                opportunities: [
                    "Expansion into adjacent verticals (FinTech, Healthcare)",
                    "Strategic partnership with enterprise platforms",
                    "Geographic expansion to underserved markets"
                ],
                threats: [
                    "Big tech entry into the space",
                    "Talent scarcity in specialized AI roles",
                    "Economic downturn impact on enterprise budgets"
                ]
            },
            gap_analysis: {
                as_is: "Manual workflows, high error rate, siloed data systems.",
                to_be: "Fully automated decision engine with real-time insights.",
                action_plan: "Hire VP of Sales, Certify Security Protocols, Scale Server Infrastructure."
            }
        },
        financial_risk_assessment: {
            financials: {
                burn_rate: "High (4 months runway remaining)",
                unit_economics: "LTV/CAC: 1.5x (Target: 3x)",
                npv_projection: "$4.2M (5-year horizon)",
                irr: "22% (Estimated)"
            },
            risk_matrix: [
                { category: "Market", risk: "Competitor Price War", probability: "Medium", impact: "High", mitigation: "Focus on premium enterprise segment with sticky contracts." },
                { category: "Operational", risk: "Key Person Risk (Founder)", probability: "Low", impact: "Critical", mitigation: "Key man insurance & equity vesting schedule." },
                { category: "Technical", risk: "Model Hallucination", probability: "Medium", impact: "High", mitigation: "Human-in-the-loop validation layer implementation." },
                { category: "Financial", risk: "Runway Extension", probability: "Medium", impact: "High", mitigation: "Bridge round preparation and cost optimization." }
            ]
        },
        implementation_governance: {
            roadmap: [
                { phase: "Q1", milestone: "Security Audit & SOC2 Compliance Initiation" },
                { phase: "Q2", milestone: "Scale Sales Team to 5 FTEs" },
                { phase: "Q3", milestone: "Series A Fundraising Closure" },
                { phase: "Q4", milestone: "Geographic Expansion Planning" }
            ],
            raci: {
                accountable: "CEO",
                responsible: "CTO / Product Lead",
                consulted: "Board / Advisors",
                informed: "All Hands / Team"
            }
        },
        final_verdict: {
            decision: "WATCH_LIST",
            rationale: "Technically superior solution but commercially immature. Re-evaluate in 3 months once unit economics improve and sales team scaling is demonstrated."
        }
    };
}

/**
 * Evaluate startup readiness
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.evaluateReadiness = async (req, res) => {
    const clientId = req.ip || req.headers['x-forwarded-for'] || 'default';

    try {
        // Check rate limit
        const rateLimit = checkRateLimit(clientId);
        if (!rateLimit.allowed) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil(rateLimit.resetIn / 1000)
            });
        }

        // Add rate limit headers
        res.set('X-RateLimit-Remaining', rateLimit.remaining);
        res.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetIn / 1000));

        const pitchData = req.body;
        console.log('[AI Controller] Analyzing pitch for client:', clientId);

        // Validate input
        const validation = validatePitchData(pitchData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validation.errors
            });
        }

        // Log warnings
        if (validation.warnings.length > 0) {
            console.warn('[AI Controller] Validation warnings:', validation.warnings);
        }

        let response;
        const provider = AI_CONFIG.provider;

        if (provider === 'openai') {
            // OpenAI integration
            const prompt = generateReadinessPrompt(pitchData);
            response = await callOpenAI(prompt, JSON.stringify(pitchData));
            response._meta = { provider: 'openai', generatedAt: new Date().toISOString() };
        } else if (provider === 'gemini') {
            // Gemini integration
            const prompt = generateReadinessPrompt(pitchData);
            response = await callGemini(prompt, JSON.stringify(pitchData));
            response._meta = { provider: 'gemini', generatedAt: new Date().toISOString() };
        } else {
            // Demo mode with simulated latency
            await simulateLatency(1500);
            response = generateDemoReadinessResponse(pitchData);
        }

        console.log('[AI Controller] Analysis complete. Score:', response.score);
        res.json({ success: true, data: response });

    } catch (error) {
        console.error('[AI Controller] Error:', error);

        // Fallback to demo on API error
        if (AI_CONFIG.provider !== 'demo') {
            console.log('[AI Controller] Falling back to demo mode');
            const response = generateDemoReadinessResponse(req.body);
            return res.json({
                success: true,
                data: response,
                _fallback: true,
                _error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'AI Analysis Failed',
            message: error.message
        });
    }
};

/**
 * Generate Senior Analyst Report
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.generateSeniorAnalystReport = async (req, res) => {
    const clientId = req.ip || req.headers['x-forwarded-for'] || 'default';

    try {
        // Check rate limit
        const rateLimit = checkRateLimit(clientId);
        if (!rateLimit.allowed) {
            return res.status(429).json({
                success: false,
                error: 'Rate limit exceeded',
                retryAfter: Math.ceil(rateLimit.resetIn / 1000)
            });
        }

        // Add rate limit headers
        res.set('X-RateLimit-Remaining', rateLimit.remaining);
        res.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetIn / 1000));

        const { startupId, startupData } = req.body;

        if (!startupId) {
            return res.status(400).json({
                success: false,
                error: 'Startup ID is required'
            });
        }

        console.log('[AI Controller] Generating Report for:', startupId);

        let report;
        const provider = AI_CONFIG.provider;

        if (provider === 'openai') {
            const prompt = generateReportPrompt(startupId, startupData);
            report = await callOpenAI(prompt);
            report._meta = { provider: 'openai', generatedAt: new Date().toISOString() };
        } else if (provider === 'gemini') {
            const prompt = generateReportPrompt(startupId, startupData);
            report = await callGemini(prompt);
            report._meta = { provider: 'gemini', generatedAt: new Date().toISOString() };
        } else {
            // Demo mode with simulated latency
            await simulateLatency(2500);
            report = generateDemoReport(startupId);
        }

        console.log('[AI Controller] Report generated for:', startupId);
        res.json({ success: true, data: report });

    } catch (error) {
        console.error('[AI Controller] Error:', error);

        // Fallback to demo on API error
        if (AI_CONFIG.provider !== 'demo') {
            console.log('[AI Controller] Falling back to demo mode');
            const report = generateDemoReport(req.body.startupId);
            return res.json({
                success: true,
                data: report,
                _fallback: true,
                _error: error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Report Generation Failed',
            message: error.message
        });
    }
};

/**
 * Calculate match score between startup and investor
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.calculateMatch = async (req, res) => {
    try {
        const { startup, investor } = req.body;

        if (!startup || !investor) {
            return res.status(400).json({
                success: false,
                error: 'Both startup and investor data are required'
            });
        }

        console.log('[AI Controller] Calculating match score');

        // Calculate match score
        let score = 50;
        const reasons = [];
        const warnings = [];

        // Domain matching
        const startupDomain = (startup.domain || '').toLowerCase();
        const investorDomains = (investor.domains || investor.focusDomains || []).map(d => d.toLowerCase());
        const domainMatch = investorDomains.some(d => d.includes(startupDomain) || startupDomain.includes(d));

        if (domainMatch) {
            score += 20;
            reasons.push('Domain alignment detected');
        }

        // Stage matching
        const startupStage = (startup.stage || '').toLowerCase();
        const investorStages = (investor.stages || investor.preferredStages || []).map(s => s.toLowerCase());
        const stageMatch = investorStages.some(s => s === startupStage ||
            (startupStage.includes('seed') && s.includes('seed')));

        if (stageMatch) {
            score += 15;
            reasons.push('Stage alignment confirmed');
        }

        // Ticket size matching
        if (startup.ticketSize && investor.ticketSize) {
            score += 10;
            reasons.push('Investment size compatible');
        }

        // Location matching
        if (startup.location && investor.preferredLocations) {
            if (investor.preferredLocations.includes(startup.location)) {
                score += 5;
                reasons.push('Location preference match');
            }
        }

        // Cap score
        score = Math.min(score, 98);

        res.json({
            success: true,
            data: {
                matchScore: score,
                fitLevel: score >= 80 ? 'HIGH' : score >= 60 ? 'MEDIUM' : 'LOW',
                alignment: {
                    domain: domainMatch ? 'strong' : 'weak',
                    stage: stageMatch ? 'exact' : 'partial',
                    ticketSize: 'within_range'
                },
                keyReasons: reasons,
                riskFlags: warnings.length > 0 ? warnings : ['Standard due diligence recommended'],
                _meta: { generatedAt: new Date().toISOString() }
            }
        });

    } catch (error) {
        console.error('[AI Controller] Match calculation error:', error);
        res.status(500).json({
            success: false,
            error: 'Match calculation failed',
            message: error.message
        });
    }
};

/**
 * Get AI configuration status (for admin/health checks)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
exports.getStatus = (req, res) => {
    res.json({
        success: true,
        data: {
            provider: AI_CONFIG.provider,
            openai: {
                configured: !!AI_CONFIG.openai.apiKey,
                model: AI_CONFIG.openai.model
            },
            gemini: {
                configured: !!AI_CONFIG.gemini.apiKey,
                model: AI_CONFIG.gemini.model
            },
            rateLimit: AI_CONFIG.rateLimit
        }
    });
};
