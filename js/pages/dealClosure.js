/**
 * Deal Closure Page Renderer
 * Final stage of the FundLink flow — term sheet review and deal finalization.
 * Accessible by both Founders and Investors.
 */
import { Auth } from '../modules/auth.js';

export async function renderDealClosure(section, app) {
    try {
        const response = await fetch('/frontend/final_deal_closure_modal.html');
        if (!response.ok) throw new Error(`Failed to load deal closure HTML: ${response.statusText}`);
        const html = await response.text();
        section.innerHTML = html;
        console.log('[Renderer] Deal Closure page loaded.');
    } catch (error) {
        console.error('Error loading deal closure page:', error);
        section.innerHTML = `<div class="p-8 text-center text-red-500">Error loading page.</div>`;
        return;
    }

    // Attach Listeners

    // Return to Negotiation (Back Button)
    const buttons = section.querySelectorAll('button');
    let backBtn, confirmBtn;

    buttons.forEach(btn => {
        if (btn.innerText.includes('Return to Negotiation') || btn.querySelector('.material-symbols-outlined')?.textContent === 'arrow_back') backBtn = btn;
        if (btn.innerText.includes('Confirm Final Commitment') || btn.querySelector('.material-symbols-outlined')?.textContent === 'lock') confirmBtn = btn;
    });

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.hash = '#workspace';
        });
    }

    if (confirmBtn) {
        // Elements
        const radios = section.querySelectorAll('input[name="deal_choice"]');
        const input = section.querySelector('input[type="text"]');
        const warningBox = section.querySelector('.bg-red-600');

        let currentMode = 'accept'; // Default

        // Radio Change Listener
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                currentMode = e.target.value;
                if (currentMode === 'accept') {
                    input.placeholder = "Type 'ACCEPT' here";
                    confirmBtn.innerHTML = 'Confirm Final Commitment <span class="material-symbols-outlined">lock</span>';
                    confirmBtn.className = 'bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]';
                    if (warningBox) warningBox.className = 'bg-red-600 py-1.5 px-8';
                } else {
                    input.placeholder = "Type 'DECLINE' here";
                    confirmBtn.innerHTML = 'Confirm Rejection <span class="material-symbols-outlined">block</span>';
                    confirmBtn.className = 'bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]';
                    if (warningBox) warningBox.className = 'bg-slate-800 py-1.5 px-8';
                }
                // Reset input
                input.value = '';
            });
        });

        // Confirm Click Listener
        confirmBtn.addEventListener('click', () => {
            const requiredText = currentMode === 'accept' ? 'ACCEPT' : 'DECLINE';

            if (!input || input.value.trim().toUpperCase() !== requiredText) {
                app.showToast(`Please type ${requiredText} to confirm.`, 'error');
                input.classList.add('animate-pulse', 'border-red-500');
                setTimeout(() => input.classList.remove('animate-pulse', 'border-red-500'), 500);
                return;
            }

            if (currentMode === 'accept') {
                app.showToast('Deal connection confirmed! Initiating Escrow...', 'success');
                confirmBtn.innerHTML = '<span class="material-symbols-outlined">lock</span> Committed';
            } else {
                app.showToast('Deal declined. Archiving negotiation...', 'info');
                confirmBtn.innerHTML = '<span class="material-symbols-outlined">block</span> Declined';
            }

            confirmBtn.disabled = true;
            confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');

            // Navigate away
            setTimeout(() => {
                window.location.hash = '#workspace';
            }, 2000);
        });
    }
}
