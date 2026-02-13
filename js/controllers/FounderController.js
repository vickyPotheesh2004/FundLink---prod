/**
 * FounderController
 * Manages the interactive state of the Founder Dashboard.
 */
export default class FounderController {
    constructor(aiClient) {
        this.ai = aiClient;
        this.init();
    }

    init() {
        console.log('[FounderController] IDLE.');
        this.bindEvents();
    }

    bindEvents() {
        // Bind 'Calculate Readiness' button
        const btn = document.getElementById('calculate-readiness-btn');
        if (btn) {
            btn.addEventListener('click', () => this.handleReadinessCheck());
        }

        // Bind Modal Close Actions
        // We attach to window to support the inline onclicks, or we could query them here.
        // For module safety, let's bind specific IDs if they exist
        window.closeReadinessModal = () => this.toggleModal(false);
    }

    toggleModal(show) {
        const modal = document.getElementById('readiness-modal');
        const backdrop = document.getElementById('readiness-backdrop');
        const panel = document.getElementById('readiness-panel');

        if (show) {
            modal.classList.remove('hidden');
            // Animate In
            setTimeout(() => {
                backdrop.classList.remove('opacity-0');
                panel.classList.remove('opacity-0', 'scale-95');
            }, 10);
        } else {
            // Animate Out
            backdrop.classList.add('opacity-0');
            panel.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
    }

    async handleReadinessCheck() {
        console.log('[FounderController] Requesting Analysis...');

        // Gather data
        const titleInput = document.getElementById('innovation-title');
        const objectiveInput = document.getElementById('innovation-objective');

        const pitchData = {
            title: titleInput ? titleInput.value : "",
            description: objectiveInput ? objectiveInput.value : ""
        };

        // Loading State
        const btn = document.getElementById('calculate-readiness-btn');
        const originalText = btn.innerText;
        btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">run_circle</span> Analyzing...`;
        btn.disabled = true;
        btn.classList.add('opacity-75', 'cursor-not-allowed');

        try {
            const result = await this.ai.evaluateReadiness(pitchData);

            // Populate Modal
            document.getElementById('readiness-score-val').innerText = result.score;

            // Animate Ring
            const offset = 552.9 - (552.9 * result.score / 100);
            document.getElementById('readiness-score-ring').style.strokeDashoffset = offset;

            // Gap Analysis (Simulated specific feedback)
            const gapText = result.score > 80
                ? "Your financials are strong, but the competitive moat needs sharper definition against Big Tech incumbents."
                : "Your financial projections lack a detailed Unit Economics breakdown. Investors at Series A require clear CAC/LTV visibility.";
            document.getElementById('readiness-gap-text').innerText = gapText;

            // Lists
            const renderList = (id, items) => {
                const ul = document.getElementById(id);
                if (ul) ul.innerHTML = items.map(i => `<li>${i}</li>`).join('');
            };
            renderList('readiness-strengths', result.analysis.strengths);
            renderList('readiness-improvements', result.analysis.weaknesses);

            // Show Modal
            this.toggleModal(true);

        } catch (e) {
            console.error("AI Error", e);
            alert("AI Service Unavailable in Demo Mode");
        } finally {
            // Reset Button
            btn.innerText = originalText;
            btn.disabled = false;
            btn.classList.remove('opacity-75', 'cursor-not-allowed');
        }
    }
}
