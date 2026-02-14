
import { Auth } from '../modules/auth.js';

export function renderInvestorPortfolio(section, app) {
    const html = `
    <div class="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        <header
            class="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7ebf3] dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-3 sticky top-0 z-50">
            <div class="flex items-center gap-8">
                <div class="flex items-center gap-3 text-primary">
                    <div class="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
                        <span class="material-symbols-outlined text-2xl">shield_lock</span>
                    </div>
                    <h2 class="text-[#0d121b] dark:text-white text-xl font-bold leading-tight tracking-tight">FundLink
                    </h2>
                </div>
                <nav class="hidden md:flex items-center gap-6">
                    <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                        href="#investor-feed">Evaluation Feed</a>
                    <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                        href="#investor-requests">My Requests</a>
                    <a class="text-primary text-sm font-semibold leading-normal border-b-2 border-primary pb-1"
                        href="#investor-portfolio">Portfolio</a>
                    <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                        href="#accepted-workspace">Workspaces</a>
                    <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                        href="#investor-thesis">Investment Thesis</a>
                    <a class="text-[#4c669a] dark:text-slate-400 text-sm font-medium leading-normal hover:text-primary"
                        href="#investor-profile">Profile</a>
                </nav>
            </div>
            <div class="flex items-center gap-4">
                <div class="text-right hidden sm:block">
                    <p class="text-xs font-semibold text-[#0d121b] dark:text-white">Marcus Capital</p>
                    <p class="text-[10px] text-[#4c669a] dark:text-slate-400 uppercase tracking-widest">Master Account
                    </p>
                </div>
                <div data-action="logout" title="Sign Out" onclick="Auth.logout()"
                    class="bg-slate-200 dark:bg-slate-700 rounded-full size-10 overflow-hidden border-2 border-white dark:border-slate-800 cursor-pointer">
                    <img alt="Profile" class="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoaVfnYb7X8Sy9sQLjhHbify2C4C83lW72rPan9AJZu2tMaW5U-8uqQO15s55hVBnmnEF2tzMITBkea_KON2CKcL7E8HGOFZfa3zUElWH-re94JKAWmGJRa2NIlESJnlVdYaGuUbbDdFjznSej0rEmBM2g6TY-y92SnaklY_nUzZC2u5P1KxTRHQk0ve1HZ9BOm_vjk3fKpJQslt3-rXtLbdZEele_6a5_WzoRBHKY7GZk9Ngjphl8DkVa6b_JFi0Gz8TbbQq92rU" />
                </div>
            </div>
        </header>
        <main class="flex-1 p-8">
            <div class="max-w-7xl mx-auto">
                <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 class="text-3xl font-black text-[#0d121b] dark:text-white tracking-tight">Portfolio Overview
                        </h1>
                        <p class="text-slate-500 dark:text-slate-400 mt-1">Private management of active assets and
                            ongoing negotiations.</p>
                    </div>
                </div>

                <!-- Portfolio Grid -->
                <div id="portfolio-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Dynamic Content Loaded Here -->
                    <div class="col-span-full text-center py-12 opacity-60">
                        <div class="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary rounded-full mb-4"
                            role="status"></div>
                        <p>Loading portfolio...</p>
                    </div>
                </div>
            </div>
        </main>
        <footer
            class="bg-slate-900 text-white px-8 py-2.5 flex items-center justify-between text-[11px] font-medium tracking-wide">
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-green-400">lock</span>
                    <span>End-to-End Encrypted Environment</span>
                </div>
                <div class="flex items-center gap-1.5 opacity-60">
                    <span class="material-symbols-outlined text-sm">visibility_off</span>
                    <span>Zero Public Visibility</span>
                </div>
            </div>
            <div class="opacity-60 flex items-center gap-4">
                <span>Portfolio Audit Log Active</span>
                <span class="bg-slate-700 px-2 py-0.5 rounded text-[10px]">v2.4.0</span>
            </div>
        </footer>
    </div>
    `;

    section.innerHTML = html;

    // Logic
    const container = document.getElementById('portfolio-container');
    const requests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');

    const portfolio = requests.filter(r =>
        ((r.to === 'Marcus Capital' || r.to === 'INVESTOR') ||
            (r.from === 'Marcus Capital' || r.from === 'INVESTOR')) &&
        r.status === 'accepted'
    );

    if (portfolio.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">work_off</span>
                <p class="text-slate-500 font-medium">No active portfolio companies yet.</p>
                <a href="#investor-requests" class="text-primary hover:underline text-sm mt-2 block">Check requests</a>
            </div>
            `;
        return;
    }

    let cardsHtml = '';
    portfolio.forEach(item => {
        // Determine the other party name
        const isIncoming = (item.to === 'Marcus Capital' || item.to === 'INVESTOR');
        const companyName = isIncoming ? (item.from === 'FOUNDER' ? 'Stealth Startup' : item.from) : (item.targetName || item.to);

        // Randomize data for demo since request doesn't have detailed company info
        const stage = ['Seed', 'Series A', 'Pre-Seed'][Math.floor(Math.random() * 3)];
        const sector = ['Fintech', 'AI/ML', 'SaaS', 'HealthTech'][Math.floor(Math.random() * 4)];
        const invested = ['$500k', '$1.2M', '$250k'][Math.floor(Math.random() * 3)];

        cardsHtml += `
            <div class="portfolio-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
                <div class="p-6 flex-1">
                    <div class="flex items-start justify-between mb-4">
                        <div class="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                            ${companyName.charAt(0)}
                        </div>
                        <span class="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded tracking-wider">Active</span>
                    </div>
                    
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">${companyName}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">${sector} · ${stage}</p>
                    
                    <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500">Invested</span>
                            <span class="font-semibold text-slate-900 dark:text-white">${invested}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500">Equity</span>
                            <span class="font-semibold text-slate-900 dark:text-white">8.5%</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500">MoIC</span>
                            <span class="font-semibold text-green-600">1.2x</span>
                        </div>
                    </div>
                </div>
                <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span class="text-xs text-slate-500 font-medium">Last update: 2d ago</span>
                    <a href="#workspace" class="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                        Workspace <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </a>
                </div>
            </div>
        `;
    });

    container.innerHTML = cardsHtml;
}
