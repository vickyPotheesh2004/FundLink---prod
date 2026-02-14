
import { Auth } from '../modules/auth.js';

export function renderInvestorThesis(section, app) {
    const html = `
    <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <div class="layout-container flex h-full grow flex-col">
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
                        <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                            href="#investor-requests">My Requests</a>
                        <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                            href="#investor-portfolio">Portfolio</a>
                        <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                            href="#accepted-workspace">Workspaces</a>
                        <a class="text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-1"
                            href="#investor-thesis">Investment Thesis</a>
                        <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                            href="#investor-profile">Profile</a>
                    </nav>
                </div>
                <div class="flex flex-1 justify-end gap-6 items-center">
                    <div class="flex items-center gap-4">
                        <div class="text-right hidden sm:block">
                            <p class="text-xs font-semibold text-[#0d121b] dark:text-white">Marcus Capital</p>
                            <p class="text-[10px] text-[#4c669a] dark:text-slate-400 uppercase tracking-widest">LP Tier
                                1</p>
                        </div>
                        <div data-action="logout" title="Sign Out" onclick="Auth.logout()"
                            class="bg-slate-200 dark:bg-slate-700 rounded-full size-10 overflow-hidden border-2 border-white dark:border-slate-800 cursor-pointer">
                            <img class="w-full h-full object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoaVfnYb7X8Sy9sQLjhHbify2C4C83lW72rPan9AJZu2tMaW5U-8uqQO15s55hVBnmnEF2tzMITBkea_KON2CKcL7E8HGOFZfa3zUElWH-re94JKAWmGJRa2NIlESJnlVdYaGuUbbDdFjznSej0rEmBM2g6TY-y92SnaklY_nUzZC2u5P1KxTRHQk0ve1HZ9BOm_vjk3fKpJQslt3-rXtLbdZEele_6a5_WzoRBHKY7GZk9Ngjphl8DkVa6b_JFi0Gz8TbbQq92rU" />
                        </div>
                    </div>
                </div>
            </header>

            <main class="flex-1 flex flex-col items-center py-12 px-6 overflow-y-auto">
                <div class="w-full max-w-2xl">
                    <div class="mb-8 text-center">
                        <h1 class="text-3xl font-black text-[#0d121b] dark:text-white tracking-tight">Configure
                            Investment Thesis</h1>
                        <p class="text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">Define your strategic
                            alignment. Our AI uses these criteria to surface high-conviction matches while maintaining
                            absolute privacy.</p>
                    </div>

                    <div
                        class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 form-3d-shadow">
                        <form class="space-y-10" id="thesis-form">
                            <!-- Sectors of Interest -->
                            <section>
                                <div class="flex items-center gap-2 mb-4">
                                    <span class="material-symbols-outlined text-primary">category</span>
                                    <h3
                                        class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                        Sectors of Interest</h3>
                                </div>
                                <div class="flex flex-wrap gap-2" id="sectors-container">
                                    <button
                                        class="sector-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary text-sm font-semibold transition-all"
                                        type="button" data-selected="true">B2B SaaS</button>
                                    <button
                                        class="sector-btn px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-400 text-sm font-medium transition-all"
                                        type="button" data-selected="false">Fintech</button>
                                    <button
                                        class="sector-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary text-sm font-semibold transition-all"
                                        type="button" data-selected="true">DeepTech</button>
                                    <button
                                        class="sector-btn px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-400 text-sm font-medium transition-all"
                                        type="button" data-selected="false">HealthTech</button>
                                    <button
                                        class="sector-btn px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-400 text-sm font-medium transition-all"
                                        type="button" data-selected="false">Consumer Internet</button>
                                    <button
                                        class="sector-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary text-sm font-semibold transition-all"
                                        type="button" data-selected="true">Clean Energy</button>
                                </div>
                            </section>

                            <!-- Ticket Size -->
                            <section>
                                <div class="flex items-center gap-2 mb-4">
                                    <span class="material-symbols-outlined text-primary">payments</span>
                                    <h3
                                        class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                        Ticket Size Range</h3>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <span class="text-xs text-slate-500 block mb-1">Min ($)</span>
                                        <input id="thesis-min" type="number"
                                            class="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm focus:ring-primary focus:border-primary"
                                            placeholder="500000" value="500000" />
                                    </div>
                                    <div>
                                        <span class="text-xs text-slate-500 block mb-1">Max ($)</span>
                                        <input id="thesis-max" type="number"
                                            class="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm focus:ring-primary focus:border-primary"
                                            placeholder="5000000" value="2500000" />
                                    </div>
                                </div>
                            </section>

                            <!-- Geography -->
                            <section>
                                <div class="flex items-center gap-2 mb-4">
                                    <span class="material-symbols-outlined text-primary">public</span>
                                    <h3
                                        class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                                        Geography Focus</h3>
                                </div>
                                <input id="thesis-geo" type="text"
                                    class="w-full rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm focus:ring-primary focus:border-primary"
                                    placeholder="e.g., Europe, North America" value="Europe (DACH, UK)" />
                            </section>

                            <div
                                class="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <button class="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                    type="button" id="discard-btn">Discard Changes</button>
                                <button
                                    class="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-blue-700 transition-all flex items-center gap-2"
                                    type="submit">
                                    Update Thesis
                                    <span class="material-symbols-outlined text-lg">arrow_forward</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div class="mt-8 flex items-center justify-center gap-4 text-center">
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <span class="material-symbols-outlined text-sm text-green-500">verified_user</span>
                            Encrypted Storage
                        </div>
                        <div class="h-1 w-1 bg-slate-300 rounded-full"></div>
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <span class="material-symbols-outlined text-sm text-green-500">lock</span>
                            Founder Privacy Shield
                        </div>
                        <div class="h-1 w-1 bg-slate-300 rounded-full"></div>
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <span class="material-symbols-outlined text-sm text-green-500">visibility_off</span>
                            Asymmetric Blind Match
                        </div>
                    </div>
                </div>
            </main>

            <footer
                class="bg-slate-900 text-white px-8 py-2.5 flex items-center justify-between text-[11px] font-medium tracking-wide">
                <div class="flex items-center gap-6">
                    <div class="flex items-center gap-1.5 text-green-400">
                        <span class="material-symbols-outlined text-sm">lock</span>
                        <span>Privacy-First Mode Active</span>
                    </div>
                    <div class="flex items-center gap-1.5 opacity-60">
                        <span class="material-symbols-outlined text-sm">visibility_off</span>
                        <span>Zero Peer Visibility</span>
                    </div>
                </div>
                <div class="opacity-60">Configuration safe-save: Active</div>
            </footer>
        </div>
    </div>
    `;

    section.innerHTML = html;

    // Logic
    const form = document.getElementById('thesis-form');
    const sectorBtns = document.querySelectorAll('.sector-btn');
    const thesisKey = 'fundlink_investor_thesis';

    // Toggle Sector Buttons
    sectorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isSelected = btn.getAttribute('data-selected') === 'true';
            btn.setAttribute('data-selected', !isSelected);
            if (!isSelected) {
                btn.className = "sector-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary text-sm font-semibold transition-all";
            } else {
                btn.className = "sector-btn px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-400 text-sm font-medium transition-all";
            }
        });
    });

    // Load saved thesis
    const saved = JSON.parse(localStorage.getItem(thesisKey));
    if (saved) {
        if (saved.sectors && Array.isArray(saved.sectors)) {
            sectorBtns.forEach(btn => {
                const isSaved = saved.sectors.includes(btn.innerText.trim());
                btn.setAttribute('data-selected', isSaved);
                if (isSaved) {
                    btn.className = "sector-btn px-4 py-2 rounded-full border border-primary bg-primary/10 text-primary text-sm font-semibold transition-all";
                } else {
                    btn.className = "sector-btn px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary text-slate-600 dark:text-slate-400 text-sm font-medium transition-all";
                }
            });
        }
        if (saved.min) document.getElementById('thesis-min').value = saved.min;
        if (saved.max) document.getElementById('thesis-max').value = saved.max;
        if (saved.geo) document.getElementById('thesis-geo').value = saved.geo;
    }

    // Save thesis
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const selectedSectors = Array.from(sectorBtns)
            .filter(btn => btn.getAttribute('data-selected') === 'true')
            .map(btn => btn.innerText.trim());

        const settings = {
            sectors: selectedSectors,
            min: document.getElementById('thesis-min').value,
            max: document.getElementById('thesis-max').value,
            geo: document.getElementById('thesis-geo').value,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem(thesisKey, JSON.stringify(settings));

        // Feedback
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Thesis Saved';
        btn.classList.add('bg-green-600');
        btn.classList.remove('bg-primary');

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.add('bg-primary');
            btn.classList.remove('bg-green-600');
        }, 2000);
    });

    // Discard
    document.getElementById('discard-btn').addEventListener('click', () => {
        // Reloads the form with saved values effectively by re-rendering
        renderInvestorThesis(section, app);
    });
}
