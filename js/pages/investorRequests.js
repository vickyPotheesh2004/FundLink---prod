
import { Auth } from '../modules/auth.js';

export function renderInvestorRequests(section, app) {
    const html = `
    <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div class="layout-container flex h-full grow flex-col">
            <!-- Navigation -->
            <header
                class="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ebf3] dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-3 sticky top-0 z-50">
                <div class="flex items-center gap-8">
                    <div class="flex items-center gap-3 text-primary">
                        <div class="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
                            <span class="material-symbols-outlined text-2xl">shield_lock</span>
                        </div>
                        <h2 class="text-[#0d121b] dark:text-white text-xl font-bold leading-tight tracking-tight">
                            FundLink</h2>
                    </div>
                    <nav class="hidden md:flex items-center gap-6">
                        <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                            href="#investor-feed">Evaluation Feed</a>
                        <a class="text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-1"
                            href="#investor-requests">My Requests</a>
                        <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                            href="#investor-portfolio">Portfolio</a>
                        <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                            href="#investor-thesis">Investment Thesis</a>
                        <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                            href="#investor-profile">Profile</a>
                    </nav>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-right hidden sm:block">
                        <p class="text-xs font-semibold text-[#0d121b] dark:text-white">Marcus Capital</p>
                        <p class="text-[10px] text-[#4c669a] dark:text-slate-400 uppercase tracking-widest">Master
                            Account</p>
                    </div>
                    <div data-action="logout" title="Sign Out" onclick="Auth.logout()"
                        class="bg-slate-200 dark:bg-slate-700 rounded-full size-10 overflow-hidden border-2 border-white dark:border-slate-800 cursor-pointer">
                        <img class="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoaVfnYb7X8Sy9sQLjhHbify2C4C83lW72rPan9AJZu2tMaW5U-8uqQO15s55hVBnmnEF2tzMITBkea_KON2CKcL7E8HGOFZfa3zUElWH-re94JKAWmGJRa2NIlESJnlVdYaGuUbbDdFjznSej0rEmBM2g6TY-y92SnaklY_nUzZC2u5P1KxTRHQk0ve1HZ9BOm_vjk3fKpJQslt3-rXtLbdZEele_6a5_WzoRBHKY7GZk9Ngjphl8DkVa6b_JFi0Gz8TbbQq92rU" />
                    </div>
                </div>
            </header>

            <main class="flex-1 p-8">
                <div class="max-w-5xl mx-auto">
                    <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 class="text-3xl font-black text-[#0d121b] dark:text-white tracking-tight">Connection
                                Requests</h1>
                            <p class="text-slate-500 dark:text-slate-400 mt-1">Manage incoming proposals and track your
                                outgoing interest.</p>
                        </div>
                    </div>

                    <!-- Requests Container -->
                    <div id="requests-container" class="space-y-4">
                        <div class="text-center py-12 opacity-60">
                            <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full mb-4"
                                role="status"></div>
                            <p>Loading requests...</p>
                        </div>
                    </div>
                </div>
            </main>

            <footer
                class="bg-slate-900 text-white px-8 py-2.5 flex items-center justify-between text-[11px] font-medium tracking-wide">
                <div class="flex items-center gap-6">
                    <div class="flex items-center gap-1.5 text-green-400"><span
                            class="material-symbols-outlined text-sm">lock</span><span>Privacy-First Mode Active</span>
                    </div>
                </div>
                <div class="opacity-60">Secure Tunnel: AES-256</div>
            </footer>
        </div>
    </div>
    `;

    section.innerHTML = html;

    // Logic
    const formatDate = (isoString) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) { return 'Just now'; }
    };

    const renderRequests = () => {
        const container = document.getElementById('requests-container');
        const allRequests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');

        // Filter relevant to ME (Marcus Capital / INVESTOR)
        const myRequests = allRequests.filter(r =>
            (r.to === 'Marcus Capital' || r.to === 'INVESTOR') ||
            (r.from === 'Marcus Capital' || r.from === 'INVESTOR')
        );

        if (myRequests.length === 0) {
            container.innerHTML = `
                <div class="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                    <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">inbox</span>
                    <p class="text-slate-500 font-medium">No connection activity yet.</p>
                </div>`;
            return;
        }

        myRequests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        let html = '';
        myRequests.forEach(req => {
            const isIncoming = (req.to === 'Marcus Capital' || req.to === 'INVESTOR');
            const isPending = req.status === 'pending';
            const isAccepted = req.status === 'accepted';
            const isRejected = req.status === 'rejected';

            let statusBadge = '';
            if (isPending) statusBadge = `<span class="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded uppercase">Pending</span>`;
            if (isAccepted) statusBadge = `<span class="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">Active</span>`;
            if (isRejected) statusBadge = `<span class="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">Declined</span>`;

            const displayName = isIncoming ? (req.from === 'FOUNDER' ? 'Stealth Founder' : req.from) : (req.targetName || req.to);

            html += `
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all">
                    <div class="flex items-center gap-4 w-full md:w-auto">
                        <div class="size-12 rounded-full ${isIncoming ? 'bg-blue-50 text-primary' : 'bg-slate-100 text-slate-500'} flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined">${isIncoming ? 'input' : 'output'}</span>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-[#0d121b] dark:text-white">${displayName}</h3>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="text-xs font-semibold text-slate-500 uppercase tracking-widest">${isIncoming ? 'Incoming Request' : 'Outgoing Request'}</span>
                                <span class="text-slate-300">•</span>
                                <span class="text-xs text-slate-400">${formatDate(req.timestamp)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div class="mr-4">${statusBadge}</div>
                        
                        <!-- Actions -->
                        ${isIncoming && isPending ? `
                            <div class="flex gap-2">
                                <button onclick="window.handleRequest(${req.id}, 'accepted')" class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                    Accept
                                </button>
                                <button onclick="window.handleRequest(${req.id}, 'rejected')" class="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-lg transition-colors">
                                    Decline
                                </button>
                            </div>
                        ` : ''}

                        ${!isIncoming && isPending ? `
                            <button onclick="window.withdrawRequest(${req.id})" class="px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                                Withdraw
                            </button>
                        ` : ''}
                        
                        ${isAccepted ? `
                            <a href="#accepted-workspace" class="px-4 py-2 border border-slate-200 dark:border-slate-700 text-primary text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px]">chat</span>
                                Open Workspace
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    };

    window.handleRequest = (id, newStatus) => {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        const idx = requests.findIndex(r => r.id === id);
        if (idx !== -1) {
            requests[idx].status = newStatus;
            localStorage.setItem('fundlink_connection_requests', JSON.stringify(requests));
            renderRequests();
        }
    };

    window.withdrawRequest = (id) => {
        if (confirm('Are you sure you want to withdraw this connection request?')) {
            const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
            const filtered = requests.filter(r => r.id !== id);
            localStorage.setItem('fundlink_connection_requests', JSON.stringify(filtered));
            renderRequests();
        }
    };

    renderRequests();
}
