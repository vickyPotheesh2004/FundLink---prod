/**
 * FundLink API Service Module
 * Provides centralized API communication with mock data fallbacks,
 * error handling, and retry logic.
 */

// Environment-based API endpoint configuration
const API_CONFIG = {
    BASE_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api'
        : 'https://api.fundlink.in/api',
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
};

// API Endpoints
const ENDPOINTS = {
    // Founder endpoints
    FOUNDER_PROFILE: '/founder/profile',
    FOUNDER_DASHBOARD: '/founder/dashboard',
    FOUNDER_MATCHES: '/founder/matches',
    FOUNDER_WORKSPACES: '/founder/workspaces',

    // Investor endpoints
    INVESTOR_PROFILE: '/investor/profile',
    INVESTOR_FEED: '/investor/feed',
    INVESTOR_THESIS: '/investor/thesis',
    INVESTOR_PORTFOLIO: '/investor/portfolio',
    INVESTOR_REQUESTS: '/investor/requests',

    // Connection endpoints
    CONNECTIONS: '/connections',
    CONNECTION_REQUEST: '/connections/request',
    CONNECTION_ACCEPT: '/connections/accept',
    CONNECTION_REJECT: '/connections/reject',

    // Workspace endpoints
    WORKSPACE: '/workspace',
    WORKSPACE_MESSAGES: '/workspace/messages',
    WORKSPACE_DOCUMENTS: '/workspace/documents',

    // Vault endpoints
    VAULT_DOCUMENTS: '/vault/documents',
    VAULT_UPLOAD: '/vault/upload',

    // Messages endpoints
    MESSAGES: '/messages',
    MESSAGES_SEND: '/messages/send',
    MESSAGES_READ: '/messages/read',

    // Auth endpoints
    AUTH_LOGIN: '/auth/login',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_VERIFY: '/auth/verify',
    AUTH_REFRESH: '/auth/refresh',

    // AI endpoints
    AI_MATCH_SCORE: '/ai/match-score',
    AI_READINESS: '/ai/readiness',
    AI_REPORT: '/ai/report',
};

// Mock data for fallback
const MOCK_DATA = {
    founderProfile: {
        id: 'f_001',
        name: 'Alexander Wright',
        email: 'alex@startup.io',
        company: 'TechVenture AI',
        role: 'Lead Founder',
        stage: 'Series A',
        industry: 'Artificial Intelligence',
        founded: 2022,
        location: 'Bangalore, India',
        teamSize: 25,
        fundingRaised: '5 Cr',
        seeking: '15 Cr',
        verified: true,
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjEGUWYfzDDQ6C4EiQX09oNjyqFujyF574wuApmgKh4HygUQCHei1fVlUmZQIdWU8Ng8EN__LnkaPqt80fR2FAmt2cehs5I8bCSCnOpJjf6hiU3O09fBxWoIwzX81hmY_ysIUNNkm77-cH-4Tvdhm0hsJqeWHSSKEmphBw3GqE-8Kfp9Z4JbvTo8v1mJol7xFWmtKKIQAs4FS3mR_Vu8JlSoHYqy-2oTTvPa-Yx6ckT8HbUP2XsQoso4_fhKPvYYKa-f9ThjtVWqs',
    },

    investorProfile: {
        id: 'i_001',
        name: 'Rahul Sharma',
        email: 'rahul@venturecapital.in',
        firm: 'Sharma Ventures',
        role: 'Managing Partner',
        investmentRange: { min: '1 Cr', max: '10 Cr' },
        sectors: ['AI/ML', 'FinTech', 'SaaS', 'EdTech'],
        stages: ['Seed', 'Series A', 'Series B'],
        portfolio: 12,
        verified: true,
        avatar: null,
    },

    matches: [
        {
            id: 'm_001',
            founderName: 'TechVenture AI',
            matchScore: 92,
            industry: 'AI/ML',
            stage: 'Series A',
            seeking: '15 Cr',
            status: 'pending',
        },
        {
            id: 'm_002',
            founderName: 'FinFlow Solutions',
            matchScore: 87,
            industry: 'FinTech',
            stage: 'Seed',
            seeking: '3 Cr',
            status: 'pending',
        },
        {
            id: 'm_003',
            founderName: 'CloudSync Pro',
            matchScore: 85,
            industry: 'SaaS',
            stage: 'Series A',
            seeking: '10 Cr',
            status: 'pending',
        },
    ],

    workspaces: [
        {
            id: 'w_001',
            partnerName: 'Rahul Sharma',
            partnerType: 'investor',
            status: 'active',
            lastMessage: 'Looking forward to discussing the Series A...',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 2,
        },
        {
            id: 'w_002',
            partnerName: 'Priya Venkatesh',
            partnerType: 'investor',
            status: 'active',
            lastMessage: 'The financial projections look promising...',
            lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
            unreadCount: 1,
        },
    ],

    messages: [
        {
            id: 'msg_001',
            senderId: 'i_001',
            senderName: 'Rahul Sharma',
            content: 'Hi! I\'ve reviewed your pitch deck and I\'m very interested in learning more about your startup.',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: true,
        },
        {
            id: 'msg_002',
            senderId: 'f_001',
            senderName: 'Alexander Wright',
            content: 'Thank you for your interest! I\'d be happy to schedule a call to discuss the details.',
            timestamp: new Date(Date.now() - 6900000).toISOString(),
            read: true,
        },
    ],

    vaultDocuments: [
        {
            id: 'doc_001',
            name: 'Pitch Deck - Series A',
            type: 'pitch',
            size: '2.4 MB',
            status: 'verified',
            uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
            id: 'doc_002',
            name: 'Financial Statements 2023',
            type: 'financial',
            size: '1.8 MB',
            status: 'verified',
            uploadedAt: new Date(Date.now() - 604800000).toISOString(),
        },
        {
            id: 'doc_003',
            name: 'Certificate of Incorporation',
            type: 'legal',
            size: '856 KB',
            status: 'pending',
            uploadedAt: new Date(Date.now() - 259200000).toISOString(),
        },
    ],
};

