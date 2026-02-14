
import { Auth } from '../modules/auth.js';

export async function renderFounderSettings(section, app) {
    try {
        const response = await fetch('/frontend/founder_control_dashboard_4.html');
        if (!response.ok) throw new Error(`Failed to load settings HTML: ${response.statusText}`);
        const html = await response.text();
        section.innerHTML = html;
    } catch (error) {
        console.error('Error loading settings page:', error);
        section.innerHTML = `<div class="p-8 text-center text-red-500">Error loading page.</div>`;
        return;
    }

    // Logic
    const settingsKey = 'fundlink_founder_settings';

    // Elements
    const els = {
        stealth: section.querySelector('#stealth'),
        visibilityRadios: section.querySelectorAll('input[name="visibility"]'),
        emailConnection: section.querySelector('#email-connection'),
        emailReports: section.querySelector('#email-reports'),
        emailUpdates: section.querySelector('#email-updates'),
        pushActivity: section.querySelector('#push-activity'),
        pushSecurity: section.querySelector('#push-security'),
        saveBtn: section.querySelector('#save-settings-btn')
    };

    // Load Settings
    const saved = JSON.parse(localStorage.getItem(settingsKey));
    if (saved) {
        if (saved.stealth !== undefined && els.stealth) els.stealth.checked = saved.stealth;
        if (saved.visibility && els.visibilityRadios) {
            els.visibilityRadios.forEach(radio => {
                if (radio.value === saved.visibility) radio.checked = true;
            });
        }
        if (saved.emailConnection !== undefined && els.emailConnection) els.emailConnection.checked = saved.emailConnection;
        if (saved.emailReports !== undefined && els.emailReports) els.emailReports.checked = saved.emailReports;
        if (saved.emailUpdates !== undefined && els.emailUpdates) els.emailUpdates.checked = saved.emailUpdates;
        if (saved.pushActivity !== undefined && els.pushActivity) els.pushActivity.checked = saved.pushActivity;
        if (saved.pushSecurity !== undefined && els.pushSecurity) els.pushSecurity.checked = saved.pushSecurity;
    }

    // Save Handler
    if (els.saveBtn) {
        els.saveBtn.addEventListener('click', () => {
            const selectedVisibility = Array.from(els.visibilityRadios).find(r => r.checked)?.value;

            const settings = {
                stealth: els.stealth ? els.stealth.checked : false,
                visibility: selectedVisibility,
                emailConnection: els.emailConnection ? els.emailConnection.checked : true,
                emailReports: els.emailReports ? els.emailReports.checked : true,
                emailUpdates: els.emailUpdates ? els.emailUpdates.checked : false,
                pushActivity: els.pushActivity ? els.pushActivity.checked : true,
                pushSecurity: els.pushSecurity ? els.pushSecurity.checked : false
            };

            localStorage.setItem(settingsKey, JSON.stringify(settings));

            // Visual Feedback
            const originalText = els.saveBtn.innerText;
            els.saveBtn.innerText = 'Saved!';
            els.saveBtn.classList.add('bg-green-600');
            setTimeout(() => {
                els.saveBtn.innerText = originalText;
                els.saveBtn.classList.remove('bg-green-600');
            }, 2000);

            // Show toast if app available
            if (app && app.showToast) {
                app.showToast('Settings saved successfully', 'success');
            }
        });
    }
    // Logout Handler
    const logoutBtn = section.querySelector('#btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to sign out?")) {
                Auth.logout();
            }
        });
    }
}
