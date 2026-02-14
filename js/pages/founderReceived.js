
/**
 * Founder Received Connections Page Renderer
 * Displays accepted connections and active partnerships.
 * Updates: Matches layout of `founder_received_interests.html`.
 */

import { Auth } from '../modules/auth.js';

export async function renderFounderReceived(section, app) {
    try {
        const response = await fetch('/frontend/founder_received_interests.html');
        if (!response.ok) throw new Error(`Failed to load received interests HTML: ${response.statusText}`);
        const html = await response.text();
        section.innerHTML = html;
    } catch (error) {
        console.error('Error loading received interests:', error);
        section.innerHTML = `<div class="p-8 text-center text-red-500">Error loading page.</div>`;
        return;
    }

    // Logic
    const grid = section.querySelector('#received-grid');
    const tabs = section.querySelectorAll('.tab-btn');
    let currentTab = 'pending';

    const getRequests = () => {
        // Mocking incoming requests from investors TO founders
        const activeRequests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        return activeRequests.filter(r => r.to === 'FOUNDER');
    };

    const renderGrid = () => {
        const requests = getRequests();
        const pending = requests.filter(r => r.status === 'pending');
        const accepted = requests.filter(r => r.status === 'accepted');
        const declined = requests.filter(r => r.status === 'declined');

        // Update Badges
        const pendingBadge = section.querySelector('#pending-badge');
        const acceptedBadge = section.querySelector('#accepted-badge');

        if (pendingBadge) {
            if (pending.length) {
                pendingBadge.textContent = pending.length;
                pendingBadge.classList.remove('hidden');
            } else {
                pendingBadge.classList.add('hidden');
            }
        }

        if (acceptedBadge) {
            if (accepted.length) {
                acceptedBadge.textContent = accepted.length;
                acceptedBadge.classList.remove('hidden');
            } else {
                acceptedBadge.classList.add('hidden');
            }
        }

        // Filter by Tab
        let displayed = [];
        if (currentTab === 'pending') displayed = pending;
        else if (currentTab === 'accepted') displayed = accepted;
        else if (currentTab === 'declined') displayed = declined;

        if (displayed.length === 0) {
            grid.innerHTML = `
                <div class="col-span-2 text-center py-16 opacity-60">
                    <div class="inline-flex items-center justify-center size-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                         <span class="material-symbols-outlined text-3xl text-slate-400">inbox</span>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">No ${currentTab} requests</h3>
                    <p class="text-sm text-slate-500 mt-1">
                        ${currentTab === 'pending' ? 'Wait for investors to discover your profile.' : 'You haven\'t connected with anyone yet.'}
                    </p>
                </div>
            `;
            return;
        }

        grid.innerHTML = displayed.map(req => {
            const isPending = req.status === 'pending';

            // Generate some mock data if missing
            const thesisMatch = req.thesisMatch || '92%';
            const ticketSize = req.ticketSize || '$1M - $2M';
            const investorType = req.investorType || 'Institutional VC';
            const receivedTime = new Date(req.timestamp).toLocaleDateString();

            return `
            <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 card-shadow flex flex-col sm:flex-row gap-5 items-start">
                <div class="size-16 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                    <span class="material-symbols-outlined text-primary text-3xl">corporate_fare</span>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span class="material-symbols-outlined text-[12px]">check_circle</span> ${thesisMatch} Match
                        </span>
                        <span class="text-slate-300 dark:text-slate-700">|</span>
                        <span class="text-slate-500 text-[11px] font-medium">Received ${receivedTime}</span>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white truncate">${req.from}</h3>
                    <p class="text-slate-500 text-sm mt-1 mb-4 line-clamp-1 italic">"Interested in your sector."</p>
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ticket Size Range</p>
                            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">${ticketSize}</p>
                        </div>
                        <div>
                            <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Investor Type</p>
                            <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">${investorType}</p>
                        </div>
                    </div>
                    
                    ${isPending ? `
                    <div class="flex items-center gap-2">
                        <button data-id="${req.id}" class="btn-accept flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-lg">handshake</span> Accept
                        </button>
                        <button data-id="${req.id}" class="btn-decline flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                            <span class="material-symbols-outlined text-lg">close</span> Decline
                        </button>
                    </div>
                    ` : `
                    <div class="w-full space-y-2">
                        <div class="py-2 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg text-center">
                            <span class="text-green-700 dark:text-green-400 text-sm font-bold flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined">check</span> ${req.status === 'accepted' ? 'Connected' : 'Declined'}
                            </span>
                        </div>
                        ${req.status === 'accepted' ? `
                        <a href="#accepted-workspace" class="block w-full py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors text-center">
                            <span class="material-symbols-outlined text-lg align-middle mr-1">chat</span> Open Workspace
                        </a>
                        ` : ''}
                    </div>
                    `}
                </div>
            </div>
            `;
        }).join('');

        // Attach Listeners
        section.querySelectorAll('.btn-accept').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                updateRequestStatus(id, 'accepted');
            });
        });

        section.querySelectorAll('.btn-decline').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                updateRequestStatus(id, 'declined');
            });
        });
    };

    const updateRequestStatus = (id, status) => {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        // Handle both numeric and string IDs for comparison
        const idx = requests.findIndex(r => String(r.id) === String(id));
        if (idx !== -1) {
            requests[idx].status = status;
            localStorage.setItem('fundlink_connection_requests', JSON.stringify(requests));
            // Show toast
            if (app && app.showToast) {
                app.showToast(`Request ${status}`, 'success');
            }
            renderGrid();
        }
    };

    // Tab Logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            tabs.forEach(t => {
                t.classList.remove('border-primary', 'text-primary');
                t.classList.add('border-transparent', 'text-slate-500');
            });
            tab.classList.remove('border-transparent', 'text-slate-500');
            tab.classList.add('border-primary', 'text-primary');

            currentTab = tab.dataset.tab;
            renderGrid();
        });
    });

    renderGrid();
}
