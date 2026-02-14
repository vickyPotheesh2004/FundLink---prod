/**
 * Authentication Module
 * Manages role persistence, user profiles, and access control.
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
     * Logs the user out and clears all user data.
     */
    logout() {
        const currentUserId = this.getCurrentUserId();
        if (currentUserId) {
            // Remove user from profiles list
            this.removeUserProfile(currentUserId);
        }
        localStorage.removeItem('fundlink_role');
        localStorage.removeItem('fundlink_current_user_id');
        window.location.hash = '#landing';
        console.log('[Auth] Role cleared. User logged out.');
    },

    /**
     * Returns the current user role.
     * @returns {string|null}
     */
    getRole() {
        return localStorage.getItem('fundlink_role');
    },

    /**
     * Checks if the user is currently logged in (has a role set).
     * @returns {boolean}
     */
    isLoggedIn() {
        return !!localStorage.getItem('fundlink_role');
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
            window.location.hash = '#landing';
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

    // --- User Profile Management ---

    /**
     * Get current user ID
     * @returns {string|null}
     */
    getCurrentUserId() {
        return localStorage.getItem('fundlink_current_user_id');
    },

    /**
     * Create or update user profile
     * @param {Object} profileData - User profile data
     * @returns {string} - User ID
     */
    saveUserProfile(profileData) {
        const profiles = JSON.parse(localStorage.getItem('fundlink_user_profiles') || '[]');
        const userId = this.getCurrentUserId() || `user_${Date.now()}`;

        // Set current user ID if new
        if (!this.getCurrentUserId()) {
            localStorage.setItem('fundlink_current_user_id', userId);
        }

        const existingIndex = profiles.findIndex(p => p.id === userId);
        const profile = {
            id: userId,
            role: this.getRole(),
            createdAt: existingIndex === -1 ? new Date().toISOString() : profiles[existingIndex].createdAt,
            updatedAt: new Date().toISOString(),
            ...profileData
        };

        if (existingIndex !== -1) {
            profiles[existingIndex] = profile;
        } else {
            profiles.push(profile);
        }

        localStorage.setItem('fundlink_user_profiles', JSON.stringify(profiles));
        console.log(`[Auth] User profile saved:`, profile);
        return userId;
    },

    /**
     * Get current user's profile
     * @returns {Object|null}
     */
    getCurrentUserProfile() {
        const userId = this.getCurrentUserId();
        if (!userId) return null;
        const profiles = JSON.parse(localStorage.getItem('fundlink_user_profiles') || '[]');
        return profiles.find(p => p.id === userId) || null;
    },

    /**
     * Get all profiles by role
     * @param {string} role - 'FOUNDER' or 'INVESTOR'
     * @returns {Array}
     */
    getProfilesByRole(role) {
        const profiles = JSON.parse(localStorage.getItem('fundlink_user_profiles') || '[]');
        return profiles.filter(p => p.role === role);
    },

    /**
     * Get all investor profiles
     * @returns {Array}
     */
    getAllInvestors() {
        return this.getProfilesByRole('INVESTOR');
    },

    /**
     * Get all founder profiles
     * @returns {Array}
     */
    getAllFounders() {
        return this.getProfilesByRole('FOUNDER');
    },

    /**
     * Get profile by ID
     * @param {string} userId 
     * @returns {Object|null}
     */
    getProfileById(userId) {
        const profiles = JSON.parse(localStorage.getItem('fundlink_user_profiles') || '[]');
        return profiles.find(p => p.id === userId) || null;
    },

    /**
     * Remove user profile
     * @param {string} userId 
     */
    removeUserProfile(userId) {
        const profiles = JSON.parse(localStorage.getItem('fundlink_user_profiles') || '[]');
        const filtered = profiles.filter(p => p.id !== userId);
        localStorage.setItem('fundlink_user_profiles', JSON.stringify(filtered));
    },

    // --- Connection Request Logic ---

    /**
     * Send a connection request to a specific user
     * @param {string} fromUserId - Sender's user ID
     * @param {string} toUserId - Target user's ID
     * @returns {Object} - Result with success status
     */
    sendConnectionRequest(fromUserId, toUserId) {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');

        // Check if request already exists
        const existingRequest = requests.find(r =>
            r.fromUserId === fromUserId &&
            r.toUserId === toUserId &&
            r.status === 'pending'
        );

        if (existingRequest) {
            return { success: false, message: 'Request already pending' };
        }

        const fromProfile = this.getProfileById(fromUserId);
        const toProfile = this.getProfileById(toUserId);

        if (!fromProfile || !toProfile) {
            return { success: false, message: 'User profile not found' };
        }

        const newRequest = {
            id: `req_${Date.now()}`,
            fromUserId: fromUserId,
            toUserId: toUserId,
            fromName: fromProfile.name || fromProfile.companyName || 'Unknown',
            toName: toProfile.name || toProfile.companyName || 'Unknown',
            fromRole: fromProfile.role,
            toRole: toProfile.role,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        requests.push(newRequest);
        localStorage.setItem('fundlink_connection_requests', JSON.stringify(requests));

        // Dispatch event for real-time updates
        window.dispatchEvent(new CustomEvent('fundlink:requestUpdate', { detail: { type: 'new', request: newRequest } }));

        console.log(`[Auth] Connection request sent:`, newRequest);
        return { success: true, request: newRequest };
    },

    /**
     * Get incoming connection requests for current user
     * @returns {Array}
     */
    getIncomingRequests() {
        const currentUserId = this.getCurrentUserId();
        if (!currentUserId) return [];

        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        return requests.filter(r => r.toUserId === currentUserId);
    },

    /**
     * Get outgoing connection requests from current user
     * @returns {Array}
     */
    getOutgoingRequests() {
        const currentUserId = this.getCurrentUserId();
        if (!currentUserId) return [];

        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        return requests.filter(r => r.fromUserId === currentUserId);
    },

    /**
     * Accept a connection request
     * @param {string} requestId 
     * @returns {boolean}
     */
    acceptConnectionRequest(requestId) {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        const idx = requests.findIndex(r => r.id === requestId);
        if (idx !== -1) {
            requests[idx].status = 'accepted';
            requests[idx].acceptedAt = new Date().toISOString();
            localStorage.setItem('fundlink_connection_requests', JSON.stringify(requests));

            // Dispatch event for real-time updates
            window.dispatchEvent(new CustomEvent('fundlink:requestUpdate', { detail: { type: 'accepted', request: requests[idx] } }));

            return true;
        }
        return false;
    },

    /**
     * Decline a connection request
     * @param {string} requestId 
     * @returns {boolean}
     */
    declineConnectionRequest(requestId) {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        const idx = requests.findIndex(r => r.id === requestId);
        if (idx !== -1) {
            requests[idx].status = 'declined';
            requests[idx].declinedAt = new Date().toISOString();
            localStorage.setItem('fundlink_connection_requests', JSON.stringify(requests));

            // Dispatch event for real-time updates
            window.dispatchEvent(new CustomEvent('fundlink:requestUpdate', { detail: { type: 'declined', request: requests[idx] } }));

            return true;
        }
        return false;
    },

    /**
     * Get accepted connections for current user
     * @returns {Array}
     */
    getConnections() {
        const currentUserId = this.getCurrentUserId();
        if (!currentUserId) return [];

        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        return requests.filter(r =>
            (r.fromUserId === currentUserId || r.toUserId === currentUserId) &&
            r.status === 'accepted'
        );
    },

    // --- Legacy compatibility methods ---
    sendConnectionRequestLegacy(fromRole, toName, targetRealName) {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        const newRequest = {
            id: Date.now(),
            from: fromRole,
            to: toName,
            targetName: targetRealName,
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        requests.push(newRequest);
        localStorage.setItem('fundlink_connection_requests', JSON.stringify(requests));
        return true;
    },

    getIncomingRequestsLegacy(myRole) {
        const allRequests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        return allRequests.filter(r => r.to === myRole || r.to === 'FOUNDER');
    }
};