/**
 * API Service class with retry logic and error handling
 */
class ApiService {
    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.maxRetries = API_CONFIG.MAX_RETRIES;
        this.retryDelay = API_CONFIG.RETRY_DELAY;
        this.useMockData = false;
    }

    /**
     * Enable or disable mock data mode
     */
    setMockMode(enabled) {
        this.useMockData = enabled;
    }

    /**
     * Make an API request with retry logic
     */
    async request(endpoint, options = {}, retryCount = 0) {
        // Return mock data if in mock mode
        if (this.useMockData) {
            return this.getMockData(endpoint);
        }

        const url = `${this.baseUrl}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`,
                    ...options.headers,
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await this.parseError(response);
                throw new Error(error.message);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            // Retry on network errors or 5xx responses
            if (this.shouldRetry(error, retryCount)) {
                await this.delay(this.retryDelay * (retryCount + 1));
                return this.request(endpoint, options, retryCount + 1);
            }

            // Fall back to mock data on failure
            console.warn(`API request failed, falling back to mock data: ${error.message}`);
            return this.getMockData(endpoint);
        }
    }

    /**
     * Check if request should be retried
     */
    shouldRetry(error, retryCount) {
        if (retryCount >= this.maxRetries) return false;

        // Retry on network errors
        if (error.name === 'AbortError' || error.name === 'TypeError') return true;

        // Retry on 5xx errors
        if (error.status >= 500) return true;

        return false;
    }

    /**
     * Parse error response
     */
    async parseError(response) {
        try {
            const data = await response.json();
            return {
                status: response.status,
                message: data.message || 'An error occurred',
                code: data.code || 'UNKNOWN_ERROR',
            };
        } catch {
            return {
                status: response.status,
                message: response.statusText || 'An error occurred',
                code: 'PARSE_ERROR',
            };
        }
    }

    /**
     * Get mock data for endpoint
     */
    getMockData(endpoint) {
        return new Promise((resolve) => {
            // Simulate network delay
            setTimeout(() => {
                if (endpoint.includes('profile')) {
                    if (endpoint.includes('founder')) {
                        resolve({ success: true, data: MOCK_DATA.founderProfile });
                    } else if (endpoint.includes('investor')) {
                        resolve({ success: true, data: MOCK_DATA.investorProfile });
                    }
                } else if (endpoint.includes('matches')) {
                    resolve({ success: true, data: MOCK_DATA.matches });
                } else if (endpoint.includes('workspace')) {
                    resolve({ success: true, data: MOCK_DATA.workspaces });
                } else if (endpoint.includes('messages')) {
                    resolve({ success: true, data: MOCK_DATA.messages });
                } else if (endpoint.includes('vault')) {
                    resolve({ success: true, data: MOCK_DATA.vaultDocuments });
                } else {
                    resolve({ success: true, data: {} });
                }
            }, 300);
        });
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get auth token
     */
    getToken() {
        return localStorage.getItem('fundlink_token') || '';
    }

    /**
     * Set auth token
     */
    setToken(token) {
        localStorage.setItem('fundlink_token', token);
    }

    /**
     * Clear auth token
     */
    clearToken() {
        localStorage.removeItem('fundlink_token');
    }

    // ==================== API Methods ====================

    // Auth methods
    async login(email, password) {
        const response = await this.request(ENDPOINTS.AUTH_LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    async logout() {
        const response = await this.request(ENDPOINTS.AUTH_LOGOUT, { method: 'POST' });
        this.clearToken();
        return response;
    }

    async verifyAuth() {
        return this.request(ENDPOINTS.AUTH_VERIFY);
    }

    // Founder methods
    async getFounderProfile() {
        return this.request(ENDPOINTS.FOUNDER_PROFILE);
    }

    async updateFounderProfile(data) {
        return this.request(ENDPOINTS.FOUNDER_PROFILE, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async getFounderDashboard() {
        return this.request(ENDPOINTS.FOUNDER_DASHBOARD);
    }

    async getFounderMatches() {
        return this.request(ENDPOINTS.FOUNDER_MATCHES);
    }

    async getFounderWorkspaces() {
        return this.request(ENDPOINTS.FOUNDER_WORKSPACES);
    }

    // Investor methods
    async getInvestorProfile() {
        return this.request(ENDPOINTS.INVESTOR_PROFILE);
    }

    async updateInvestorProfile(data) {
        return this.request(ENDPOINTS.INVESTOR_PROFILE, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async getInvestorFeed() {
        return this.request(ENDPOINTS.INVESTOR_FEED);
    }

    async getInvestorThesis() {
        return this.request(ENDPOINTS.INVESTOR_THESIS);
    }

    async updateInvestorThesis(data) {
        return this.request(ENDPOINTS.INVESTOR_THESIS, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async getInvestorPortfolio() {
        return this.request(ENDPOINTS.INVESTOR_PORTFOLIO);
    }

    async getInvestorRequests() {
        return this.request(ENDPOINTS.INVESTOR_REQUESTS);
    }

    // Connection methods
    async sendConnectionRequest(targetId) {
        return this.request(ENDPOINTS.CONNECTION_REQUEST, {
            method: 'POST',
            body: JSON.stringify({ targetId }),
        });
    }

    async acceptConnection(connectionId) {
        return this.request(`${ENDPOINTS.CONNECTION_ACCEPT}/${connectionId}`, {
            method: 'POST',
        });
    }

    async rejectConnection(connectionId) {
        return this.request(`${ENDPOINTS.CONNECTION_REJECT}/${connectionId}`, {
            method: 'POST',
        });
    }

    // Workspace methods
    async getWorkspace(workspaceId) {
        return this.request(`${ENDPOINTS.WORKSPACE}/${workspaceId}`);
    }

    async getWorkspaceMessages(workspaceId) {
        return this.request(`${ENDPOINTS.WORKSPACE_MESSAGES}/${workspaceId}`);
    }

    async sendWorkspaceMessage(workspaceId, content) {
        return this.request(ENDPOINTS.WORKSPACE_MESSAGES, {
            method: 'POST',
            body: JSON.stringify({ workspaceId, content }),
        });
    }

    async getWorkspaceDocuments(workspaceId) {
        return this.request(`${ENDPOINTS.WORKSPACE_DOCUMENTS}/${workspaceId}`);
    }

    // Vault methods
    async getVaultDocuments() {
        return this.request(ENDPOINTS.VAULT_DOCUMENTS);
    }

    async uploadDocument(formData) {
        return this.request(ENDPOINTS.VAULT_UPLOAD, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type for FormData
            },
        });
    }

    // Messages methods
    async getMessages(conversationId) {
        return this.request(`${ENDPOINTS.MESSAGES}/${conversationId}`);
    }

    async sendMessage(conversationId, content) {
        return this.request(ENDPOINTS.MESSAGES_SEND, {
            method: 'POST',
            body: JSON.stringify({ conversationId, content }),
        });
    }

    async markMessagesRead(conversationId) {
        return this.request(`${ENDPOINTS.MESSAGES_READ}/${conversationId}`, {
            method: 'POST',
        });
    }

    // AI methods
    async getMatchScore(founderId, investorId) {
        return this.request(ENDPOINTS.AI_MATCH_SCORE, {
            method: 'POST',
            body: JSON.stringify({ founderId, investorId }),
        });
    }

    async getReadinessScore(founderId) {
        return this.request(`${ENDPOINTS.AI_READINESS}/${founderId}`);
    }

    async generateInvestmentReport(founderId, investorId) {
        return this.request(ENDPOINTS.AI_REPORT, {
            method: 'POST',
            body: JSON.stringify({ founderId, investorId }),
        });
    }
}

// Create singleton instance
const apiService = new ApiService();

// Export for use in other modules
window.apiService = apiService;
export { apiService, API_CONFIG, ENDPOINTS, MOCK_DATA };