/**
 * Accepted Connections Workspace Page Renderer
 * Displays accepted connection profiles for talk and deal disclosure.
 * Accessible by both Founders and Investors after connection acceptance.
 */

import { Auth } from '../modules/auth.js';

// Storage key for accepted connections workspace data
const WORKSPACE_STORAGE_KEY = 'fundlink_workspace_connections';
const MESSAGES_STORAGE_KEY = 'fundlink_workspace_messages';

export function renderAcceptedWorkspace(section, app) {
    const role = Auth.getRole();
    const isFounder = role === 'FOUNDER';
    const currentUser = isFounder ? 'FOUNDER' : 'Marcus Capital';

    // Get accepted connections
    const acceptedConnections = getAcceptedConnections(role);
    const selectedConnectionId = getSelectedConnectionId();

    section.innerHTML = `
    <header class="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-background-dark/90 backdrop-blur-md">
        <div class="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-2.5">
                    <div class="bg-primary p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fill-rule="evenodd"></path></svg>
                    </div>
                    <h1 class="text-lg font-bold tracking-tight">FundLink</h1>
                </div>
                <div class="hidden md:flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-100 dark:border-green-800">
                    <span class="material-symbols-outlined text-[16px] text-green-600">handshake</span>
                    <span class="text-[11px] font-bold text-green-600 uppercase tracking-wider">Connected Partners</span>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <a href="${isFounder ? '#founder-profile' : '#investor-profile'}" class="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">Back to Dashboard</a>
            </div>
        </div>
    </header>

    <div class="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8">
        <main class="space-y-6 pb-20">
            <!-- Page Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Accepted Connections Workspace</h2>
                    <p class="text-sm text-slate-500 mt-1">Secure communication and deal disclosure with your connected partners.</p>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <span class="material-symbols-outlined text-blue-600 text-sm">group</span>
                    <span class="text-xs font-bold text-blue-700 dark:text-blue-400">${acceptedConnections.length} Active Connection${acceptedConnections.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            ${acceptedConnections.length === 0 ? renderEmptyState(isFounder) : renderWorkspaceContent(acceptedConnections, selectedConnectionId, isFounder)}
        </main>
    </div>

    <footer class="bg-slate-900 text-white py-2 px-6">
        <div class="max-w-[1400px] mx-auto flex items-center justify-between text-[11px] font-medium tracking-wide uppercase opacity-80">
            <div class="flex items-center gap-4">
                <span class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> End-to-End Encrypted</span>
                <span>Workspace Session Active</span>
            </div>
            <div>© 2024 FundLink • Bangalore, India</div>
        </div>
    </footer>`;

    // Bind events after rendering
    bindWorkspaceEvents(section, app, acceptedConnections, isFounder);
    console.log('[Renderer] Accepted Connections Workspace rendered.');
}

function renderEmptyState(isFounder) {
    return `
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
        <div class="inline-flex items-center justify-center size-20 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
            <span class="material-symbols-outlined text-4xl text-slate-400">group_off</span>
        </div>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Connections Yet</h3>
        <p class="text-slate-500 max-w-md mx-auto mb-6">
            ${isFounder
            ? 'When investors send you connection requests and you accept them, they will appear here for secure communication and deal discussions.'
            : 'When founders accept your connection requests, they will appear here for secure communication and deal discussions.'}
        </p>
        <a href="${isFounder ? '#founder-inbox' : '#investor-feed'}" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors">
            <span class="material-symbols-outlined">search</span>
            ${isFounder ? 'Check Incoming Requests' : 'Browse Opportunities'}
        </a>
    </div>`;
}

function renderWorkspaceContent(connections, selectedId, isFounder) {
    const selectedConnection = connections.find(c => c.id === selectedId) || connections[0];

    return `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Connections Sidebar -->
        <div class="lg:col-span-4 xl:col-span-3">
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div class="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400">Connected Partners</h3>
                </div>
                <div id="connections-list" class="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                    ${connections.map(conn => renderConnectionCard(conn, conn.id === selectedConnection?.id, isFounder)).join('')}
                </div>
            </div>
        </div>

        <!-- Main Workspace Area -->
        <div class="lg:col-span-8 xl:col-span-9">
            ${selectedConnection ? renderSelectedConnectionWorkspace(selectedConnection, isFounder) : renderNoSelectionState()}
        </div>
    </div>`;
}

