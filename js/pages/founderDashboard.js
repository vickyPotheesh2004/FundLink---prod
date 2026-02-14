
import { Auth } from '../modules/auth.js';

export async function renderFounderDashboard(section, app) {
    // 1. Fetch the external HTML content (Founder Feed / Dashboard)
    try {
        const response = await fetch('/frontend/founder_control_dashboard_3.html');
        if (!response.ok) throw new Error(`Failed to load dashboard HTML: ${response.statusText}`);
        const html = await response.text();

        // 2. Inject into Section
        section.innerHTML = html;
    } catch (error) {
        console.error('Error loading founder dashboard:', error);
        section.innerHTML = `<div class="p-8 text-center text-red-500">Error loading dashboard. Please check console.</div>`;
        return;
    }

    // 3. Logic for "Request Connection" buttons
    // We attach a global handler for simplicity in the HTML onclicks we will add
    window.founderRequestConnection = (investorName, btnId) => {
        const btn = document.getElementById(btnId);
        if (confirm(`Send connection request to ${investorName}?`)) {
            // Use the legacy method for demo data compatibility
            Auth.sendConnectionRequestLegacy('FOUNDER', 'INVESTOR', investorName);
            if (btn) {
                btn.innerText = "Request Sent";
                btn.classList.remove('bg-primary', 'hover:bg-blue-700');
                btn.classList.add('bg-slate-400', 'cursor-not-allowed');
                btn.disabled = true;
            }
            if (app && app.showToast) app.showToast(`Request sent to ${investorName}`, 'info');
        }
    };

    // 4. Filter and Sort Functions
    window.applyFounderFilters = () => {
        const domainEl = document.getElementById('filter-domain');
        const ticketEl = document.getElementById('filter-ticket');
        const locationEl = document.getElementById('filter-location');
        const stageEl = document.getElementById('filter-stage');

        const domain = domainEl ? domainEl.value : 'all';
        const ticket = ticketEl ? ticketEl.value : 'all';
        const location = locationEl ? locationEl.value : 'all';
        const stage = stageEl ? stageEl.value : 'all';

        const cards = document.querySelectorAll('.investor-card');
        cards.forEach(card => {
            const dDomain = card.getAttribute('data-domain');
            const dTicket = card.getAttribute('data-ticket');
            const dLocation = card.getAttribute('data-location');
            const dStage = card.getAttribute('data-stage');

            let show = true;
            if (domain !== 'all' && dDomain !== domain) show = false;
            if (ticket !== 'all' && dTicket !== ticket) show = false;
            if (location !== 'all' && dLocation !== location) show = false;
            if (stage !== 'all' && dStage !== stage) show = false;

            card.style.display = show ? 'flex' : 'none';
        });
    };

    window.resetFounderFilters = () => {
        const d = document.getElementById('filter-domain');
        const t = document.getElementById('filter-ticket');
        const l = document.getElementById('filter-location');
        const s = document.getElementById('filter-stage');
        const search = document.getElementById('search-investors');

        if (d) d.value = 'all';
        if (t) t.value = 'all';
        if (l) l.value = 'all';
        if (s) s.value = 'all';
        if (search) search.value = '';

        window.applyFounderFilters();
    };

    window.sortFoundersByMatchScore = () => {
        const container = document.querySelector('.space-y-4');
        if (!container) return;
        const cards = Array.from(container.querySelectorAll('.investor-card'));

        cards.sort((a, b) => {
            const scoreA = parseInt(a.getAttribute('data-match') || '0');
            const scoreB = parseInt(b.getAttribute('data-match') || '0');
            return scoreB - scoreA; // Descending order (highest first)
        });

        container.innerHTML = '';
        cards.forEach(card => container.appendChild(card));

        const sortBtn = document.getElementById('btn-founder-sort');
        if (sortBtn) {
            sortBtn.innerHTML = '<span class="material-symbols-outlined text-lg">check</span> Sorted: Highest Match';
            sortBtn.classList.remove('bg-primary/10', 'text-primary', 'border-primary/30');
            sortBtn.classList.add('bg-green-100', 'text-green-700', 'border-green-300');
        }
    };

    window.searchInvestors = (query) => {
        const cards = document.querySelectorAll('.investor-card');
        const lowerQuery = query.toLowerCase();

        cards.forEach(card => {
            const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const domains = card.querySelector('.flex.flex-wrap.gap-1\\.5')?.textContent.toLowerCase() || '';
            const location = card.getAttribute('data-location')?.toLowerCase() || '';

            const matches = name.includes(lowerQuery) || domains.includes(lowerQuery) || location.includes(lowerQuery);
            card.style.display = matches ? 'flex' : 'none';
        });
    };

    // 5. Notification and Received Interests Functions
    // Navigate to Received Interests page
    window.navigateToReceivedInterests = () => {
        window.location.hash = '#founder-received';
    };

    // Navigate to Workspace
    window.navigateToWorkspace = () => {
        window.location.hash = '#accepted-workspace';
    };

    // Update notification badge count
    window.updateNotificationCount = () => {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        const pendingCount = requests.filter(r => r.to === 'FOUNDER' && r.status === 'pending').length;

        // Update header notification badge
        const badge = document.getElementById('notification-badge');
        if (badge) {
            badge.textContent = pendingCount;
            badge.classList.toggle('hidden', pendingCount === 0);
        }

        // Update Network Insights card count
        const countEl = document.getElementById('pending-interests-count');
        if (countEl) {
            countEl.textContent = pendingCount;
        }
    };

    // Initialize notification count on load
    window.updateNotificationCount();

    // Listen for storage changes to update notification count
    window.addEventListener('storage', () => {
        window.updateNotificationCount();
    });

    // 6. Demo Mode Initialization
    // Initialize demo mode UI elements
    window.initDemoModeUI = () => {
        const demoLabel = document.getElementById('demo-mode-label');
        const roleSwitcherContainer = document.getElementById('role-switcher-container');
        const roleSwitcher = document.getElementById('role-switcher');

        if (Auth.isDemoMode()) {
            // Show demo mode UI
            if (demoLabel) demoLabel.classList.remove('hidden');
            if (roleSwitcherContainer) roleSwitcherContainer.classList.remove('hidden');

            // Set current role in switcher
            if (roleSwitcher) {
                roleSwitcher.value = Auth.getRole() || 'FOUNDER';
            }
        } else {
            // Hide demo mode UI
            if (demoLabel) demoLabel.classList.add('hidden');
            if (roleSwitcherContainer) roleSwitcherContainer.classList.add('hidden');
        }
    };

    // Handle role switching from UI
    window.handleRoleSwitch = (newRole) => {
        if (!Auth.isDemoMode()) {
            // Enable demo mode first
            Auth.enableDemoMode();
        }

        if (Auth.switchRole(newRole)) {
            // Navigate to appropriate dashboard
            const targetRoute = newRole === 'FOUNDER' ? '#founder-dashboard' : '#investor-feed';
            if (app && app.showToast) {
                app.showToast(`Switched to ${newRole} view`, 'success');
            }
            window.location.hash = targetRoute;
        }
    };

    // Initialize demo mode UI on load
    window.initDemoModeUI();

    // Listen for demo mode changes
    window.addEventListener('fundlink:demoModeChanged', () => {
        window.initDemoModeUI();
    });

    // Listen for role switches
    window.addEventListener('fundlink:roleSwitched', (e) => {
        const roleSwitcher = document.getElementById('role-switcher');
        if (roleSwitcher && e.detail.newRole) {
            roleSwitcher.value = e.detail.newRole;
        }
    });
}
