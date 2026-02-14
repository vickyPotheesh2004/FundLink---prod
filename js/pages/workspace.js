/**
 * Workspace Page Renderer
 * Secure negotiation workspace for connected parties.
 * Accessible by both Founders and Investors.
 */
import { Auth } from '../modules/auth.js';

export function renderWorkspace(section, app) {
    const role = Auth.getRole();
    const isFounder = role === 'FOUNDER';

    section.innerHTML = `
    <header class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
        <div class="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-2.5">
                    <div class="bg-primary p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fill-rule="evenodd"></path></svg>
                    </div>
                    <h1 class="text-lg font-bold tracking-tight">FundLink</h1>
                </div>
                <div class="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-800">
                    <span class="material-symbols-outlined text-[16px] text-green-600">lock_open</span>
                    <span class="text-[11px] font-bold text-green-600 uppercase tracking-wider">Secure Workspace</span>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <a href="${isFounder ? '#founder-profile' : '#investor-profile'}" class="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">Back to Dashboard</a>
            </div>
        </div>
    </header>
    <div class="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
        <main class="space-y-8 pb-20">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Secure Workspace</h2>
                    <p class="text-sm text-slate-500 mt-1">Encrypted end-to-end. Shared documents and negotiation tools.</p>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span class="text-xs font-bold text-green-700 dark:text-green-400">Connection Active</span>
                </div>
            </div>

            <!-- Info Panel -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-symbols-outlined text-primary">description</span>
                        <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400">Shared Documents</h3>
                    </div>
                    <ul class="space-y-2 text-sm">
                        <li class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span class="material-symbols-outlined text-red-500 text-lg">picture_as_pdf</span> Pitch_Deck_v2.4.pdf
                        </li>
                        <li class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span class="material-symbols-outlined text-blue-500 text-lg">table_chart</span> Financial_Model.xlsx
                        </li>
                        <li class="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                            <span class="material-symbols-outlined text-green-500 text-lg">article</span> Term_Sheet_Draft.docx
                        </li>
                    </ul>
                </div>

                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-symbols-outlined text-primary">timeline</span>
                        <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400">Activity Log</h3>
                    </div>
                    <ul class="space-y-3 text-xs text-slate-500">
                        <li class="flex items-start gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></span>
                            <span>Connection established <span class="text-slate-400">• 2 days ago</span></span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></span>
                            <span>Pitch deck shared <span class="text-slate-400">• 1 day ago</span></span>
                        </li>
                        <li class="flex items-start gap-2">
                            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                            <span>AI report generated <span class="text-slate-400">• 6 hours ago</span></span>
                        </li>
                    </ul>
                </div>

                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-sm">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-symbols-outlined text-primary">contact_mail</span>
                        <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400">Contact Details</h3>
                    </div>
                    <div class="space-y-2 text-sm">
                        <p class="text-slate-600 dark:text-slate-300"><span class="text-xs text-slate-400 uppercase tracking-wider block mb-0.5">Name</span>${isFounder ? 'Investor Partner' : 'Aditya Sharma'}</p>
                        <p class="text-slate-600 dark:text-slate-300"><span class="text-xs text-slate-400 uppercase tracking-wider block mb-0.5">Email</span>${isFounder ? 'partner@fund.com' : 'aditya@skylineai.io'}</p>
                    </div>
                </div>
            </div>

            <!-- Message Area -->
            <section class="bg-white border border-slate-200 rounded-xl p-6 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
                <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Secure Messages</h3>
                <div id="workspace-messages" class="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    <div class="flex gap-3">
                        <div class="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-primary text-sm">person</span>
                        </div>
                        <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 max-w-lg">
                            <p class="text-xs text-slate-400 mb-1">System • Welcome</p>
                            <p class="text-sm text-slate-600 dark:text-slate-300">Secure workspace established. All messages are encrypted end-to-end.</p>
                        </div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <input id="workspace-msg-input" class="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm px-4 py-2.5 focus:ring-primary focus:border-primary" placeholder="Type a message..." type="text" />
                    <button id="workspace-send-btn" class="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">Send</button>
                </div>
            </section>

            <!-- Actions -->
            <div class="flex items-center gap-4 justify-center">
                <a href="#deal-closure" class="px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2">
                    <span class="material-symbols-outlined">gavel</span> Proceed to Deal Closure
                </a>
                <button id="generate-report-btn" class="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-lg hover:border-primary transition-colors flex items-center gap-2 shadow-sm">
                    <span class="material-symbols-outlined text-primary">insights</span> Generate AI Report
                </button>
            </div>
        </main>
    </div>
    <footer class="bg-slate-900 text-white py-2 px-6">
        <div class="max-w-[1200px] mx-auto flex items-center justify-between text-[11px] font-medium tracking-wide uppercase opacity-80">
            <div class="flex items-center gap-4">
                <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> End-to-End Encrypted</span>
                <span>Workspace Session Active</span>
            </div>
            <div>© 2024 FundLink • Bangalore, India</div>
        </div>
    </footer>`;

    // Bind message send
    const msgInput = document.getElementById('workspace-msg-input');
    const msgContainer = document.getElementById('workspace-messages');
    document.getElementById('workspace-send-btn')?.addEventListener('click', () => {
        const text = msgInput?.value?.trim();
        if (!text) return;
        const msgEl = document.createElement('div');
        msgEl.className = 'flex gap-3 justify-end';
        msgEl.innerHTML = `
            <div class="bg-primary/10 rounded-lg p-3 max-w-lg">
                <p class="text-xs text-primary mb-1">You • Just now</p>
                <p class="text-sm text-slate-600 dark:text-slate-300">${text}</p>
            </div>`;
        msgContainer?.appendChild(msgEl);
        msgInput.value = '';
        msgContainer.scrollTop = msgContainer.scrollHeight;
    });

    msgInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('workspace-send-btn')?.click();
    });

    // AI Report button
    document.getElementById('generate-report-btn')?.addEventListener('click', async () => {
        const btn = document.getElementById('generate-report-btn');
        btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">refresh</span> Generating...';
        btn.disabled = true;
        try {
            const result = await app.ai.generateSeniorAnalystReport('workspace');
            const pre = document.getElementById('ai-result');
            if (pre) {
                pre.classList.remove('hidden');
                pre.textContent = JSON.stringify(result, null, 2);
            }
            app.showToast('Senior Analyst Report generated!', 'info');
        } catch (e) {
            app.showToast('Report generation failed.', 'error');
        }
        btn.innerHTML = '<span class="material-symbols-outlined text-primary">insights</span> Generate AI Report';
        btn.disabled = false;
    });
    console.log('[Renderer] Workspace rendered.');
}
