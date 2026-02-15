/**
 * Access Control Framework for FundLink
 * Provides dual-role access with seamless switching between Founder and Investor views.
 * No access restrictions - users can freely switch between roles and access all features.
 */

// Permission definitions for each role
export const PERMISSIONS = {
    // Founder Permissions
    FOUNDER: {
        // Profile Management
        'profile:view': true,
        'profile:edit': true,
        'profile:delete': true,

        // Dashboard Access
        'dashboard:view': true,
        'analytics:view': true,
        'settings:manage': true,

        // Connection Management
        'connections:send': true,
        'connections:receive': true,
        'connections:accept': true,
        'connections:decline': true,
        'connections:view': true,

        // Deal Flow
        'deals:view': true,
        'deals:create': true,
        'deals:negotiate': true,
        'deals:close': true,

        // Workspace
        'workspace:view': true,
        'workspace:edit': true,
        'workspace:documents': true,

        // Messaging
        'messages:send': true,
        'messages:receive': true,
        'inbox:view': true,

        // AI Features
        'ai:matchscore': true,
        'ai:readiness': true,
        'ai:recommendations': true,

        // Vault
        'vault:view': true,
        'vault:upload': true,
        'vault:download': true
    },

    // Investor Permissions
    INVESTOR: {
        // Profile Management
        'profile:view': true,
        'profile:edit': true,
        'profile:delete': true,

        // Dashboard Access
        'dashboard:view': true,
        'feed:view': true,
        'portfolio:view': true,
        'thesis:manage': true,
        'settings:manage': true,

        // Connection Management
        'connections:send': true,
        'connections:receive': true,
        'connections:accept': true,
        'connections:decline': true,
        'connections:view': true,

        // Deal Flow
        'deals:view': true,
        'deals:evaluate': true,
        'deals:negotiate': true,
        'deals:close': true,
        'deals:invest': true,

        // Workspace
        'workspace:view': true,
        'workspace:edit': true,
        'workspace:documents': true,

        // Messaging
        'messages:send': true,
        'messages:receive': true,
        'inbox:view': true,

        // AI Features
        'ai:matchscore': true,
        'ai:evaluation': true,
        'ai:recommendations': true,
        'ai:investment-report': true,

        // Vault
        'vault:view': true,
        'vault:upload': true,
        'vault:download': true
    }
};

// Route access configuration - all routes accessible to both roles
export const ROUTE_ACCESS = {
    // Public routes (no auth required)
    public: ['landing', 'role-select', 'terms', 'privacy', 'compliance'],

    // Founder routes (also accessible by investors in dual-view mode)
    founder: [
        'founder-dashboard',
        'founder-profile',
        'founder-analytics',
        'founder-settings',
        'founder-sent',
        'founder-inbox',
        'founder-received'
    ],

    // Investor routes (also accessible by founders in dual-view mode)
    investor: [
        'investor-feed',
        'investor-requests',
        'investor-portfolio',
        'investor-thesis',
        'investor-profile',
        'investor-incoming'
    ],

    // Shared routes (accessible by both)
    shared: [
        'workspace',
        'accepted-workspace',
        'deal-closure',
        'messages',
        'vault'
    ]
};

/**
 * AccessControl Module
 * Manages permissions, role switching, and access verification.
 */
