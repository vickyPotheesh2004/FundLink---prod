
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

        // Check for existing pending request
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        const existingRequest = requests.find(r =>
            r.targetName === investorName &&
            r.from === 'FOUNDER' &&
            r.to === 'INVESTOR' &&
            r.status === 'pending'
        );

        if (existingRequest) {
            if (app && app.showToast) app.showToast(`You already have a pending request to ${investorName}`, 'warning');
            return;
        }

        if (confirm(`Send connection request to ${investorName}?`)) {
            // Create connection request
            const currentUserId = Auth.getCurrentUserId();
            const currentUserProfile = Auth.getCurrentUserProfile();
            const founderName = currentUserProfile?.name || currentUserProfile?.companyName || 'Founder';

            const newRequest = {
                id: `req_${Date.now()}`,
                from: 'FOUNDER',
                fromUserId: currentUserId,
                fromName: founderName,
                to: 'INVESTOR',
                targetName: investorName,
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // Save to localStorage
            requests.push(newRequest);
            localStorage.setItem('fundlink_connection_requests', JSON.stringify(requests));

            if (btn) {
                btn.innerText = "Request Sent";
                btn.classList.remove('bg-primary', 'hover:bg-blue-700');
                btn.classList.add('bg-slate-400', 'cursor-not-allowed');
                btn.disabled = true;
            }
            if (app && app.showToast) app.showToast(`Request sent to ${investorName}`, 'success');

            console.log('[FounderDashboard] Connection request sent:', newRequest);
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
        let visibleCount = 0;

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
            if (show) visibleCount++;
        });

        console.log(`[FounderDashboard] Filters applied, ${visibleCount} cards visible`);
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
        if (app && app.showToast) app.showToast('Filters cleared', 'info');
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

        if (app && app.showToast) app.showToast('Sorted by match score', 'success');
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
        console.log('[FounderDashboard] Navigating to received interests...');
        window.location.hash = '#founder-received';
    };

    // Navigate to Workspace
    window.navigateToWorkspace = () => {
        window.location.hash = '#accepted-workspace';
    };

    // Navigate to Settings
    window.navigateToSettings = () => {
        window.location.hash = '#founder-settings';
    };

    // Navigate to Profile
    window.navigateToProfile = () => {
        window.location.hash = '#founder-profile';
    };

    // Update notification badge count
    window.updateNotificationCount = () => {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        // Count pending requests where founder is the recipient
        const pendingCount = requests.filter(r =>
            (r.to === 'FOUNDER' || r.toRole === 'FOUNDER') &&
            r.status === 'pending'
        ).length;

        console.log('[FounderDashboard] Updating notification count:', pendingCount);

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

        return pendingCount;
    };

    // Initialize notification count on load
    setTimeout(() => {
        window.updateNotificationCount();
    }, 100);

    // Listen for storage changes to update notification count
    window.addEventListener('storage', () => {
        window.updateNotificationCount();
    });

    // Listen for request updates
    window.addEventListener('fundlink:requestUpdate', () => {
        window.updateNotificationCount();
    });

    // 6. Demo Mode Initialization
    // Initialize demo mode UI elements - Always show role switcher for seamless access
    window.initDemoModeUI = () => {
        const demoLabel = document.getElementById('demo-mode-label');
        const roleSwitcherContainer = document.getElementById('role-switcher-container');
        const roleSwitcher = document.getElementById('role-switcher');

        // Always show role switcher for seamless access
        if (roleSwitcherContainer) roleSwitcherContainer.classList.remove('hidden');

        // Set current role in switcher
        if (roleSwitcher) {
            roleSwitcher.value = Auth.getRole() || 'FOUNDER';
        }

        // Show demo label if in demo mode
        if (demoLabel) {
            if (Auth.isDemoMode()) {
                demoLabel.classList.remove('hidden');
            } else {
                demoLabel.classList.add('hidden');
            }
        }
    };

    // Handle role switching from UI - Always allowed for seamless access
    window.handleRoleSwitch = (newRole) => {
        console.log('[FounderDashboard] Role switch requested:', newRole);
        // Role switching is always allowed - no demo mode required
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
    setTimeout(() => {
        window.initDemoModeUI();
        window.updateNotificationCount();
    }, 100);

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
