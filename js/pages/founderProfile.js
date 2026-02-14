
import { Auth } from '../modules/auth.js';
import { AIClient } from '../modules/AIClient.js';

export async function renderFounderProfile(section, app) {
    try {
        const response = await fetch('/frontend/founder_control_dashboard_2.html');
        if (!response.ok) throw new Error(`Failed to load profile HTML: ${response.statusText}`);
        const html = await response.text();
        section.innerHTML = html;
    } catch (error) {
        console.error('Error loading founder profile:', error);
        section.innerHTML = `<div class="p-8 text-center text-red-500">Error loading profile.</div>`;
        return;
    }

    // --- Logic from original JS & extracted from HTML script tags ---

    const fields = {
        companyName: 'company-name',
        companyIndustry: 'company-industry',
        companyStage: 'company-stage',
        innovationTitle: 'innovation-title',
        innovationObj: 'innovation-objective',
        founderName: 'founder-name',
        founderBio: 'founder-bio'
    };

    // Load saved data
    Object.keys(fields).forEach(key => {
        const saved = localStorage.getItem('fundlink_profile_' + key);
        if (saved) {
            const el = document.getElementById(fields[key]);
            if (el) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = saved;
                else el.innerText = saved;
            }
        }
    });

    // Save Logic
    window.saveAllProfile = () => {
        Object.keys(fields).forEach(key => {
            const el = document.getElementById(fields[key]);
            if (el) {
                const val = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? el.value : el.innerText;
                localStorage.setItem('fundlink_profile_' + key, val);
            }
        });
        alert('Profile updated successfully!');
    };

    const btn1 = document.getElementById('edit-company-btn');
    if (btn1) btn1.onclick = window.saveAllProfile;

    const btn2 = document.getElementById('save-idea-btn');
    if (btn2) btn2.onclick = window.saveAllProfile;

    const btn3 = document.getElementById('edit-bio-btn');
    if (btn3) btn3.onclick = window.saveAllProfile;


    // --- Readiness Logic ---
    const aiClient = new AIClient();

    // Check if readiness is already complete
    if (Auth.isReadinessComplete()) {
        const btn = document.getElementById('calculate-readiness-btn');
        if (btn) {
            btn.innerText = "Readiness Assessment Complete";
            btn.classList.add('bg-green-600', 'hover:bg-green-700');
        }
    }

    const readinessBtn = document.getElementById('calculate-readiness-btn');
    if (readinessBtn) {
        readinessBtn.addEventListener('click', async () => {
            if (Auth.isReadinessComplete()) {
                alert("You have already completed the Readiness Assessment.");
                return;
            }

            const btn = document.getElementById('calculate-readiness-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span class="material-symbols-outlined animate-spin">refresh</span> Analyzing...`;
            btn.disabled = true;

            try {
                // Get data from profile fields
                const description = document.getElementById('innovation-objective').value || "No description provided.";

                const pitchData = {
                    description: description
                };

                const result = await aiClient.evaluateReadiness(pitchData);

                // Show Modal
                const modal = document.getElementById('readiness-modal');
                const backdrop = document.getElementById('readiness-backdrop');
                const panel = document.getElementById('readiness-panel');

                modal.classList.remove('hidden');
                setTimeout(() => {
                    backdrop.classList.remove('opacity-0');
                    panel.classList.remove('opacity-0', 'scale-95');
                }, 10);

                // Update UI
                document.getElementById('readiness-score-val').innerText = result.score;

                const strengthsList = document.getElementById('readiness-strengths');
                if (strengthsList) strengthsList.innerHTML = result.analysis.strengths.map(s => `<li>${s}</li>`).join('');

                const improvementList = document.getElementById('readiness-improvements');
                if (improvementList) improvementList.innerHTML = result.analysis.gap_analysis.critical.map(s => `<li>${s}</li>`).join('');

                // Mark as complete
                Auth.setReadinessComplete();
                btn.innerText = "Readiness Assessment Complete";
                btn.classList.remove('bg-primary', 'hover:bg-blue-700');
                btn.classList.add('bg-green-600', 'hover:bg-green-700');

            } catch (error) {
                console.error(error);
                alert("Analysis failed. Please try again.");
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    window.closeReadinessModal = () => {
        const modal = document.getElementById('readiness-modal');
        const backdrop = document.getElementById('readiness-backdrop');
        const panel = document.getElementById('readiness-panel');

        backdrop.classList.add('opacity-0');
        panel.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };
}
