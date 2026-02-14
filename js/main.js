/**
 * FundLink SPA — Main Entry Point & Router
 * Integrated with all 23 frontend modules.
 */
import { Auth } from './modules/auth.js';
// Expose Auth globally for legacy HTML onclick handlers
window.Auth = Auth;
import { AIClient } from './modules/AIClient.js';
import { renderStatic } from './modules/renderStatic.js';

// Page Renderers (Dynamic)
import { renderFounderDashboard } from './pages/founderDashboard.js';
import { renderFounderProfile } from './pages/founderProfile.js';
import { renderFounderSent } from './pages/founderSent.js';
// import { renderFounderInbox } from './pages/founderInbox.js'; // To be mapped
import { renderFounderInbox } from './pages/founderInbox.js';
import { renderFounderReceived } from './pages/founderReceived.js';
import { renderFounderSettings } from './pages/founderSettings.js';
import { renderInvestorFeed } from './pages/investorFeed.js';
import { renderInvestorRequests } from './pages/investorRequests.js';
import { renderInvestorPortfolio } from './pages/investorPortfolio.js';
import { renderInvestorThesis } from './pages/investorThesis.js';
import { renderInvestorProfile } from './pages/investorProfile.js';
import { renderWorkspace } from './pages/workspace.js';
import { renderDealClosure } from './pages/dealClosure.js';
import { renderAcceptedWorkspace } from './pages/acceptedWorkspace.js';