function renderConnectionCard(connection, isSelected, isFounder) {
    const partnerName = isFounder ? connection.from : connection.targetName || connection.to;
    const lastMessage = getLastMessage(connection.id);
    const unreadCount = getUnreadCount(connection.id);

    return `
    <div class="connection-card p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${isSelected ? 'bg-primary/5 border-l-2 border-primary' : ''}" 
         data-connection-id="${connection.id}">
        <div class="flex items-start gap-3">
            <div class="size-10 rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'} flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-lg">${isFounder ? 'account_balance' : 'person'}</span>
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                    <h4 class="font-bold text-sm text-slate-900 dark:text-white truncate">${partnerName}</h4>
                    ${unreadCount > 0 ? `<span class="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">${unreadCount}</span>` : ''}
                </div>
                <p class="text-xs text-slate-500 truncate">${lastMessage?.text || 'Start a conversation...'}</p>
                <div class="flex items-center gap-2 mt-2">
                    <span class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full">Active</span>
                    <span class="text-[10px] text-slate-400">${formatTimeAgo(connection.timestamp)}</span>
                </div>
            </div>
        </div>
    </div>`;
}

function renderSelectedConnectionWorkspace(connection, isFounder) {
    const partnerName = isFounder ? connection.from : connection.targetName || connection.to;
    const messages = getMessages(connection.id);

    return `
    <div class="space-y-6">
        <!-- Partner Info Header -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="size-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary text-2xl">${isFounder ? 'account_balance' : 'person'}</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white">${partnerName}</h3>
                        <p class="text-sm text-slate-500">${isFounder ? 'Investment Partner' : 'Startup Founder'}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="flex items-center gap-1 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span class="text-xs font-bold text-green-700 dark:text-green-400">Connected</span>
                    </span>
                </div>
            </div>
            
            <!-- Connection Details -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div>
                    <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Match Score</p>
                    <p class="text-lg font-bold text-primary">${connection.thesisMatch || '92%'}</p>
                </div>
                <div>
                    <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Ticket Size</p>
                    <p class="text-lg font-bold text-slate-700 dark:text-slate-300">${connection.ticketSize || '$1M - $2M'}</p>
                </div>
                <div>
                    <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Connected On</p>
                    <p class="text-lg font-bold text-slate-700 dark:text-slate-300">${formatDate(connection.timestamp)}</p>
                </div>
                <div>
                    <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Status</p>
                    <p class="text-lg font-bold text-green-600">Active</p>
                </div>
            </div>
        </div>

        <!-- Tabs for Talk and Deal Disclosure -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div class="flex border-b border-slate-200 dark:border-slate-800">
                <button class="workspace-tab flex-1 px-6 py-4 text-sm font-bold transition-colors border-b-2 border-primary text-primary" data-tab="talk">
                    <span class="material-symbols-outlined text-lg align-middle mr-2">chat</span>
                    Talk
                </button>
                <button class="workspace-tab flex-1 px-6 py-4 text-sm font-bold transition-colors border-b-2 border-transparent text-slate-500 hover:text-primary" data-tab="disclosure">
                    <span class="material-symbols-outlined text-lg align-middle mr-2">folder_shared</span>
                    Deal Disclosure
                </button>
                <button class="workspace-tab flex-1 px-6 py-4 text-sm font-bold transition-colors border-b-2 border-transparent text-slate-500 hover:text-primary" data-tab="documents">
                    <span class="material-symbols-outlined text-lg align-middle mr-2">description</span>
                    Documents
                </button>
            </div>

            <!-- Tab Content -->
            <div id="tab-content">
                <!-- Talk Tab (Default) -->
                <div id="talk-tab" class="tab-panel">
                    <!-- Messages Area -->
                    <div class="p-6">
                        <div id="messages-container" class="space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            ${messages.length === 0 ? `
                                <div class="text-center py-8 opacity-60">
                                    <span class="material-symbols-outlined text-3xl text-slate-400 mb-2">chat_bubble_outline</span>
                                    <p class="text-sm text-slate-500">Start your conversation with ${partnerName}</p>
                                </div>
                            ` : messages.map(msg => renderMessage(msg, isFounder)).join('')}
                        </div>
                        
                        <!-- Message Input -->
                        <div class="flex gap-3">
                            <input id="message-input" type="text" placeholder="Type your message..." 
                                class="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                data-connection-id="${connection.id}">
                            <button id="send-message-btn" class="px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined">send</span>
                                Send
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Deal Disclosure Tab -->
                <div id="disclosure-tab" class="tab-panel hidden">
                    <div class="p-6 space-y-6">
                        <!-- Deal Summary -->
                        <div class="bg-gradient-to-r from-primary/10 to-blue-50 dark:from-primary/5 dark:to-slate-800 rounded-xl p-6 border border-primary/20">
                            <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span class="material-symbols-outlined text-primary">handshake</span>
                                Deal Summary
                            </h4>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Investment Amount</p>
                                    <p class="text-xl font-bold text-slate-900 dark:text-white">${connection.dealAmount || 'To Be Discussed'}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Equity Stake</p>
                                    <p class="text-xl font-bold text-slate-900 dark:text-white">${connection.equityStake || 'To Be Discussed'}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Valuation</p>
                                    <p class="text-xl font-bold text-slate-900 dark:text-white">${connection.valuation || 'To Be Discussed'}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Deal Stage</p>
                                    <p class="text-xl font-bold text-primary">${connection.dealStage || 'Initial Discussion'}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Disclosure Items -->
                        <div class="space-y-4">
                            <h4 class="text-sm font-bold uppercase tracking-widest text-slate-400">Shared Information</h4>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                    <div class="flex items-center gap-3 mb-3">
                                        <span class="material-symbols-outlined text-green-500">check_circle</span>
                                        <span class="font-bold text-sm text-slate-900 dark:text-white">Identity Revealed</span>
                                    </div>
                                    <p class="text-xs text-slate-500">Both parties have agreed to share identity information.</p>
                                </div>
                                
                                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                    <div class="flex items-center gap-3 mb-3">
                                        <span class="material-symbols-outlined text-green-500">check_circle</span>
                                        <span class="font-bold text-sm text-slate-900 dark:text-white">Contact Details</span>
                                    </div>
                                    <p class="text-xs text-slate-500">Email and phone access enabled for direct communication.</p>
                                </div>
                                
                                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                    <div class="flex items-center gap-3 mb-3">
                                        <span class="material-symbols-outlined text-amber-500">pending</span>
                                        <span class="font-bold text-sm text-slate-900 dark:text-white">Financial Data</span>
                                    </div>
                                    <p class="text-xs text-slate-500">Awaiting founder approval for financial disclosure.</p>
                                </div>
                                
                                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                    <div class="flex items-center gap-3 mb-3">
                                        <span class="material-symbols-outlined text-amber-500">pending</span>
                                        <span class="font-bold text-sm text-slate-900 dark:text-white">Pitch Deck Access</span>
                                    </div>
                                    <p class="text-xs text-slate-500">Full pitch deck available for review.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <a href="#deal-closure" class="px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined">gavel</span>
                                Proceed to Deal Closure
                            </a>
                            <button id="request-disclosure-btn" class="px-6 py-3 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                                <span class="material-symbols-outlined">lock_open</span>
                                Request Additional Disclosure
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Documents Tab -->
                <div id="documents-tab" class="tab-panel hidden">
                    <div class="p-6">
                        <div class="space-y-4">
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="text-sm font-bold uppercase tracking-widest text-slate-400">Shared Documents</h4>
                                <button class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                    <span class="material-symbols-outlined text-sm">upload</span>
                                    Upload Document
                                </button>
                            </div>
                            
                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div class="flex items-center gap-3">
                                        <span class="material-symbols-outlined text-red-500 text-2xl">picture_as_pdf</span>
                                        <div>
                                            <p class="font-bold text-sm text-slate-900 dark:text-white">Pitch_Deck_v2.4.pdf</p>
                                            <p class="text-xs text-slate-500">Shared by Founder • 2.4 MB</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <span class="material-symbols-outlined text-slate-500">visibility</span>
                                        </button>
                                        <button class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <span class="material-symbols-outlined text-slate-500">download</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div class="flex items-center gap-3">
                                        <span class="material-symbols-outlined text-blue-500 text-2xl">table_chart</span>
                                        <div>
                                            <p class="font-bold text-sm text-slate-900 dark:text-white">Financial_Model.xlsx</p>
                                            <p class="text-xs text-slate-500">Shared by Founder • 856 KB</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <span class="material-symbols-outlined text-slate-500">visibility</span>
                                        </button>
                                        <button class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <span class="material-symbols-outlined text-slate-500">download</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div class="flex items-center gap-3">
                                        <span class="material-symbols-outlined text-green-500 text-2xl">article</span>
                                        <div>
                                            <p class="font-bold text-sm text-slate-900 dark:text-white">Term_Sheet_Draft.docx</p>
                                            <p class="text-xs text-slate-500">Shared by Investor • 124 KB</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <span class="material-symbols-outlined text-slate-500">visibility</span>
                                        </button>
                                        <button class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                            <span class="material-symbols-outlined text-slate-500">download</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- AI Report Section -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-bold uppercase tracking-widest text-slate-400">AI Analysis</h4>
                <button id="generate-ai-report-btn" class="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">insights</span>
                    Generate Report
                </button>
            </div>
            <div id="ai-report-output" class="hidden bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-sm text-slate-600 dark:text-slate-300 font-mono whitespace-pre-wrap"></div>
        </div>
    </div>`;
}

