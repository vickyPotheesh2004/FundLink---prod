/**
 * Authentication Module
 * Manages role persistence and access control.
 * Enforces role immutability per session.
 */
export const Auth = {
    /**
     * Defines valid roles in the system.
     */
    ROLES: {
        FOUNDER: 'FOUNDER',
        INVESTOR: 'INVESTOR'
    },

    /**
     * Attempts to log in a user with a specific role.
     * If a role is already set and different, it throws an error (Immutability Check).
     * @param {string} role - 'FOUNDER' or 'INVESTOR'
     */
    login(role) {
        const currentRole = this.getRole();
        if (currentRole && currentRole !== role) {
            console.warn(`[Auth] Attempted role switch from ${currentRole} to ${role}. Action blocked.`);
            alert(`Access Denied: You are permanently registered as a ${currentRole}.`);
            return false;
        }
        localStorage.setItem('fundlink_role', role);
        console.log(`[Auth] User logged in as ${role}`);
        return true;
    },

    /**
     * Logs the user out.
     */
    logout() {
        // localStorage.removeItem('fundlink_role'); // Role is permanent!
        console.log('[Auth] specific Session ended, but role persists.');
    },

    /**
     * Returns the current user role.
     * @returns {string|null}
     */
    getRole() {
        return localStorage.getItem('fundlink_role');
    },

    /**
     * Verifies if the current user has the required role.
     * If not, redirects to the role selection page (or landing).
     * @param {string} requiredRole 
     */
    requireRole(requiredRole) {
        const currentRole = this.getRole();
        if (currentRole !== requiredRole) {
            console.warn(`[Auth] Access Denied. Required: ${requiredRole}, Current: ${currentRole}`);
            // Redirect to landing if unauthorized
            window.location.href = 'fundlink_public_landing_page.html';
            return false;
        }
        return true;
    },

    /**
     * Checks if the readiness evaluation has been completed.
     * @returns {boolean}
     */
    isReadinessComplete() {
        return localStorage.getItem('fundlink_readiness_complete') === 'true';
    },

    /**
     * Marks the readiness evaluation as complete.
     */
    setReadinessComplete() {
        localStorage.setItem('fundlink_readiness_complete', 'true');
    },

    // --- Connection Request Logic (Mock) ---
    sendConnectionRequest(fromRole, toName) {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        const newRequest = {
            id: Date.now(),
            from: fromRole,
            to: toName,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        requests.push(newRequest);
        localStorage.setItem('fundlink_connection_requests', JSON.stringify(requests));
        return true;
    },

    getIncomingRequests(myRole) {
        const allRequests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        // In this demo, if I am FOUNDER, I see requests for 'FOUNDER' (generic target) or my specific mock name
        return allRequests.filter(r => r.to === myRole || r.to === 'FOUNDER');
    },

    acceptConnectionRequest(requestId) {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        const idx = requests.findIndex(r => r.id === requestId);
        if (idx !== -1) {
            requests[idx].status = 'accepted';
            localStorage.setItem('fundlink_connection_requests', JSON.stringify(requests));
            return true;
        }
        return false;
    }
};
