
import { AIClient } from '../modules/AIClient.js';
import { Auth } from '../modules/auth.js';

// Filter state management
const filterState = {
    thesis: [],
    stages: [],
    minScore: 50,
    location: 'all',
    ticket: 'all'
};

// Load saved filters from localStorage
function loadSavedFilters() {
    try {
        const saved = localStorage.getItem('fundlink_investor_filters');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(filterState, parsed);
        }
    } catch (e) {
        console.warn('Could not load saved filters:', e);
    }
}

// Save filters to localStorage
function saveFilters() {
    try {
        localStorage.setItem('fundlink_investor_filters', JSON.stringify(filterState));
    } catch (e) {
        console.warn('Could not save filters:', e);
    }
}

// Update active filter count badge
function updateFilterCount() {
    let count = 0;
    if (filterState.thesis.length > 0) count++;
    if (filterState.stages.length > 0) count++;
    if (filterState.minScore > 50) count++;
    if (filterState.location !== 'all') count++;
    if (filterState.ticket !== 'all') count++;

    const badge = document.getElementById('active-filter-count');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Update thesis checkbox visual state
function updateThesisCheckboxVisual(checkbox, isChecked) {
    const label = checkbox.closest('.thesis-option');
    const indicator = label.querySelector('.checkbox-indicator');
    const checkIcon = indicator.querySelector('.material-symbols-outlined');

    if (isChecked) {
        indicator.classList.remove('border-slate-300', 'dark:border-slate-600');
        indicator.classList.add('border-primary', 'bg-primary');
        checkIcon.classList.remove('hidden');
        label.classList.add('bg-primary/5', 'border-primary/30');
    } else {
        indicator.classList.add('border-slate-300', 'dark:border-slate-600');
        indicator.classList.remove('border-primary', 'bg-primary');
        checkIcon.classList.add('hidden');
        label.classList.remove('bg-primary/5', 'border-primary/30');
    }
}

// Update stage checkbox visual state
function updateStageCheckboxVisual(checkbox, isChecked) {
    const label = checkbox.closest('.stage-option');
    const indicator = label.querySelector('.checkbox-indicator');
    const checkIcon = indicator.querySelector('.material-symbols-outlined');

    if (isChecked) {
        indicator.classList.remove('border-slate-300', 'dark:border-slate-600');
        indicator.classList.add('border-primary', 'bg-primary');
        checkIcon.classList.remove('hidden');
        label.classList.add('bg-primary/5');
    } else {
        indicator.classList.add('border-slate-300', 'dark:border-slate-600');
        indicator.classList.remove('border-primary', 'bg-primary');
        checkIcon.classList.add('hidden');
        label.classList.remove('bg-primary/5');
    }
}

export async function renderInvestorFeed(section, app) {
    // Load saved filters first
    loadSavedFilters();

    // 1. Fetch External HTML
    try {
        const response = await fetch('/frontend/investor_evaluation_dashboard_5.html');
        if (!response.ok) throw new Error(`Failed to load investor feed: ${response.statusText}`);
        const html = await response.text();
        section.innerHTML = html;
    } catch (error) {
        console.error('Error loading investor feed:', error);
        section.innerHTML = `<div class="p-8 text-center text-red-500">Error loading feed.</div>`;
        return;
    }

    // 2. Initialize UI with saved filter state
    setTimeout(() => {
        initializeFilterUI();
        updateFilterCount();
        renderRegisteredFounders();
    }, 100);

    // 3. Re-bind Global Helper Functions (for HTML onclicks)

    // Investment Thesis checkbox handler
    window.updateThesisSelection = (checkbox) => {
        const value = checkbox.value;
        if (checkbox.checked) {
            if (!filterState.thesis.includes(value)) {
                filterState.thesis.push(value);
            }
        } else {
            filterState.thesis = filterState.thesis.filter(t => t !== value);
        }
        updateThesisCheckboxVisual(checkbox, checkbox.checked);
        updateThesisCount();
        saveFilters();
    };

    // Update thesis count display
    function updateThesisCount() {
        const countEl = document.getElementById('thesis-count');
        if (countEl) {
            countEl.textContent = filterState.thesis.length > 0
                ? `${filterState.thesis.length} selected`
                : '0 selected';
        }
    }

    // Minimum AI Score slider handler
    window.handleScoreSlider = (value) => {
        filterState.minScore = parseInt(value);
        const display = document.getElementById('min-score-display');
        if (display) display.textContent = value + '%';
        updateScorePresets();
        saveFilters();
    };

    // Set minimum score from preset button
    window.setMinScore = (value) => {
        filterState.minScore = value;
        const slider = document.getElementById('filter-min-score');
        const display = document.getElementById('min-score-display');
        if (slider) slider.value = value;
        if (display) display.textContent = value + '%';
        updateScorePresets();
        saveFilters();
    };

    // Update score preset button states
    function updateScorePresets() {
        document.querySelectorAll('.score-preset').forEach(btn => {
            const score = parseInt(btn.dataset.score);
            if (score === filterState.minScore) {
                btn.classList.add('bg-primary', 'text-white', 'border-primary');
            } else {
                btn.classList.remove('bg-primary', 'text-white', 'border-primary');
            }
        });
    }

    // Stage dropdown toggle
    window.toggleStageDropdown = () => {
        const panel = document.getElementById('stage-dropdown-panel');
        const icon = document.getElementById('stage-dropdown-icon');
        if (panel) {
            panel.classList.toggle('hidden');
            if (icon) {
                icon.style.transform = panel.classList.contains('hidden') ? '' : 'rotate(180deg)';
            }
        }
    };

    // Update stage selection
    window.updateStageSelection = () => {
        filterState.stages = [];
        document.querySelectorAll('.stage-checkbox').forEach(cb => {
            if (cb.checked) {
                filterState.stages.push(cb.value);
                updateStageCheckboxVisual(cb, true);
            } else {
                updateStageCheckboxVisual(cb, false);
            }
        });
        updateStageDisplay();
        updateStageTags();
        saveFilters();
    };

    // Select all stages
    window.selectAllStages = () => {
        document.querySelectorAll('.stage-checkbox').forEach(cb => {
            cb.checked = true;
            updateStageCheckboxVisual(cb, true);
        });
        window.updateStageSelection();
    };

    // Clear all stages
    window.clearAllStages = () => {
        document.querySelectorAll('.stage-checkbox').forEach(cb => {
            cb.checked = false;
            updateStageCheckboxVisual(cb, false);
        });
        window.updateStageSelection();
    };

    // Update stage display text
    function updateStageDisplay() {
        const display = document.getElementById('stage-display');
        const countEl = document.getElementById('stage-count');
        const stages = filterState.stages;

        if (display) {
            if (stages.length === 0) {
                display.textContent = 'All Stages';
            } else if (stages.length === 1) {
                display.textContent = formatStage(stages[0]);
            } else {
                display.textContent = `${stages.length} stages selected`;
            }
        }

        if (countEl) {
            countEl.textContent = stages.length > 0 ? `${stages.length} selected` : 'All';
        }
    }

    // Update stage tags display
    function updateStageTags() {
        const container = document.getElementById('stage-tags');
        if (!container) return;

        container.innerHTML = '';
        filterState.stages.forEach(stage => {
            const tag = document.createElement('span');
            tag.className = 'inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full';
            tag.innerHTML = `${formatStage(stage)} <button onclick="removeStageTag('${stage}')" class="hover:text-red-500">&times;</button>`;
            container.appendChild(tag);
        });
    }

    // Remove stage tag
    window.removeStageTag = (stage) => {
        const cb = document.querySelector(`.stage-checkbox[value="${stage}"]`);
        if (cb) {
            cb.checked = false;
            window.updateStageSelection();
        }
    };

    // Format stage name
    function formatStage(stage) {
        const names = {
            'pre-seed': 'Pre-Seed',
            'seed': 'Seed',
            'series-a': 'Series A',
            'series-b': 'Series B'
        };
        return names[stage] || stage;
    }

    // Initialize filter UI with saved state
    function initializeFilterUI() {
        // Initialize thesis checkboxes
        document.querySelectorAll('.thesis-checkbox').forEach(cb => {
            const isChecked = filterState.thesis.includes(cb.value);
            cb.checked = isChecked;
            updateThesisCheckboxVisual(cb, isChecked);
        });
        updateThesisCount();

        // Initialize score slider and presets
        const slider = document.getElementById('filter-min-score');
        const display = document.getElementById('min-score-display');
        if (slider) slider.value = filterState.minScore;
        if (display) display.textContent = filterState.minScore + '%';
        updateScorePresets();

        // Initialize stage checkboxes
        document.querySelectorAll('.stage-checkbox').forEach(cb => {
            const isChecked = filterState.stages.includes(cb.value);
            cb.checked = isChecked;
            updateStageCheckboxVisual(cb, isChecked);
        });
        updateStageDisplay();
        updateStageTags();

        // Initialize location
        const locationEl = document.getElementById('filter-location');
        if (locationEl && filterState.location) {
            locationEl.value = filterState.location;
        }

        // Initialize ticket
        const ticketEl = document.getElementById('filter-ticket');
        if (ticketEl && filterState.ticket) {
            ticketEl.value = filterState.ticket;
        }
    }

    // Apply all filters
    window.applyFilters = () => {
        // Get filter values
        const locationEl = document.getElementById('filter-location');
        const ticketEl = document.getElementById('filter-ticket');

        filterState.location = locationEl ? locationEl.value : 'all';
        filterState.ticket = ticketEl ? ticketEl.value : 'all';

        const cards = document.querySelectorAll('.deal-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const dDomain = card.getAttribute('data-domain');
            const dStage = card.getAttribute('data-stage');
            const dLocation = card.getAttribute('data-location');
            const dTicket = card.getAttribute('data-ticket');

            // Get match score from the card
            const scoreEl = card.querySelector('.match-score-radial span.text-primary');
            const cardScore = scoreEl ? parseInt(scoreEl.innerText.replace('%', '')) : 0;

            let show = true;

            // Investment thesis filter (domain)
            if (filterState.thesis.length > 0) {
                // Map thesis values to domain values
                const thesisToDomain = {
                    'b2b-saas': 'saas',
                    'payments': 'fintech',
                    'fintech': 'fintech',
                    'eco': 'sustainability',
                    'sustainability': 'sustainability'
                };
                const matchingDomains = filterState.thesis.map(t => thesisToDomain[t] || t);
                if (!matchingDomains.includes(dDomain)) show = false;
            }

            // Stage filter (multi-select)
            if (filterState.stages.length > 0 && !filterState.stages.includes(dStage)) {
                show = false;
            }

            // Location filter
            if (filterState.location !== 'all' && dLocation !== filterState.location) {
                show = false;
            }

            // Ticket size filter
            if (filterState.ticket !== 'all' && dTicket !== filterState.ticket) {
                show = false;
            }

            // Minimum AI score filter
            if (cardScore < filterState.minScore) {
                show = false;
            }

            card.style.display = show ? 'flex' : 'none';
            if (show) visibleCount++;
        });

        // Update count display
        const countEl = document.getElementById('visible-count');
        if (countEl) {
            countEl.textContent = visibleCount;
        }

        // Save and update badge
        saveFilters();
        updateFilterCount();
    };

    // Reset all filters
    window.resetFilters = () => {
        // Reset state
        filterState.thesis = [];
        filterState.stages = [];
        filterState.minScore = 50;
        filterState.location = 'all';
        filterState.ticket = 'all';

        // Reset UI elements
        document.querySelectorAll('.thesis-checkbox').forEach(cb => {
            cb.checked = false;
            updateThesisCheckboxVisual(cb, false);
        });
        updateThesisCount();

        document.querySelectorAll('.stage-checkbox').forEach(cb => {
            cb.checked = false;
            updateStageCheckboxVisual(cb, false);
        });
        updateStageDisplay();
        updateStageTags();

        const slider = document.getElementById('filter-min-score');
        const display = document.getElementById('min-score-display');
        if (slider) slider.value = 50;
        if (display) display.textContent = '50%';
        updateScorePresets();

        const locationEl = document.getElementById('filter-location');
        const ticketEl = document.getElementById('filter-ticket');
        if (locationEl) locationEl.value = 'all';
        if (ticketEl) ticketEl.value = 'all';

        // Clear localStorage
        localStorage.removeItem('fundlink_investor_filters');

        // Apply and update
        window.applyFilters();
    };

    window.openAIReport = async (startupName) => {
        const modal = document.getElementById('ai-report-modal');
        const backdrop = document.getElementById('ai-modal-backdrop');
        const panel = document.getElementById('ai-modal-panel');
        const title = document.getElementById('ai-report-title');
        const scoreVal = document.getElementById('ai-score-val');
        const thesis = document.getElementById('ai-thesis');

        modal.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        requestAnimationFrame(() => {
            backdrop.classList.remove('opacity-0');
            panel.classList.remove('opacity-0', 'scale-95');
        });

        title.innerText = `Analyzing ${startupName}...`;

        // Call AI Module
        try {
            const report = await app.ai.generateSeniorAnalystReport(startupName);
            title.innerText = `AI Due Diligence: ${startupName}`;
            scoreVal.innerText = Math.floor(Math.random() * (98 - 75) + 75);
            thesis.innerText = `"${report.executive_framing.solution_thesis}"`;
        } catch (err) {
            console.error("AI Report Failed", err);
            title.innerText = `Analysis Failed`;
            thesis.innerText = "Could not generate report.";
        }
    };

    window.closeAIReport = () => {
        const modal = document.getElementById('ai-report-modal');
        const backdrop = document.getElementById('ai-modal-backdrop');
        const panel = document.getElementById('ai-modal-panel');

        backdrop.classList.add('opacity-0');
        panel.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    window.connectWithStartup = (btnId, startupName, founderId) => {
        const btn = document.getElementById(btnId);
        if (!btn) return;

        btn.innerText = "Request Sent";
        btn.classList.remove('bg-primary', 'hover:bg-blue-700');
        btn.classList.add('bg-slate-400', 'cursor-not-allowed');
        btn.disabled = true;

        // Get current user ID and send connection request
        const currentUserId = Auth.getCurrentUserId();
        if (currentUserId && founderId) {
            Auth.sendConnectionRequest(currentUserId, founderId);
            alert(`Connection request sent to ${startupName}!`);
        } else {
            // Fallback to legacy method for demo data
            Auth.sendConnectionRequest('INVESTOR', 'FOUNDER', startupName);
            alert(`✅ Connection request sent to ${startupName}!\n\n👉 DEMO STEP: Switch to the 'Founder View' -> 'Inbox' to see and accept this request.`);
        }
    };

    window.sortCardsByMatchScore = () => {
        const container = document.querySelector('#deals-grid');
        if (!container) return;
        const cards = Array.from(container.children);

        cards.sort((a, b) => {
            const scoreAEl = a.querySelector('.match-score-radial span.text-primary');
            const scoreBEl = b.querySelector('.match-score-radial span.text-primary');
            if (!scoreAEl || !scoreBEl) return 0;
            const scoreA = parseInt(scoreAEl.innerText.replace('%', ''));
            const scoreB = parseInt(scoreBEl.innerText.replace('%', ''));
            return scoreB - scoreA;
        });

        container.innerHTML = '';
        cards.forEach(card => container.appendChild(card));
        const sortBtn = document.getElementById('btn-sort-match');
        if (sortBtn) sortBtn.innerHTML = '<span class="material-symbols-outlined text-sm">check</span> Sorted: Highest Match';
    };

    // Navigate to workspace
    window.navigateToWorkspace = () => {
        window.location.hash = '#accepted-workspace';
    };

    // Close stage dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('stage-dropdown-btn');
        const panel = document.getElementById('stage-dropdown-panel');
        if (dropdown && panel && !dropdown.contains(e.target) && !panel.contains(e.target)) {
            panel.classList.add('hidden');
            const icon = document.getElementById('stage-dropdown-icon');
            if (icon) icon.style.transform = '';
        }
    });

    // Render registered founders in the deals grid
    function renderRegisteredFounders() {
        const grid = document.getElementById('deals-grid');
        if (!grid) return;

        // Get registered founders from Auth
        const founders = Auth.getAllFounders();

        if (founders.length === 0) {
            // Keep existing demo cards if no registered founders
            return;
        }

        // Clear existing content and add registered founders
        founders.forEach(founder => {
            const card = createFounderCard(founder);
            grid.insertAdjacentHTML('afterbegin', card);
        });
    }

    function createFounderCard(founder) {
        const matchScore = Math.floor(Math.random() * (98 - 75) + 75);
        return `
            <div class="deal-card bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                data-domain="${founder.domain || 'saas'}" data-stage="${founder.stage || 'seed'}" data-location="${founder.location || 'emea'}" data-ticket="seed-range">
                <div class="p-6 flex-1">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <h3 class="text-lg font-bold text-[#0d121b] dark:text-white uppercase tracking-tight">
                                    ${founder.companyName || 'Stealth Startup'}</h3>
                                <span class="material-symbols-outlined text-slate-300 text-sm">verified_user</span>
                            </div>
                            <div class="flex gap-2">
                                <span class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-primary text-[10px] font-bold rounded uppercase">${founder.domain || 'Tech'}</span>
                                <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded uppercase">${founder.stage || 'Seed'}</span>
                            </div>
                        </div>
                        <div class="relative flex items-center justify-center size-14 rounded-full match-score-radial"
                            style="--percentage: ${matchScore}%;">
                            <div class="absolute inset-1 bg-white dark:bg-slate-900 rounded-full flex flex-col items-center justify-center">
                                <span class="text-primary font-black text-sm">${matchScore}%</span>
                                <span class="text-[8px] text-slate-400 font-bold uppercase leading-none">Match</span>
                            </div>
                        </div>
                    </div>
                    <div class="mb-6">
                        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Problem Statement</h4>
                        <p class="text-[#0d121b] dark:text-slate-200 font-medium leading-relaxed">
                            ${founder.problemStatement || 'Innovative solution addressing key market challenges.'}</p>
                    </div>
                    <div class="grid grid-cols-3 gap-4 py-4 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">Target Raise</p>
                            <p class="text-sm font-bold">${founder.targetRaise || '$1.5M'}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">Commitment</p>
                            <p class="text-sm font-bold">${founder.commitment || '$500K'}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                            <p class="text-sm font-bold">${founder.location || 'EMEA'}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                    <button onclick="window.openAIReport('${founder.companyName || 'Stealth Startup'}')"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-bold text-[#0d121b] dark:text-white hover:bg-white dark:hover:bg-slate-700 transition-colors">
                        <span class="material-symbols-outlined text-lg">analytics</span>
                        Analyze AI
                    </button>
                    <button id="btn-connect-${founder.id}"
                        onclick="window.connectWithStartup('btn-connect-${founder.id}', '${founder.companyName || 'Stealth Startup'}', '${founder.id}')"
                        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-blue-700 transition-colors">
                        <span class="material-symbols-outlined text-lg">handshake</span>
                        Connect
                    </button>
                </div>
            </div>
        `;
    }

    // 7. Demo Mode Initialization
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
                roleSwitcher.value = Auth.getRole() || 'INVESTOR';
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