export const AccessControl = {
    /**
     * Current active role
     */
    currentRole: null,

    /**
     * Session data
     */
    session: null,

    /**
     * Available roles in the system
     */
    ROLES: {
        FOUNDER: 'FOUNDER',
        INVESTOR: 'INVESTOR',
        DUAL: 'DUAL' // Special mode for accessing both dashboards
    },

    /**
     * Initialize the access control system
     */
    init() {
        // Load session from storage
        this.loadSession();

        // Enable dual-access mode by default
        this.enableDualAccess();

        console.log('[AccessControl] Initialized with dual-role access enabled');

        // Dispatch initialization event
        window.dispatchEvent(new CustomEvent('accessControl:initialized', {
            detail: { role: this.currentRole, dualAccess: true }
        }));
    },

    /**
     * Enable dual-access mode - allows seamless switching between roles
     */
    enableDualAccess() {
        localStorage.setItem('fundlink_dual_access', 'true');
        localStorage.setItem('fundlink_demo_mode', 'true');
        console.log('[AccessControl] Dual-access mode enabled - full access to both roles');
    },

    /**
     * Check if dual-access mode is enabled
     * @returns {boolean}
     */
    isDualAccessEnabled() {
        return localStorage.getItem('fundlink_dual_access') === 'true' ||
            localStorage.getItem('fundlink_demo_mode') === 'true';
    },

    /**
     * Load session from localStorage
     */
    loadSession() {
        const sessionData = localStorage.getItem('fundlink_session');
        if (sessionData) {
            try {
                this.session = JSON.parse(sessionData);
                this.currentRole = this.session.role || null;
            } catch (e) {
                this.session = null;
                this.currentRole = null;
            }
        }
    },

    /**
     * Save session to localStorage
     */
    saveSession() {
        if (this.session) {
            localStorage.setItem('fundlink_session', JSON.stringify(this.session));
        }
    },

    /**
     * Create a new session for a user
     * @param {string} role - FOUNDER or INVESTOR
     * @param {Object} userData - User data to include in session
     * @returns {Object} - Created session
     */
    createSession(role, userData = {}) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        this.session = {
            id: sessionId,
            role: role,
            userId: userData.userId || `user_${Date.now()}`,
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            permissions: this.getRolePermissions(role),
            dualAccess: true, // Always enabled
            ...userData
        };

        this.currentRole = role;
        this.saveSession();

        // Also set the role in localStorage for backward compatibility
        localStorage.setItem('fundlink_role', role);

        console.log(`[AccessControl] Session created for ${role}`);

        window.dispatchEvent(new CustomEvent('accessControl:sessionCreated', {
            detail: { session: this.session }
        }));

        return this.session;
    },

    /**
     * Get current session
     * @returns {Object|null}
     */
    getSession() {
        return this.session;
    },

    /**
     * Update session activity timestamp
     */
    updateActivity() {
        if (this.session) {
            this.session.lastActivity = new Date().toISOString();
            this.saveSession();
        }
    },

    /**
     * End current session
     */
    endSession() {
        this.session = null;
        this.currentRole = null;
        localStorage.removeItem('fundlink_session');
        localStorage.removeItem('fundlink_role');
        localStorage.removeItem('fundlink_current_user_id');

        console.log('[AccessControl] Session ended');

        window.dispatchEvent(new CustomEvent('accessControl:sessionEnded'));
    },

    /**
     * Switch to a different role (always allowed in dual-access mode)
     * @param {string} newRole - FOUNDER or INVESTOR
     * @returns {boolean} - Always returns true (no restrictions)
     */
    switchRole(newRole) {
        const previousRole = this.currentRole;

        // Always allow role switching - no restrictions
        this.currentRole = newRole;
        localStorage.setItem('fundlink_role', newRole);

        if (this.session) {
            this.session.role = newRole;
            this.session.permissions = this.getRolePermissions(newRole);
            this.session.lastActivity = new Date().toISOString();
            this.saveSession();
        }

        console.log(`[AccessControl] Role switched from ${previousRole} to ${newRole}`);

        // Dispatch role switch event
        window.dispatchEvent(new CustomEvent('accessControl:roleSwitched', {
            detail: {
                previousRole,
                newRole,
                permissions: this.getRolePermissions(newRole)
            }
        }));

        return true;
    },

    /**
     * Get current role
     * @returns {string|null}
     */
    getRole() {
        return this.currentRole || localStorage.getItem('fundlink_role');
    },

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!this.session || !!localStorage.getItem('fundlink_role');
    },

    /**
     * Get all permissions for a role
     * @param {string} role - FOUNDER or INVESTOR
     * @returns {Object} - Permissions object
     */
    getRolePermissions(role) {
        return PERMISSIONS[role] || {};
    },

    /**
     * Check if a specific permission is granted
     * @param {string} permission - Permission string (e.g., 'profile:view')
     * @param {string} role - Optional role to check (uses current role if not specified)
     * @returns {boolean} - Always returns true in dual-access mode
     */
    hasPermission(permission, role = null) {
        // In dual-access mode, all permissions are granted
        if (this.isDualAccessEnabled()) {
            return true;
        }

        const checkRole = role || this.getRole();
        const permissions = this.getRolePermissions(checkRole);
        return permissions[permission] === true;
    },

    /**
     * Check if user can access a specific route
     * @param {string} route - Route name
     * @returns {boolean} - Always returns true (no route restrictions)
     */
    canAccessRoute(route) {
        // No route restrictions - all routes accessible
        return true;
    },

    /**
     * Get accessible routes for current role
     * @param {string} role - Optional role (uses current role if not specified)
     * @returns {Object} - All routes accessible
     */
    getAccessibleRoutes(role = null) {
        // Return all routes - no restrictions
        return {
            founder: ROUTE_ACCESS.founder,
            investor: ROUTE_ACCESS.investor,
            shared: ROUTE_ACCESS.shared,
            public: ROUTE_ACCESS.public
        };
    },

    /**
     * Require a specific role - no longer blocks access
     * @param {string} requiredRole - Required role
     * @returns {boolean} - Always returns true
     */
    requireRole(requiredRole) {
        // No role restrictions - always return true
        console.log(`[AccessControl] Role requirement '${requiredRole}' - Access granted (no restrictions)`);
        return true;
    },

    /**
     * Get dashboard configuration for a role
     * @param {string} role - FOUNDER or INVESTOR
     * @returns {Object} - Dashboard configuration
     */
    getDashboardConfig(role) {
        const configs = {
            FOUNDER: {
                defaultRoute: 'founder-dashboard',
                title: 'Founder Dashboard',
                icon: 'fas fa-rocket',
                color: '#6366f1',
                sections: [
                    { id: 'dashboard', label: 'Dashboard', route: 'founder-dashboard', icon: 'fas fa-home' },
                    { id: 'profile', label: 'My Profile', route: 'founder-profile', icon: 'fas fa-user' },
                    { id: 'analytics', label: 'Analytics', route: 'founder-analytics', icon: 'fas fa-chart-line' },
                    { id: 'sent', label: 'Sent Requests', route: 'founder-sent', icon: 'fas fa-paper-plane' },
                    { id: 'inbox', label: 'Inbox', route: 'founder-inbox', icon: 'fas fa-inbox' },
                    { id: 'received', label: 'Received', route: 'founder-received', icon: 'fas fa-envelope-open' },
                    { id: 'settings', label: 'Settings', route: 'founder-settings', icon: 'fas fa-cog' }
                ],
                features: {
                    aiMatchScore: true,
                    readinessAssessment: true,
                    investorDiscovery: true,
                    dealNegotiation: true,
                    documentVault: true
                }
            },
            INVESTOR: {
                defaultRoute: 'investor-feed',
                title: 'Investor Dashboard',
                icon: 'fas fa-briefcase',
                color: '#10b981',
                sections: [
                    { id: 'feed', label: 'Deal Feed', route: 'investor-feed', icon: 'fas fa-stream' },
                    { id: 'portfolio', label: 'Portfolio', route: 'investor-portfolio', icon: 'fas fa-folder-open' },
                    { id: 'requests', label: 'Requests', route: 'investor-requests', icon: 'fas fa-paper-plane' },
                    { id: 'incoming', label: 'Incoming', route: 'investor-incoming', icon: 'fas fa-inbox' },
                    { id: 'thesis', label: 'Investment Thesis', route: 'investor-thesis', icon: 'fas fa-lightbulb' },
                    { id: 'profile', label: 'Profile', route: 'investor-profile', icon: 'fas fa-user' }
                ],
                features: {
                    aiEvaluation: true,
                    investmentReport: true,
                    founderDiscovery: true,
                    dealNegotiation: true,
                    documentVault: true
                }
            }
        };

        return configs[role] || configs.FOUNDER;
    },

    /**
     * Get role switcher UI configuration
     * @returns {Object} - Role switcher configuration
     */
    getRoleSwitcherConfig() {
        return {
            enabled: true,
            showInNavbar: true,
            allowHotkey: true,
            hotkey: 'Alt+R',
            roles: [
                {
                    id: 'FOUNDER',
                    label: 'Founder View',
                    icon: 'fas fa-rocket',
                    color: '#6366f1',
                    description: 'Access founder dashboard and tools'
                },
                {
                    id: 'INVESTOR',
                    label: 'Investor View',
                    icon: 'fas fa-briefcase',
                    color: '#10b981',
                    description: 'Access investor dashboard and deal flow'
                }
            ]
        };
    },

    /**
     * Create a guest session with dual access
     * @returns {Object} - Guest session
     */
    createGuestSession() {
        return this.createSession('FOUNDER', {
            userId: `guest_${Date.now()}`,
            isGuest: true,
            name: 'Guest User'
        });
    },

    /**
     * Verify access and return result (always succeeds)
     * @param {string} resource - Resource to access
     * @param {string} action - Action to perform
     * @returns {Object} - Access verification result
     */
    verifyAccess(resource, action) {
        return {
            granted: true,
            role: this.getRole(),
            resource,
            action,
            message: 'Access granted - dual-access mode enabled'
        };
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AccessControl.init());
    } else {
        AccessControl.init();
    }
}

export default AccessControl;