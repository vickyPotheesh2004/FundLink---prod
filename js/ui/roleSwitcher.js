/**
 * Role Switcher UI Component
 * Provides a seamless UI for switching between Founder and Investor views.
 * No access restrictions - users can freely switch between roles.
 */

import { AccessControl } from '../modules/accessControl.js';

/**
 * Role Switcher Component
 */
export const RoleSwitcher = {
    /**
     * Initialize the role switcher
     */
    init() {
        this.createSwitcherUI();
        this.bindEvents();
        this.setupHotkey();
        console.log('[RoleSwitcher] Initialized');
    },

    /**
     * Create the role switcher UI element
     */
    createSwitcherUI() {
        // Check if switcher already exists
        if (document.getElementById('role-switcher-container')) {
            return;
        }

        const config = AccessControl.getRoleSwitcherConfig();
        const currentRole = AccessControl.getRole() || 'FOUNDER';

        const switcherHTML = `
            <div id="role-switcher-container" class="role-switcher-container">
                <style>
                    .role-switcher-container {
                        position: fixed;
                        top: 80px;
                        right: 20px;
                        z-index: 9999;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    }
                    
                    .role-switcher-toggle {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 12px 16px;
                        background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        cursor: pointer;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                        transition: all 0.3s ease;
                    }
                    
                    .role-switcher-toggle:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
                        border-color: rgba(255, 255, 255, 0.2);
                    }
                    
                    .role-switcher-toggle.founder {
                        border-left: 3px solid #6366f1;
                    }
                    
                    .role-switcher-toggle.investor {
                        border-left: 3px solid #10b981;
                    }
                    
                    .role-icon {
                        width: 36px;
                        height: 36px;
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        color: white;
                    }
                    
                    .role-icon.founder {
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    }
                    
                    .role-icon.investor {
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    }
                    
                    .role-info {
                        display: flex;
                        flex-direction: column;
                    }
                    
                    .role-label {
                        font-size: 14px;
                        font-weight: 600;
                        color: #ffffff;
                    }
                    
                    .role-hint {
                        font-size: 11px;
                        color: rgba(255, 255, 255, 0.6);
                    }
                    
                    .switch-indicator {
                        margin-left: auto;
                        padding: 4px 8px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 6px;
                        font-size: 10px;
                        color: rgba(255, 255, 255, 0.7);
                    }
                    
                    .role-switcher-dropdown {
                        position: absolute;
                        top: calc(100% + 8px);
                        right: 0;
                        min-width: 220px;
                        background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
                        opacity: 0;
                        visibility: hidden;
                        transform: translateY(-10px);
                        transition: all 0.3s ease;
                    }
                    
                    .role-switcher-dropdown.open {
                        opacity: 1;
                        visibility: visible;
                        transform: translateY(0);
                    }
                    
                    .dropdown-header {
                        padding: 12px 16px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.6);
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    
                    .role-option {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 14px 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    
                    .role-option:hover {
                        background: rgba(255, 255, 255, 0.05);
                    }
                    
                    .role-option.active {
                        background: rgba(255, 255, 255, 0.1);
                    }
                    
                    .role-option-icon {
                        width: 40px;
                        height: 40px;
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        color: white;
                    }
                    
                    .role-option-icon.founder {
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    }
                    
                    .role-option-icon.investor {
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    }
                    
                    .role-option-info {
                        flex: 1;
                    }
                    
                    .role-option-label {
                        font-size: 14px;
                        font-weight: 600;
                        color: #ffffff;
                        margin-bottom: 2px;
                    }
                    
                    .role-option-desc {
                        font-size: 11px;
                        color: rgba(255, 255, 255, 0.5);
                    }
                    
                    .role-option-check {
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #10b981;
                        font-size: 12px;
                        opacity: 0;
                    }
                    
                    .role-option.active .role-option-check {
                        opacity: 1;
                    }
                    
                    .dropdown-footer {
                        padding: 12px 16px;
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                        font-size: 11px;
                        color: rgba(255, 255, 255, 0.4);
                        text-align: center;
                    }
                    
                    .dropdown-footer kbd {
                        background: rgba(255, 255, 255, 0.1);
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-family: monospace;
                    }
                    
                    /* Mobile responsive */
                    @media (max-width: 768px) {
                        .role-switcher-container {
                            top: auto;
                            bottom: 20px;
                            right: 10px;
                            left: 10px;
                        }
                        
                        .role-switcher-toggle {
                            justify-content: center;
                        }
                        
                        .role-switcher-dropdown {
                            left: 0;
                            right: 0;
                            min-width: auto;
                        }
                    }
                </style>
                
                <div class="role-switcher-toggle ${currentRole.toLowerCase()}" id="role-switcher-toggle">
                    <div class="role-icon ${currentRole.toLowerCase()}">
                        <i class="fas ${currentRole === 'FOUNDER' ? 'fa-rocket' : 'fa-briefcase'}"></i>
                    </div>
                    <div class="role-info">
                        <span class="role-label">${currentRole === 'FOUNDER' ? 'Founder View' : 'Investor View'}</span>
                        <span class="role-hint">Click to switch role</span>
                    </div>
                    <span class="switch-indicator">
                        <i class="fas fa-exchange-alt"></i>
                    </span>
                </div>
                
                <div class="role-switcher-dropdown" id="role-switcher-dropdown">
                    <div class="dropdown-header">Switch Role View</div>
                    
                    <div class="role-option ${currentRole === 'FOUNDER' ? 'active' : ''}" data-role="FOUNDER">
                        <div class="role-option-icon founder">
                            <i class="fas fa-rocket"></i>
                        </div>
                        <div class="role-option-info">
                            <div class="role-option-label">Founder View</div>
                            <div class="role-option-desc">Dashboard, analytics & deal flow</div>
                        </div>
                        <div class="role-option-check">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                    
                    <div class="role-option ${currentRole === 'INVESTOR' ? 'active' : ''}" data-role="INVESTOR">
                        <div class="role-option-icon investor">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <div class="role-option-info">
                            <div class="role-option-label">Investor View</div>
                            <div class="role-option-desc">Deal feed, portfolio & thesis</div>
                        </div>
                        <div class="role-option-check">
                            <i class="fas fa-check"></i>
                        </div>
                    </div>
                    
                    <div class="dropdown-footer">
                        Press <kbd>Alt</kbd> + <kbd>R</kbd> to quick switch
                    </div>
                </div>
            </div>
        `;

        // Insert into DOM
        document.body.insertAdjacentHTML('beforeend', switcherHTML);
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        const toggle = document.getElementById('role-switcher-toggle');
        const dropdown = document.getElementById('role-switcher-dropdown');

        if (toggle && dropdown) {
            // Toggle dropdown on click
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#role-switcher-container')) {
                    dropdown.classList.remove('open');
                }
            });
        }

        // Role option clicks
        document.querySelectorAll('.role-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const role = e.currentTarget.dataset.role;
                this.switchToRole(role);
            });
        });

        // Listen for role changes from other sources
        window.addEventListener('accessControl:roleSwitched', (e) => {
            this.updateUI(e.detail.newRole);
        });
    },

    /**
     * Setup keyboard hotkey for quick switching
     */
    setupHotkey() {
        document.addEventListener('keydown', (e) => {
            // Alt + R to switch roles
            if (e.altKey && e.key.toLowerCase() === 'r') {
                e.preventDefault();
                this.toggleRole();
            }
        });
    },

    /**
     * Toggle between roles
     */
    toggleRole() {
        const currentRole = AccessControl.getRole() || 'FOUNDER';
        const newRole = currentRole === 'FOUNDER' ? 'INVESTOR' : 'FOUNDER';
        this.switchToRole(newRole);
    },

    /**
     * Switch to a specific role
     * @param {string} role - FOUNDER or INVESTOR
     */
    switchToRole(role) {
        const previousRole = AccessControl.getRole();

        // Switch the role (always succeeds)
        AccessControl.switchRole(role);

        // Update UI
        this.updateUI(role);

        // Navigate to the appropriate dashboard
        const dashboardConfig = AccessControl.getDashboardConfig(role);
        window.location.hash = `#${dashboardConfig.defaultRoute}`;

        // Close dropdown
        const dropdown = document.getElementById('role-switcher-dropdown');
        if (dropdown) {
            dropdown.classList.remove('open');
        }

        // Show notification
        this.showNotification(`Switched to ${role === 'FOUNDER' ? 'Founder' : 'Investor'} View`);

        console.log(`[RoleSwitcher] Switched to ${role}`);
    },

    /**
     * Update the UI to reflect current role
     * @param {string} role - Current role
     */
    updateUI(role) {
        const toggle = document.getElementById('role-switcher-toggle');
        const icon = toggle?.querySelector('.role-icon');
        const label = toggle?.querySelector('.role-label');

        if (toggle) {
            toggle.classList.remove('founder', 'investor');
            toggle.classList.add(role.toLowerCase());
        }

        if (icon) {
            icon.classList.remove('founder', 'investor');
            icon.classList.add(role.toLowerCase());
            icon.innerHTML = `<i class="fas ${role === 'FOUNDER' ? 'fa-rocket' : 'fa-briefcase'}"></i>`;
        }

        if (label) {
            label.textContent = role === 'FOUNDER' ? 'Founder View' : 'Investor View';
        }

        // Update dropdown options
        document.querySelectorAll('.role-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.role === role) {
                option.classList.add('active');
            }
        });
    },

    /**
     * Show a notification toast
     * @param {string} message - Message to display
     */
    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'role-switcher-notification';
        notification.innerHTML = `
            <style>
                .role-switcher-notification {
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    animation: slideUp 0.3s ease, fadeOut 0.3s ease 2s forwards;
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                
                @keyframes fadeOut {
                    to {
                        opacity: 0;
                        visibility: hidden;
                    }
                }
            </style>
            <i class="fas fa-check-circle" style="color: #10b981; margin-right: 8px;"></i>
            ${message}
        `;

        document.body.appendChild(notification);

        // Remove after animation
        setTimeout(() => {
            notification.remove();
        }, 2500);
    },

    /**
     * Show or hide the role switcher
     * @param {boolean} show - Whether to show the switcher
     */
    setVisible(show) {
        const container = document.getElementById('role-switcher-container');
        if (container) {
            container.style.display = show ? 'block' : 'none';
        }
    },

    /**
     * Destroy the role switcher UI
     */
    destroy() {
        const container = document.getElementById('role-switcher-container');
        if (container) {
            container.remove();
        }
    }
};

export default RoleSwitcher;