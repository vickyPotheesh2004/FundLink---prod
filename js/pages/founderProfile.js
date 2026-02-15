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

    // Load saved data from both localStorage and Auth profile
    const userProfile = Auth.getCurrentUserProfile();

    Object.keys(fields).forEach(key => {
        const saved = localStorage.getItem('fundlink_profile_' + key);
        const el = document.getElementById(fields[key]);
        if (el) {
            // Prefer Auth profile data, fallback to localStorage
            let value = saved;
            if (userProfile) {
                if (key === 'companyName' && userProfile.companyName) value = userProfile.companyName;
                if (key === 'founderName' && userProfile.name) value = userProfile.name;
                if (key === 'companyIndustry' && userProfile.domain) value = userProfile.domain;
                if (key === 'companyStage' && userProfile.stage) value = userProfile.stage;
            }

            if (value) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = value;
                else el.innerText = value;
            }
        }
    });

    // Save Logic - saves to both localStorage and Auth profile
    window.saveAllProfile = () => {
        const profileData = {};

        Object.keys(fields).forEach(key => {
            const el = document.getElementById(fields[key]);
            if (el) {
                const val = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? el.value : el.innerText;
                localStorage.setItem('fundlink_profile_' + key, val);

                // Map to Auth profile fields
                if (key === 'companyName') profileData.companyName = val;
                if (key === 'founderName') profileData.name = val;
                if (key === 'companyIndustry') profileData.domain = val;
                if (key === 'companyStage') profileData.stage = val;
                if (key === 'innovationObj') profileData.description = val;
            }
        });

        // Save to Auth profile
        const currentProfile = Auth.getCurrentUserProfile() || {};
        Auth.saveUserProfile({
            ...currentProfile,
            ...profileData
        });

        if (app && app.showToast) {
            app.showToast('Profile updated successfully!', 'success');
        } else {
            alert('Profile updated successfully!');
        }

        console.log('[FounderProfile] Profile saved:', profileData);
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
                if (app && app.showToast) {
                    app.showToast("You have already completed the Readiness Assessment.", 'info');
                } else {
                    alert("You have already completed the Readiness Assessment.");
                }
                return;
            }

            const btn = document.getElementById('calculate-readiness-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span class="material-symbols-outlined animate-spin">refresh</span> Analyzing...`;
            btn.disabled = true;

            try {
                // Get data from profile fields
                const description = document.getElementById('innovation-objective')?.value || "No description provided.";

                const pitchData = {
                    description: description
                };

                const result = await aiClient.evaluateReadiness(pitchData);

                // Show Modal
                const modal = document.getElementById('readiness-modal');
                const backdrop = document.getElementById('readiness-backdrop');
                const panel = document.getElementById('readiness-panel');

                if (modal && backdrop && panel) {
                    modal.classList.remove('hidden');
                    setTimeout(() => {
                        backdrop.classList.remove('opacity-0');
                        panel.classList.remove('opacity-0', 'scale-95');
                    }, 10);

                    // Update UI
                    const scoreVal = document.getElementById('readiness-score-val');
                    if (scoreVal) scoreVal.innerText = result.score;

                    const strengthsList = document.getElementById('readiness-strengths');
                    if (strengthsList && result.analysis?.strengths) {
                        strengthsList.innerHTML = result.analysis.strengths.map(s => `<li>${s}</li>`).join('');
                    }

                    const improvementList = document.getElementById('readiness-improvements');
                    if (improvementList && result.analysis?.gap_analysis?.critical) {
                        improvementList.innerHTML = result.analysis.gap_analysis.critical.map(s => `<li>${s}</li>`).join('');
                    }
                }

                // Mark as complete
                Auth.setReadinessComplete();
                btn.innerText = "Readiness Assessment Complete";
                btn.classList.remove('bg-primary', 'hover:bg-blue-700');
                btn.classList.add('bg-green-600', 'hover:bg-green-700');

                if (app && app.showToast) {
                    app.showToast('Readiness assessment completed!', 'success');
                }

            } catch (error) {
                console.error('[FounderProfile] Readiness assessment failed:', error);
                if (app && app.showToast) {
                    app.showToast("Analysis failed. Please try again.", 'error');
                } else {
                    alert("Analysis failed. Please try again.");
                }
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    window.closeReadinessModal = () => {
        const modal = document.getElementById('readiness-modal');
        const backdrop = document.getElementById('readiness-backdrop');
        const panel = document.getElementById('readiness-panel');

        if (backdrop) backdrop.classList.add('opacity-0');
        if (panel) panel.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            if (modal) modal.classList.add('hidden');
        }, 300);
    };

    // Initialize demo mode UI
    window.initDemoModeUI?.();
}
