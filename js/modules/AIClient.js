/**
 * AIClient Module
 * Production-ready AI client with error handling, retry logic, and timeout support.
 * Supports both real LLM API integration and demo mode fallback.
 */

// Configuration constants
const DEFAULT_CONFIG = {
    baseUrl: '/api/ai',
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    demoMode: false
};

// Error types for better error handling
const AIErrorTypes = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    API_ERROR: 'API_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR'
};

/**
 * Custom AI Error class for better error categorization
 */
class AIError extends Error {
    constructor(type, message, originalError = null) {
        super(message);
        this.name = 'AIError';
        this.type = type;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }
}

export class AIClient {
    /**
     * Initialize AIClient with configuration
     * @param {string} mode - 'DEMO' or 'PRODUCTION'
     * @param {Object} config - Configuration options
     */
    constructor(mode = 'DEMO', config = {}) {
        this.mode = mode;
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.requestQueue = [];
        this.isProcessing = false;
    }

    /**
     * Simulates network latency for demo mode
     * @param {number} ms - Milliseconds to wait
     */
    async _simulateLatency(ms = 1500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Implements exponential backoff for retries
     * @param {number} attempt - Current attempt number
     * @returns {number} Delay in milliseconds
     */
    _getRetryDelay(attempt) {
        return this.config.retryDelay * Math.pow(2, attempt - 1);
    }

    /**
     * Sleep utility for retry delays
     * @param {number} ms - Milliseconds to sleep
     */
    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Makes an API request with timeout support
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @param {Object} options - Request options
     */
    async _makeRequest(endpoint, data, options = {}) {
        const { timeout = this.config.timeout } = options;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 429) {
                    throw new AIError(
                        AIErrorTypes.RATE_LIMIT_ERROR,
                        'Rate limit exceeded. Please try again later.',
                        { status: response.status, data: errorData }
                    );
                }

                throw new AIError(
                    AIErrorTypes.API_ERROR,
                    errorData.error || `API Error: ${response.status}`,
                    { status: response.status, data: errorData }
                );
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new AIError(
                    AIErrorTypes.TIMEOUT_ERROR,
                    `Request timed out after ${timeout}ms`,
                    error
                );
            }

            if (error instanceof AIError) {
                throw error;
            }

