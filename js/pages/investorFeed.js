
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
}
