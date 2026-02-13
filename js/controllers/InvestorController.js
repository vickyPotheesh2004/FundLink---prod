/**
 * InvestorController
 * Manages the interactive state of the Investor Dashboard.
 */
export default class InvestorController {
    constructor(aiClient) {
        this.ai = aiClient;
        this.init();
    }

    init() {
        console.log('[InvestorController] Initialized.');
        this.bindEvents();
    }

    bindEvents() {
        // Find all "Connect" buttons. 
        // Heuristic: Buttons containing "Connect" text or handshake icon.
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.innerText.includes('Connect') || btn.querySelector('.material-symbols-outlined')?.innerText === 'handshake') {
                btn.addEventListener('click', (e) => this.handleUnlock(e));
            }
        });
    }

    async handleUnlock(e) {
        const btn = e.currentTarget;

        // Friction: Typed Confirmation
        const userInput = prompt("SECURITY PROTOCOL\n\nType 'ACCEPT' to unlock the secure workspace and reveal contact details.\n\nThis action is logged.");

        if (userInput === 'ACCEPT') {
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span class="material-symbols-outlined animate-spin">progress_activity</span> Unlocking...`;

            // Simulate API call
            await new Promise(r => setTimeout(r, 1500));

            btn.innerHTML = `<span class="material-symbols-outlined">lock_open</span> Workspace Active`;
            btn.classList.remove('bg-primary', 'hover:bg-blue-700');
            btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');

            alert("SECURE WORKSPACE ESTABLISHED\n\nContact details decrypted. Redirecting to Negotiation Room...");
            // In a real app, redirect to secure_workspace_negotiation.html
            window.location.href = 'frontend/secure_workspace_negotiation.html';
        } else {
            alert("Action Cancelled. Verification Failed.");
        }
    }
}
