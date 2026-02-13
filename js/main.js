import { Auth } from './modules/auth.js';
import { AIClient } from './modules/AIClient.js';

/**
 * Main Application Logic
 * Acts as the bootstrapper and router.
 */

class App {
    constructor() {
        this.ai = new AIClient('DEMO');
        this.init();
    }

    init() {
        console.log('[App] Initializing FundLink...');
        this.handleRouting();
        this.bindGlobalEvents();
    }

    handleRouting() {
        const path = window.location.pathname;

        // --- Role Guard ---
        if (path.includes('founder_')) {
            if (!Auth.requireRole('FOUNDER')) return;
            this.loadController('FounderController');
        } else if (path.includes('investor_')) {
            if (!Auth.requireRole('INVESTOR')) return;
            this.loadController('InvestorController');
        } else {
            // Landing Page or Public
            console.log('[Router] Public Page Access');
        }
    }

    async loadController(controllerName) {
        console.log(`[Router] Loading ${controllerName}...`);
        try {
            const module = await import(`./controllers/${controllerName}.js`);
            new module.default(this.ai);
        } catch (e) {
            console.error(`[Router] Failed to load controller: ${controllerName}`, e);
        }
    }

    bindGlobalEvents() {
        // Global Listeners (e.g. Toast, Modal Closes)
        document.addEventListener('fundlink:toast', (e) => {
            this.showToast(e.detail.message, e.detail.type);
        });

        // Landing Page Role Selection
        const btnFounder = document.getElementById('btn-role-founder');
        const btnInvestor = document.getElementById('btn-role-investor');

        if (btnFounder) {
            btnFounder.addEventListener('click', () => {
                window.location.href = 'frontend/founder_authentication.html';
            });
        }

        if (btnInvestor) {
            btnInvestor.addEventListener('click', () => {
                window.location.href = 'frontend/role_commitment_&_authentication_1.html';
            });
        }

        // Bind Logout to any element with data-action="logout"
        document.querySelectorAll('[data-action="logout"]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Navbar Login Button
        const btnLogin = document.getElementById('btn-login');
        if (btnLogin) {
            btnLogin.addEventListener('click', () => {
                // Simulation: Check if already logged in
                if (Auth.getRole() === 'FOUNDER') {
                    window.location.href = 'frontend/founder_control_dashboard_2.html';
                } else if (Auth.getRole() === 'INVESTOR') {
                    window.location.href = 'frontend/investor_evaluation_dashboard_5.html'; // Feed
                } else {
                    // Simulation: Simple prompt for demo purposes
                    const role = prompt("DEMO LOGIN: Type 'founder' or 'investor' to simulate login:");
                    if (role && role.toLowerCase() === 'founder') {
                        Auth.login('FOUNDER');
                        window.location.href = 'frontend/founder_control_dashboard_2.html';
                    } else if (role && role.toLowerCase() === 'investor') {
                        Auth.login('INVESTOR');
                        window.location.href = 'frontend/investor_evaluation_dashboard_5.html';
                    } else {
                        alert("Invalid role. Please try again or use the signup buttons below.");
                    }
                }
            });
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const bgClass = type === 'error' ? 'bg-red-600' : 'bg-green-600';
        toast.className = `fixed bottom-4 right-4 ${bgClass} text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce transition-opacity duration-300`;
        toast.innerText = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    logout() {
        Auth.logout();
        this.showToast('Signed out successfully.', 'info');
        setTimeout(() => {
            window.location.href = '../frontend/fundlink_public_landing_page.html';
        }, 1000);
    }
}

// Boot the App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.FundLinkApp = new App();
});

// FundLink Demo Simulator
window.FundLinkDemo = {
    // Connection Request Logic
    sendRequest: (fromRole, targetName) => {
        const requests = JSON.parse(localStorage.getItem('fundlink_requests') || '[]');
        if (requests.find(r => r.target === targetName && r.from === fromRole)) {
            alert('Request is already pending.');
            return;
        }
        requests.push({
            from: fromRole,
            target: targetName,
            status: 'pending',
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('fundlink_requests', JSON.stringify(requests));

        // Visual Feedback
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-bounce';
        toast.innerText = `Request sent to ${targetName}!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        // Reload to update UI state if needed
        setTimeout(() => location.reload(), 1000);
    },

    getRequests: (forRole) => {
        const requests = JSON.parse(localStorage.getItem('fundlink_requests') || '[]');
        if (forRole === 'FOUNDER') return requests.filter(r => r.from === 'INVESTOR');
        if (forRole === 'INVESTOR') return requests.filter(r => r.from === 'FOUNDER');
        return [];
    },

    checkRequestStatus: (targetName, myRole) => {
        const requests = JSON.parse(localStorage.getItem('fundlink_requests') || '[]');
        const req = requests.find(r => r.target === targetName && r.from === myRole);
        return req ? req.status : null;
    },

    // For Investor side to see if a specific startup sent a request
    hasIncomingRequest: (fromName, myRole) => {
        const requests = JSON.parse(localStorage.getItem('fundlink_requests') || '[]');
        return requests.find(r => r.from === fromName && r.target === myRole);
    },

    acceptRequest: (targetName) => {
        const requests = JSON.parse(localStorage.getItem('fundlink_requests') || '[]');
        const req = requests.find(r => r.from === targetName);
        if (req) {
            req.status = 'accepted';
            localStorage.setItem('fundlink_requests', JSON.stringify(requests));
            alert(`Connection established with ${targetName}! Opening Secure Workspace...`);
            window.location.href = 'secure_workspace_negotiation.html';
        }
    }
};
