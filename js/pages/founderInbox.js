
import { Auth } from '../modules/auth.js';

export async function renderFounderInbox(section, app) {
    try {
        const response = await fetch('/frontend/incoming_connection_requests.html');
        if (!response.ok) throw new Error(`Failed to load inbox HTML: ${response.statusText}`);
        const html = await response.text();
        section.innerHTML = html;
    } catch (error) {
        console.error('Error loading founder inbox:', error);
        section.innerHTML = `<div class="p-8 text-center text-red-500">Error loading inbox.</div>`;
        return;
    }

    // Logic
    // Auto-seed for demo
    let requests = Auth.getIncomingRequests('FOUNDER');
    const hasPending = requests.some(r => r.from === 'INVESTOR' && r.status === 'pending');

    if (!hasPending) {
        console.log("Demo: Auto-seeding 'Marcus Capital' connection request.");
        Auth.sendConnectionRequest('INVESTOR', 'FOUNDER');
        requests = Auth.getIncomingRequests('FOUNDER');
    }

    const marcusRequest = requests.find(r => r.from === 'INVESTOR');
    if (marcusRequest && marcusRequest.status === 'pending') {
        const card = document.getElementById('card-marcus-request');
        if (card) card.classList.remove('hidden');
    }

    window.acceptRequest = (cardId, fromName) => {
        const req = requests.find(r => r.from === 'INVESTOR' && r.status === 'pending');
        if (req) {
            Auth.acceptConnectionRequest(req.id);
            // Show alert
            alert(`You are now connected with ${fromName}. Private workspace unlocked.`);
            // In a real app we would redirect or update UI. 
            // For now, let's hide the button to show state change
            const card = document.getElementById(cardId);
            const btn = card.querySelector('button');
            if (btn) {
                btn.innerText = "Connected";
                btn.classList.add('bg-green-600', 'cursor-not-allowed');
                btn.classList.remove('bg-primary', 'hover:bg-primary/90');
                btn.disabled = true;
            }
        }
    };
}