// ─── Route Map ──────────────────────────────────────────────
const ROUTES = {
    // Public / Auth
    'landing': {
        role: null,
        renderer: (s, a) => renderStatic(s, a, '/frontend/fundlink_public_landing_page.html')
    },
    'role-select': {
        role: null,
        renderer: (s, a) => renderStatic(s, a, '/frontend/role_commitment_&_authentication_5.html')
    },

    // Investor Auth Flow
    'investor-auth': {
        role: null,
        renderer: async (s, a) => {
            await renderStatic(s, a, '/frontend/role_commitment_&_authentication_2.html');
            const btn = document.getElementById('btn-verify-investor');
            if (btn) {
                btn.addEventListener('click', () => {
                    Auth.login('INVESTOR');
                    // Create initial investor profile
                    Auth.saveUserProfile({
                        name: 'Investor User',
                        firmName: 'My VC Fund',
                        thesis: ['saas', 'fintech'],
                        stage: ['seed', 'series-a'],
                        location: 'bangalore',
                        ticketSize: '1m-5m',
                        ticketRange: '$1M - $5M',
                        description: 'Early-stage investor',
                        domains: ['SaaS', 'FinTech'],
                        investorType: 'Institutional VC'
                    });
                    window.location.hash = '#investor-verify';
                });
            }
        }
    },
    'investor-verify': {
        role: null,
        renderer: (s, a) => renderStatic(s, a, '/frontend/role_commitment_&_authentication_1.html')
    },
    'investor-audit': {
        role: null,
        renderer: async (s, a) => {
            await renderStatic(s, a, '/frontend/role_commitment_&_authentication_6.html');
            setTimeout(() => {
                window.location.hash = '#investor-feed';
            }, 3000);
        }
    },

    // Founder Auth Flow
    'founder-auth': {
        role: null,
        renderer: async (s, a) => {
            await renderStatic(s, a, '/frontend/role_commitment_&_authentication_3.html');
            const btn = document.getElementById('btn-verify-identity');
            if (btn) {
                btn.addEventListener('click', () => {
                    Auth.login('FOUNDER');
                    // Create initial founder profile
                    Auth.saveUserProfile({
                        name: 'Founder User',
                        companyName: 'My Startup',
                        stage: 'seed',
                        domain: 'saas',
                        location: 'bangalore',
                        ticketSize: '500k-1m',
                        description: 'Innovative SaaS startup',
                        aiScore: Math.floor(Math.random() * 20) + 75 // Random score 75-95
                    });
                    window.location.hash = '#founder-verify';
                });
            }
        }
    },
    'founder-verify': {
        role: null,
        renderer: async (s, a) => {
            await renderStatic(s, a, '/frontend/role_commitment_&_authentication_4.html');
            // Add profile form submission handler
            setTimeout(() => {
                const continueBtn = document.querySelector('button[onclick*="founder-audit"], button[data-nav="founder-audit"]');
                if (continueBtn) {
                    continueBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Collect form data and update profile
                        const nameInput = document.querySelector('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]');
                        const companyInput = document.querySelector('input[name="company"], input[placeholder*="company"], input[placeholder*="Company"]');
                        const domainSelect = document.querySelector('select[name="domain"], select[id*="domain"]');

                        const currentProfile = Auth.getCurrentUserProfile() || {};
                        Auth.saveUserProfile({
                            ...currentProfile,
                            name: nameInput?.value || currentProfile.name || 'Founder User',
                            companyName: companyInput?.value || currentProfile.companyName || 'My Startup',
                            domain: domainSelect?.value || currentProfile.domain || 'saas'
                        });
                        window.location.hash = '#founder-audit';
                    });
                }
            }, 100);
        }
    },
    'founder-audit': {
        role: null,
        renderer: async (s, a) => {
            await renderStatic(s, a, '/frontend/role_commitment_&_authentication_7.html');
            setTimeout(() => {
                window.location.hash = '#founder-dashboard';
            }, 3000);
        }
    },

    // Founder Dashboard
    'founder-dashboard': { role: 'FOUNDER', renderer: renderFounderDashboard },
    'founder-profile': {
        role: 'FOUNDER',
        renderer: (s, a) => renderStatic(s, a, '/frontend/founder_control_dashboard_2.html')
    },
    'founder-analytics': {
        role: 'FOUNDER',
        renderer: (s, a) => renderStatic(s, a, '/frontend/founder_control_dashboard_3.html')
    },
    'founder-settings': { role: 'FOUNDER', renderer: renderFounderSettings },
    'founder-sent': { role: 'FOUNDER', renderer: renderFounderSent },
    'founder-inbox': { role: 'FOUNDER', renderer: renderFounderInbox },
    'founder-received': { role: 'FOUNDER', renderer: renderFounderReceived },

    // Investor Dashboard
    'investor-feed': { role: 'INVESTOR', renderer: renderInvestorFeed }, // investor_evaluation_dashboard_5.html
    'investor-requests': { role: 'INVESTOR', renderer: renderInvestorRequests }, // investor_evaluation_dashboard_3.html (Sent)
    'investor-portfolio': { role: 'INVESTOR', renderer: renderInvestorPortfolio }, // investor_evaluation_dashboard_2.html
    'investor-thesis': { role: 'INVESTOR', renderer: renderInvestorThesis }, // investor_evaluation_dashboard_4.html (Thesis)
    'investor-profile': { role: 'INVESTOR', renderer: renderInvestorProfile }, // investor_evaluation_dashboard_1.html
    'investor-incoming': {
        role: 'INVESTOR',
        renderer: (s, a) => renderStatic(s, a, '/frontend/incoming_connection_requests.html')
    },

    // Shared
    'workspace': { role: 'ANY', renderer: renderWorkspace }, // secure_workspace_negotiation.html
    'accepted-workspace': { role: 'ANY', renderer: renderAcceptedWorkspace }, // Accepted connections workspace
    'deal-closure': { role: 'ANY', renderer: renderDealClosure }, // final_deal_closure_modal.html
};

const DEFAULT_ROUTE = 'landing';

// ─── App Class ──────────────────────────────────────────────
class App {
    constructor() {
        this.ai = new AIClient('DEMO');
        this.currentRoute = null;
        this.init();
    }

    init() {
        console.log('[FundLink] Booting SPA…');
        window.addEventListener('hashchange', () => this.navigate());
        this.bindGlobalUI();
        this.navigate();
    }

    // ── Navigation ──────────────────────────────────────────
    navigate() {
        const hash = (window.location.hash || '').replace('#', '') || DEFAULT_ROUTE;
        const route = ROUTES[hash];

        if (!route) {
            console.warn(`[Router] Unknown route: #${hash}, falling back to landing`);
            window.location.hash = '#landing';
            return;
        }

        // Role guard
        if (route.role && route.role !== 'ANY') {
            if (!Auth.isLoggedIn() || Auth.getRole() !== route.role) {
                console.warn(`[Router] Access denied for #${hash}. Required: ${route.role}`);
                this.showToast('Access restricted. Please log in with the correct role.', 'error');
                window.location.hash = '#role-select';
                return;
            }
        }
        if (route.role === 'ANY' && !Auth.isLoggedIn()) {
            this.showToast('Please log in first.', 'error');
            window.location.hash = '#role-select';
            return;
        }

        // Hide all sections
        document.querySelectorAll('.page-section').forEach(s => {
            s.classList.add('hidden');
        });

        // Show target section
        const section = document.getElementById(`page-${hash}`);
        if (section) {
            section.classList.remove('hidden');
            section.style.display = '';

            // Render dynamic content if needed
            if (route.renderer) {
                // We pass 'this' (the app instance) so renderers can use showToast etc.
                route.renderer(section, this);
            }
        } else {
            console.error(`[Router] Section not found: #page-${hash}`);
        }

        this.currentRoute = hash;
        window.scrollTo(0, 0);
        console.log(`[Router] Navigated to #${hash}`);
    }