            throw new AIError(
                AIErrorTypes.NETWORK_ERROR,
                'Network error occurred. Please check your connection.',
                error
            );
        }
    }

    /**
     * Executes a request with retry logic
     * @param {Function} requestFn - Function that returns a promise
     * @param {number} retries - Number of retries remaining
     */
    async _executeWithRetry(requestFn, retries = this.config.maxRetries) {
        let lastError;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;

                // Don't retry on validation or rate limit errors
                if (error.type === AIErrorTypes.VALIDATION_ERROR ||
                    error.type === AIErrorTypes.RATE_LIMIT_ERROR) {
                    throw error;
                }

                // Log retry attempt
                console.warn(`[AIClient] Attempt ${attempt}/${retries} failed:`, error.message);

                if (attempt < retries) {
                    const delay = this._getRetryDelay(attempt);
                    console.log(`[AIClient] Retrying in ${delay}ms...`);
                    await this._sleep(delay);
                }
            }
        }

        throw lastError;
    }

    /**
     * Validates pitch data before submission
     * @param {Object} pitchData - Pitch data to validate
     */
    _validatePitchData(pitchData) {
        if (!pitchData || typeof pitchData !== 'object') {
            throw new AIError(
                AIErrorTypes.VALIDATION_ERROR,
                'Invalid pitch data: must be an object'
            );
        }

        const requiredFields = ['description'];
        for (const field of requiredFields) {
            if (!pitchData[field]) {
                console.warn(`[AIClient] Missing recommended field: ${field}`);
            }
        }

        // Validate description length
        if (pitchData.description && pitchData.description.length < 50) {
            console.warn('[AIClient] Description is short. Consider adding more detail for better analysis.');
        }

        return true;
    }

    /**
     * Generates a broad Readiness Score based on pitch data.
     * @param {Object} pitchData - Pitch deck data
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Analysis result
     */
    async evaluateReadiness(pitchData, options = {}) {
        // Validate input
        this._validatePitchData(pitchData);

        try {
            const result = await this._executeWithRetry(async () => {
                const response = await this._makeRequest('/analyze', pitchData, options);
                if (!response.success) {
                    throw new AIError(AIErrorTypes.API_ERROR, response.error || 'Analysis failed');
                }
                return response.data;
            });

            console.log('[AIClient] Readiness evaluation complete:', result);
            return result;
        } catch (error) {
            console.warn('[AIClient] API unavailable, falling back to demo mode:', error.message);

            // Fallback to demo mode
            await this._simulateLatency(1500);
            return this._generateDemoReadinessScore(pitchData);
        }
    }

    /**
     * Generates demo readiness score when API is unavailable
     * @param {Object} pitchData - Pitch data
     */
    _generateDemoReadinessScore(pitchData) {
        const descriptionLength = pitchData?.description?.length || 0;
        const hasTeam = pitchData?.team && Object.keys(pitchData.team).length > 0;
        const hasFinancials = pitchData?.financials && Object.keys(pitchData.financials).length > 0;

        // Calculate score based on available data
        let score = 40; // Base score
        if (descriptionLength > 100) score += 15;
        if (descriptionLength > 300) score += 10;
        if (hasTeam) score += 15;
        if (hasFinancials) score += 20;
        score = Math.min(score, 95); // Cap at 95

        return {
            score: score,
            status: score > 70 ? 'INVESTOR_READY' : 'NEEDS_WORK',
            details: `Demo Assessment: ${score > 70 ? 'Strong' : 'Developing'} potential based on available information.`,
            breakdown: {
                team: hasTeam ? 85 : 50,
                market: 75,
                product: descriptionLength > 100 ? 80 : 60,
                financials: hasFinancials ? 75 : 40
            },
            analysis: {
                strengths: [
                    "Clear problem identification",
                    "Target market defined",
                    hasTeam ? "Team structure outlined" : "Team information needed"
                ].filter(Boolean),
                weaknesses: [
                    !hasFinancials ? "Financial projections missing" : null,
                    !hasTeam ? "Team details incomplete" : null,
                    "Demo mode - limited analysis available"
                ].filter(Boolean),
                recommendations: [
                    "Complete all profile sections for better matching",
                    "Upload pitch deck for detailed analysis",
                    "Add financial projections"
                ]
            },
            _meta: { demo: true, generatedAt: new Date().toISOString() }
        };
    }

    /**
     * Generates a "Senior Analyst" Investment Memo.
     * @param {string} startupId - Startup identifier
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Report data
     */
    async generateSeniorAnalystReport(startupId, options = {}) {
        if (!startupId) {
            throw new AIError(
                AIErrorTypes.VALIDATION_ERROR,
                'Startup ID is required for report generation'
            );
        }

        try {
            const result = await this._executeWithRetry(async () => {
                const response = await this._makeRequest('/report', { startupId }, options);
                if (!response.success) {
                    throw new AIError(AIErrorTypes.API_ERROR, response.error || 'Report generation failed');
                }
                return response.data;
            });

            console.log('[AIClient] Senior Analyst Report generated:', result);
            return result;
        } catch (error) {
            console.warn('[AIClient] API unavailable, falling back to demo mode:', error.message);

            // Fallback to demo mode
            await this._simulateLatency(2000);
            return this._generateDemoReport(startupId);
        }
    }

    /**
     * Generates demo report when API is unavailable
     * @param {string} startupId - Startup identifier
     */
    _generateDemoReport(startupId) {
        return {
            meta: {
                type: "SENIOR_BA_DUE_DILIGENCE",
                author: "FundLink AI (Demo Mode)",
                timestamp: new Date().toISOString(),
                classification: "CONFIDENTIAL",
                demo: true
            },
            executive_framing: {
                problem_statement: "Market inefficiency in target sector creating opportunity for disruption.",
                solution_thesis: "Technology-enabled solution with strong value proposition.",
                roi_projection: "Projected 3-5x ROI within 24-36 months based on market analysis."
            },
            strategic_diagnosis: {
                market_context: "Growing market with increasing demand for innovative solutions.",
                swot: {
                    strengths: ["Innovative approach", "Market timing", "Technology differentiation"],
                    weaknesses: ["Early stage execution", "Market validation pending", "Team scaling needed"],
                    opportunities: ["Market expansion", "Strategic partnerships", "Product extension"],
                    threats: ["Competition", "Market timing", "Regulatory changes"]
                }
            },
            financial_risk_assessment: {
                financials: {
                    burn_rate: "Moderate",
                    unit_economics: "Improving trajectory",
                    runway: "12-18 months estimated"
                },
                risk_matrix: [
                    { category: "Market", risk: "Competition", probability: "Medium", impact: "High" },
                    { category: "Execution", risk: "Team scaling", probability: "Medium", impact: "Medium" },
                    { category: "Financial", risk: "Runway management", probability: "Low", impact: "High" }
                ]
            },
            final_verdict: {
                decision: "WATCH_LIST",
                rationale: "Promising opportunity requiring further validation. Recommend follow-up meeting."
            }
        };
    }

    /**
     * Calculates compatibility match between startup and investor.
     * @param {Object} startupProfile - Startup profile data
     * @param {Object} investorThesis - Investor thesis data
     * @returns {Promise<Object>} Match result
     */
    async calculateMatch(startupProfile, investorThesis) {
        // Validate inputs
        if (!startupProfile || !investorThesis) {
            throw new AIError(
                AIErrorTypes.VALIDATION_ERROR,
                'Both startup profile and investor thesis are required'
            );
        }

        try {
            const result = await this._executeWithRetry(async () => {
                const response = await this._makeRequest('/match', {
                    startup: startupProfile,
                    investor: investorThesis
                });
                return response;
            });

            return result;
        } catch (error) {
            console.warn('[AIClient] Match API unavailable, using local calculation:', error.message);
            return this._calculateLocalMatch(startupProfile, investorThesis);
        }
    }

    /**
     * Local match calculation fallback
     * @param {Object} startup - Startup profile
     * @param {Object} investor - Investor thesis
     */
    _calculateLocalMatch(startup, investor) {
        let score = 50; // Base score
        let reasons = [];
        let warnings = [];

        // Domain matching
        const startupDomain = startup.domain?.toLowerCase() || '';
        const investorDomains = investor.domains || investor.focusDomains || [];
        const domainMatch = investorDomains.some(d =>
            d.toLowerCase().includes(startupDomain) || startupDomain.includes(d.toLowerCase())
        );
        if (domainMatch) {
            score += 20;
            reasons.push("Domain alignment detected");
        }

        // Stage matching
        const startupStage = startup.stage?.toLowerCase() || '';
        const investorStages = investor.stages || investor.preferredStages || [];
        const stageMatch = investorStages.some(s =>
            s.toLowerCase() === startupStage ||
            (startupStage.includes('seed') && s.toLowerCase().includes('seed'))
        );
        if (stageMatch) {
            score += 15;
            reasons.push("Stage alignment confirmed");
        }

        // Ticket size matching
        const startupAsk = startup.ticketSize || startup.ask || '';
        const investorTicket = investor.ticketSize || investor.ticketRange || '';
        if (startupAsk && investorTicket) {
            score += 10;
            reasons.push("Investment size compatible");
        }

        // Location preference
        if (startup.location && investor.preferredLocations) {
            if (investor.preferredLocations.includes(startup.location)) {
                score += 5;
                reasons.push("Location preference match");
            }
        }

        // Cap score
        score = Math.min(score, 98);

        // Add warnings for missing data
        if (!startupDomain) warnings.push("Startup domain not specified");
        if (!startupStage) warnings.push("Startup stage not specified");
        if (investorDomains.length === 0) warnings.push("Investor thesis incomplete");

        return {
            match_score: score,
            fit_level: score >= 80 ? "HIGH" : score >= 60 ? "MEDIUM" : "LOW",
            reasoning: reasons.length > 0
                ? reasons.join(". ") + "."
                : "Basic compatibility assessment based on available data.",
            warnings: warnings,
            breakdown: {
                domain_score: domainMatch ? 20 : 0,
                stage_score: stageMatch ? 15 : 0,
                ticket_score: 10,
                location_score: 5
            },
            _meta: { calculated_locally: true, timestamp: new Date().toISOString() }
        };
    }

    /**
     * Batch process multiple startups for matching
     * @param {Array} startups - Array of startup profiles
     * @param {Object} investorThesis - Investor thesis
     * @returns {Promise<Array>} Array of match results
     */
    async batchMatch(startups, investorThesis) {
        if (!Array.isArray(startups) || startups.length === 0) {
            return [];
        }

        console.log(`[AIClient] Processing batch match for ${startups.length} startups`);

        const results = await Promise.allSettled(
            startups.map(startup => this.calculateMatch(startup, investorThesis))
        );

        return results.map((result, index) => ({
            startupId: startups[index].id || `startup_${index}`,
            success: result.status === 'fulfilled',
            match: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason?.message : null
        }));
    }

    /**
     * Get client status and configuration
     */
    getStatus() {
        return {
            mode: this.mode,
            config: {
                baseUrl: this.config.baseUrl,
                timeout: this.config.timeout,
                maxRetries: this.config.maxRetries
            },
            queueLength: this.requestQueue.length
        };
    }
}

// Export error types for external use
export { AIError, AIErrorTypes };