function renderMessage(message, isFounder) {
    const isOwn = message.sender === (isFounder ? 'FOUNDER' : 'INVESTOR');

    return `
    <div class="flex gap-3 ${isOwn ? 'justify-end' : ''}">
        <div class="${isOwn ? 'bg-primary/10' : 'bg-white dark:bg-slate-700'} rounded-lg p-3 max-w-[80%] shadow-sm">
            <p class="text-xs text-slate-400 mb-1">${message.sender} • ${formatTimeAgo(message.timestamp)}</p>
            <p class="text-sm text-slate-700 dark:text-slate-200">${message.text}</p>
        </div>
    </div>`;
}

// Helper Functions
function getAcceptedConnections(role) {
    const allRequests = JSON.parse(localStorage.getItem('fundlink_connection_requests') || '[]');

    if (role === 'FOUNDER') {
        // Founders see accepted requests where they were the recipient
        return allRequests.filter(r =>
            (r.to === 'FOUNDER' || r.to === 'Stealth Founder') && r.status === 'accepted'
        );
    } else {
        // Investors see accepted requests they sent or received
        return allRequests.filter(r =>
            ((r.from === 'INVESTOR' || r.from === 'Marcus Capital') && r.status === 'accepted') ||
            ((r.to === 'INVESTOR' || r.to === 'Marcus Capital') && r.status === 'accepted')
        );
    }
}