    // ── Global UI Bindings ──────────────────────────────────
    bindGlobalUI() {
        // We defer binding specific button lookups (like landing-login-btn) 
        // until after the View is rendered by renderStatic/renderModule.
        // Instead, we use event delegation where possible or let the specific page renderer handle it.

        // Navigation links (Global delegation)
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('[href^="#"]');
            if (link) {
                // standard hash nav handled by browser
                return;
            }

            const navBtn = e.target.closest('[data-nav]');
            if (navBtn) {
                e.preventDefault();
                window.location.hash = '#' + navBtn.getAttribute('data-nav');
            }

            // Global Login Button (if present in header)
            if (e.target.closest('#landing-login-btn') || e.target.id === 'btn-login') {
                this.handleLogin();
            }

            // Role Buttons on Landing
            if (e.target.closest('#btn-role-founder')) {
                window.location.hash = '#founder-auth';
            }
            if (e.target.closest('#btn-role-investor')) {
                window.location.hash = '#investor-auth';
            }

            // Global Support Button Handler
            const supportBtn = e.target.closest('button');
            if (supportBtn && (supportBtn.innerText.includes('Support') || supportBtn.querySelector('.material-symbols-outlined')?.textContent === 'help_outline')) {
                this.showToast('Support agent notified. Wait time: < 2 mins.', 'info');
            }
        });

        // Toast event
        document.addEventListener('fundlink:toast', (e) => {
            this.showToast(e.detail.message, e.detail.type);
        });

        // Modal close handlers
        const closeModalHandler = (id) => this.closeModal(id);

        document.getElementById('close-readiness-modal')?.addEventListener('click', () => {
            closeModalHandler('readiness-modal');
            window.location.hash = '#founder-dashboard';
        });
        document.getElementById('readiness-backdrop')?.addEventListener('click', () => closeModalHandler('readiness-modal'));

        document.getElementById('close-ai-report-modal')?.addEventListener('click', () => closeModalHandler('ai-report-modal'));
        document.getElementById('ai-modal-backdrop')?.addEventListener('click', () => closeModalHandler('ai-report-modal'));
    }

    handleLogin() {
        if (Auth.isLoggedIn()) {
            const role = Auth.getRole();
            if (role === 'FOUNDER') {
                window.location.hash = '#founder-profile';
            } else {
                window.location.hash = '#investor-feed';
            }
            return;
        }

        // Ensure we are on a login-capable page or redirect
        window.location.hash = '#role-select';
    }

    // ── Toast ───────────────────────────────────────────────
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        const bg = type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-amber-600' : 'bg-green-600';
        toast.className = `${bg} text-white px-6 py-3 rounded-lg shadow-xl text-sm font-medium transition-all duration-300 transform translate-x-full opacity-0`;
        toast.textContent = message;
        container.appendChild(toast);
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        });
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // ── Modal ───────────────────────────────────────────────
    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('hidden');
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('hidden');
    }
}

// ─── Boot ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    window.FundLinkApp = new App();
});

// ─── FundLink Demo Simulator (global helper) ───────────────
window.FundLinkDemo = {
    // ... (Existing Demo Logic preserved if needed, or moved to a module)
    sendRequest: (fromRole, targetName) => {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        if (requests.find(r => r.to === targetName && r.from === fromRole)) {
            window.FundLinkApp?.showToast('Request is already pending.', 'warning');
            return;
        }
        requests.push({
            id: Date.now(),
            from: fromRole,
            to: targetName,
            targetName: targetName,
            status: 'pending',
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('fundlink_connection_requests', JSON.stringify(requests));
        window.FundLinkApp?.showToast(`Request sent to ${targetName}!`, 'info');
    },
    // ...
};
