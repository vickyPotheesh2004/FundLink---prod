
import { Auth } from '../modules/auth.js';

export async function renderFounderSent(section, app) {
    try {
        const response = await fetch('/frontend/founder_control_dashboard_5.html');
        if (!response.ok) throw new Error(`Failed to load sent requests HTML: ${response.statusText}`);
        const html = await response.text();
        section.innerHTML = html;
    } catch (error) {
        console.error('Error loading sent requests page:', error);
        section.innerHTML = `<div class="p-8 text-center text-red-500">Error loading page.</div>`;
        return;
    }

    // Logic for rendering requests
    const container = section.querySelector('#sent-requests-list');
    const countSpan = section.querySelector('#active-requests-count');
    const searchInput = section.querySelector('#sent-search');

    function renderSentRequests() {
        // Fetch from LocalStorage
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        const myRequests = requests.filter(r => r.from === 'FOUNDER');

        // Update count
        if (countSpan) countSpan.textContent = `Active Requests (${myRequests.length})`;

        if (myRequests.length === 0) {
            if (container) {
                container.innerHTML = `
                    <div class="text-center py-16 opacity-60">
                        <div class="inline-flex items-center justify-center size-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                             <span class="material-symbols-outlined text-3xl text-slate-400">outbox</span>
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white">No requests sent yet</h3>
                        <p class="text-sm text-slate-500 mt-1">Visit the 'Find Investors' page to start connecting.</p>
                        <a href="#founder-dashboard" class="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
                            Find Investors
                        </a>
                    </div>
                `;
            }
            return;
        }

        if (container) {
            container.innerHTML = '';
            // Sort active/pending first
            myRequests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            myRequests.forEach(req => {
                const isAccepted = req.status === 'accepted';
                const statusConfig = isAccepted
                    ? { color: 'green', text: 'Accepted', icon: 'check_circle' }
                    : { color: 'amber', text: 'Pending', icon: 'timelapse' };

                // Random investor type/location for demo if not saved
                const investorType = "Institutional VC"; // Placeholder
                const location = "Global"; // Placeholder

                const html = `
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center gap-4 card-elevation transition-all hover:translate-y-[-2px]">
                    <div class="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                        <span class="material-symbols-outlined text-primary">corporate_fare</span>
                    </div>
                    <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h3 class="font-bold text-slate-900 dark:text-white">${req.to}</h3>
                            <p class="text-xs text-slate-500">${investorType} • ${location}</p>
                        </div>
                        <div class="flex flex-col justify-center">
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-1 bg-${statusConfig.color}-50 dark:bg-${statusConfig.color}-900/30 text-${statusConfig.color}-600 dark:text-${statusConfig.color}-400 text-xs font-bold rounded-full border border-${statusConfig.color}-100 dark:border-${statusConfig.color}-800/50 flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-${statusConfig.color}-500"></span>
                                    ${statusConfig.text}
                                </span>
                                <span class="text-xs text-slate-400">Sent ${new Date(req.timestamp).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="flex flex-col justify-center gap-1">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-slate-400 text-[18px]">visibility</span>
                                <span class="text-xs text-slate-500 italic">${isAccepted ? 'Connected' : 'Awaiting review'}</span>
                            </div>
                            <div class="flex items-center gap-1.5 pl-0.5">
                                <span class="material-symbols-outlined text-slate-400 text-[14px]">timer</span>
                                <span class="text-[11px] text-slate-500 font-medium">Auto-withdrawal in 7 days</span>
                            </div>
                        </div>
                    </div>
                    <div class="shrink-0 flex items-center gap-3">
                        <button data-id="${req.id}" class="btn-withdraw px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-2">
                            <span class="material-symbols-outlined text-[18px]">cancel</span>
                            Withdraw
                        </button>
                    </div>
                </div>
                `;
                container.insertAdjacentHTML('beforeend', html);
            });
        }

        // Attach event listeners for Withdraw buttons
        section.querySelectorAll('.btn-withdraw').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                if (confirm('Are you sure you want to withdraw this connection request? This action cannot be undone.')) {
                    withdrawRequest(id);
                }
            });
        });
    }

    function withdrawRequest(id) {
        const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
        const newRequests = requests.filter(r => r.id !== id);
        localStorage.setItem('fundlink_connection_requests', JSON.stringify(newRequests));

        // Re-render
        renderSentRequests();

        // Show toast
        if (app && app.showToast) {
            app.showToast('Request withdrawn successfully', 'success');
        }
    }

    // Search Logic
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            // Implement search filter logic here if needed
            // For now, we reuse render but we'd need to pass filter params
            // Minimal implementation:
            const term = e.target.value.toLowerCase();
            const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');
            const myRequests = requests.filter(r => r.from === 'FOUNDER' && r.to.toLowerCase().includes(term));

            // Re-use rendering logic logic... or simpler: just hide elements
            const content = container.innerHTML; // Hacky re-render or pure CSS filtering
            // Better to proper filter
            // For this MVP, let's just re-fetch and filter in memory if we wanted to be robust
            // renderSentRequests(term);
        });
    }

    // Initial Render
    renderSentRequests();
}