function getSelectedConnectionId() {
    return parseInt(localStorage.getItem('fundlink_selected_connection') || '0');
}

function setSelectedConnectionId(id) {
    localStorage.setItem('fundlink_selected_connection', id.toString());
}

function getMessages(connectionId) {
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '{}');
    return allMessages[connectionId] || [];
}

function saveMessage(connectionId, message) {
    const allMessages = JSON.parse(localStorage.getItem(MESSAGES_STORAGE_KEY) || '{}');
    if (!allMessages[connectionId]) {
        allMessages[connectionId] = [];
    }
    allMessages[connectionId].push(message);
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(allMessages));
}

function getLastMessage(connectionId) {
    const messages = getMessages(connectionId);
    return messages.length > 0 ? messages[messages.length - 1] : null;
}

function getUnreadCount(connectionId) {
    // For demo purposes, return 0
    return 0;
}

function formatDate(isoString) {
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
        return 'Recently';
    }
}

function formatTimeAgo(isoString) {
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(isoString);
    } catch (e) {
        return 'Recently';
    }
}

function bindWorkspaceEvents(section, app, connections, isFounder) {
    // Connection card selection
    section.querySelectorAll('.connection-card').forEach(card => {
        card.addEventListener('click', () => {
            const connectionId = parseInt(card.dataset.connectionId);
            setSelectedConnectionId(connectionId);
            // Re-render to update selection
            renderAcceptedWorkspace(section, app);
        });
    });

    // Tab switching
    section.querySelectorAll('.workspace-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;

            // Update tab styles
            section.querySelectorAll('.workspace-tab').forEach(t => {
                t.classList.remove('border-primary', 'text-primary');
                t.classList.add('border-transparent', 'text-slate-500');
            });
            tab.classList.remove('border-transparent', 'text-slate-500');
            tab.classList.add('border-primary', 'text-primary');

            // Show/hide panels
            section.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.add('hidden');
            });
            const targetPanel = section.querySelector(`#${tabName}-tab`);
            if (targetPanel) {
                targetPanel.classList.remove('hidden');
            }
        });
    });

    // Message sending
    const sendBtn = section.querySelector('#send-message-btn');
    const messageInput = section.querySelector('#message-input');

    if (sendBtn && messageInput) {
        const connectionId = parseInt(messageInput.dataset.connectionId);

        const sendMessage = () => {
            const text = messageInput.value.trim();
            if (!text) return;

            const message = {
                id: Date.now(),
                sender: isFounder ? 'FOUNDER' : 'INVESTOR',
                text: text,
                timestamp: new Date().toISOString()
            };

            saveMessage(connectionId, message);
            messageInput.value = '';

            // Re-render messages
            const messagesContainer = section.querySelector('#messages-container');
            if (messagesContainer) {
                const messages = getMessages(connectionId);
                messagesContainer.innerHTML = messages.map(msg => renderMessage(msg, isFounder)).join('');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }

            if (app && app.showToast) {
                app.showToast('Message sent!', 'success');
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // AI Report generation
    const aiReportBtn = section.querySelector('#generate-ai-report-btn');
    if (aiReportBtn) {
        aiReportBtn.addEventListener('click', async () => {
            const outputEl = section.querySelector('#ai-report-output');
            aiReportBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">refresh</span> Generating...';
            aiReportBtn.disabled = true;

            try {
                if (app && app.ai) {
                    const result = await app.ai.generateSeniorAnalystReport('workspace');
                    if (outputEl) {
                        outputEl.classList.remove('hidden');
                        outputEl.textContent = JSON.stringify(result, null, 2);
                    }
                    if (app.showToast) {
                        app.showToast('AI Report generated!', 'info');
                    }
                } else {
                    // Simulate AI report
                    if (outputEl) {
                        outputEl.classList.remove('hidden');
                        outputEl.textContent = `=== CONNECTION ANALYSIS REPORT ===
Generated: ${new Date().toLocaleString()}

PARTNERSHIP INSIGHTS:
• Match Score: 92% - Strong alignment detected
• Communication: Active engagement observed
• Deal Progression: Initial discussion phase

RECOMMENDATIONS:
1. Schedule a video call to discuss terms
2. Share detailed financial projections
3. Prepare term sheet for review

RISK ASSESSMENT: Low
OPPORTUNITY SCORE: High`;
                    }
                }
            } catch (e) {
                if (app && app.showToast) {
                    app.showToast('Report generation failed.', 'error');
                }
            }

            aiReportBtn.innerHTML = '<span class="material-symbols-outlined text-sm">insights</span> Generate Report';
            aiReportBtn.disabled = false;
        });
    }

    // Request disclosure button
    const disclosureBtn = section.querySelector('#request-disclosure-btn');
    if (disclosureBtn) {
        disclosureBtn.addEventListener('click', () => {
            if (app && app.showToast) {
                app.showToast('Additional disclosure request sent!', 'success');
            }
        });
    }
}

// Export for routing
export default renderAcceptedWorkspace;
