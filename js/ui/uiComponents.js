/**
 * FundLink UI Components Module
 * Provides loading states, keyboard navigation, and focus management utilities
 */

// ==================== Loading States ====================

/**
 * Loading Spinner Component
 */
class LoadingSpinner {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            size: options.size || 'md', // sm, md, lg
            color: options.color || 'primary',
            text: options.text || 'Loading...',
            showText: options.showText !== false,
        };
        this.element = null;
    }

    show() {
        const sizeClasses = {
            sm: 'w-4 h-4',
            md: 'w-8 h-8',
            lg: 'w-12 h-12',
        };

        const colorClasses = {
            primary: 'border-primary',
            white: 'border-white',
            gray: 'border-gray-400',
        };

        this.element = document.createElement('div');
        this.element.className = 'loading-spinner-container flex flex-col items-center justify-center gap-3';
        this.element.innerHTML = `
            <div class="loading-spinner ${sizeClasses[this.options.size]} border-4 border-t-transparent ${colorClasses[this.options.color]} rounded-full animate-spin"></div>
            ${this.options.showText ? `<p class="text-sm text-slate-600 dark:text-slate-400">${this.options.text}</p>` : ''}
        `;

        this.container.innerHTML = '';
        this.container.appendChild(this.element);
    }

    hide() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

/**
 * Skeleton Loader Component
 */
class SkeletonLoader {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            type: options.type || 'card', // card, list, text, avatar, table
            count: options.count || 1,
            animated: options.animated !== false,
        };
        this.element = null;
    }

    show() {
        const skeletons = {
            card: `
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div class="skeleton h-4 w-3/4 rounded mb-3"></div>
                    <div class="skeleton h-3 w-1/2 rounded mb-2"></div>
                    <div class="skeleton h-3 w-1/3 rounded"></div>
                </div>
            `,
            list: `
                <div class="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
                    <div class="skeleton w-10 h-10 rounded-full"></div>
                    <div class="flex-1">
                        <div class="skeleton h-4 w-3/4 rounded mb-2"></div>
                        <div class="skeleton h-3 w-1/2 rounded"></div>
                    </div>
                </div>
            `,
            text: `
                <div class="space-y-2">
                    <div class="skeleton h-4 w-full rounded"></div>
                    <div class="skeleton h-4 w-5/6 rounded"></div>
                    <div class="skeleton h-4 w-4/6 rounded"></div>
                </div>
            `,
            avatar: `
                <div class="flex items-center gap-3">
                    <div class="skeleton w-12 h-12 rounded-full"></div>
                    <div class="skeleton h-4 w-24 rounded"></div>
                </div>
            `,
            table: `
                <div class="space-y-3">
                    <div class="flex gap-4">
                        <div class="skeleton h-4 w-1/4 rounded"></div>
                        <div class="skeleton h-4 w-1/4 rounded"></div>
                        <div class="skeleton h-4 w-1/4 rounded"></div>
                        <div class="skeleton h-4 w-1/4 rounded"></div>
                    </div>
                    ${Array(5).fill().map(() => `
                        <div class="flex gap-4 py-2">
                            <div class="skeleton h-4 w-1/4 rounded"></div>
                            <div class="skeleton h-4 w-1/4 rounded"></div>
                            <div class="skeleton h-4 w-1/4 rounded"></div>
                            <div class="skeleton h-4 w-1/4 rounded"></div>
                        </div>
                    `).join('')}
                </div>
            `,
        };

        const animationStyle = this.options.animated ? 'skeleton' : 'bg-slate-200 dark:bg-slate-700';

        this.element = document.createElement('div');
        this.element.className = 'skeleton-loader';
        this.element.innerHTML = Array(this.options.count)
            .fill(skeletons[this.options.type])
            .join('')
            .replace(/skeleton/g, animationStyle);

        this.container.innerHTML = '';
        this.container.appendChild(this.element);
    }

    hide() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

/**
 * Loading Overlay Component
 */
class LoadingOverlay {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            text: options.text || 'Processing...',
            showProgress: options.showProgress || false,
            opacity: options.opacity || 0.8,
        };
        this.element = null;
        this.progress = 0;
    }

    show() {
        this.element = document.createElement('div');
        this.element.className = 'loading-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm';
        this.element.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
                <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p class="text-slate-900 dark:text-white font-semibold mb-2">${this.options.text}</p>
                ${this.options.showProgress ? `
                    <div class="bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2">
                        <div class="progress-bar bg-primary h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <p class="text-sm text-slate-500 progress-text">0%</p>
                ` : ''}
            </div>
        `;

        document.body.appendChild(this.element);
    }

    setProgress(progress) {
        this.progress = Math.min(100, Math.max(0, progress));
        if (this.element) {
            const progressBar = this.element.querySelector('.progress-bar');
            const progressText = this.element.querySelector('.progress-text');
            if (progressBar) {
                progressBar.style.width = `${this.progress}%`;
            }
            if (progressText) {
                progressText.textContent = `${Math.round(this.progress)}%`;
            }
        }
    }

    hide() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// ==================== Keyboard Navigation ====================

/**
 * Keyboard Navigation Manager
 */
class KeyboardNavigation {
    constructor(options = {}) {
        this.options = {
            selector: options.selector || '[tabindex="0"], button, a, input, select, textarea',
            container: options.container || document,
            onEnter: options.onEnter || null,
            onEscape: options.onEscape || null,
            onArrowUp: options.onArrowUp || null,
            onArrowDown: options.onArrowDown || null,
            onTab: options.onTab || null,
            trapFocus: options.trapFocus || false,
        };
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.isActive = false;
    }

    init() {
        this.updateFocusableElements();
        this.bindEvents();
    }

    updateFocusableElements() {
        const container = typeof this.options.container === 'string'
            ? document.querySelector(this.options.container)
            : this.options.container;

        this.focusableElements = Array.from(container.querySelectorAll(this.options.selector))
            .filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;

            switch (e.key) {
                case 'Enter':
                case ' ':
                    if (this.options.onEnter) {
                        e.preventDefault();
                        this.options.onEnter(document.activeElement);
                    }
                    break;
                case 'Escape':
                    if (this.options.onEscape) {
                        e.preventDefault();
                        this.options.onEscape();
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (this.options.onArrowUp) {
                        this.options.onArrowUp();
                    } else {
                        this.focusPrevious();
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.options.onArrowDown) {
                        this.options.onArrowDown();
                    } else {
                        this.focusNext();
                    }
                    break;
                case 'Tab':
                    if (this.options.trapFocus) {
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.focusPrevious();
                        } else {
                            this.focusNext();
                        }
                    }
                    if (this.options.onTab) {
                        this.options.onTab(e);
                    }
                    break;
            }
        });
    }

    focusFirst() {
        if (this.focusableElements.length > 0) {
            this.currentFocusIndex = 0;
            this.focusableElements[0].focus();
        }
    }

    focusLast() {
        if (this.focusableElements.length > 0) {
            this.currentFocusIndex = this.focusableElements.length - 1;
            this.focusableElements[this.currentFocusIndex].focus();
        }
    }

    focusNext() {
        this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
        this.focusableElements[this.currentFocusIndex].focus();
    }

    focusPrevious() {
        this.currentFocusIndex = (this.currentFocusIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
        this.focusableElements[this.currentFocusIndex].focus();
    }

    activate() {
        this.isActive = true;
        this.updateFocusableElements();
    }

    deactivate() {
        this.isActive = false;
    }
}

/**
 * Focus Manager for Modals
 */
class FocusManager {
    constructor(modalElement, options = {}) {
        this.modal = typeof modalElement === 'string' ? document.querySelector(modalElement) : modalElement;
        this.options = {
            initialFocus: options.initialFocus || null,
            returnFocus: options.returnFocus || null,
            closeOnEscape: options.closeOnEscape !== false,
            onClose: options.onClose || null,
        };
        this.previousFocus = null;
        this.keyboardNav = null;
    }

    trap() {
        // Store the previously focused element
        this.previousFocus = document.activeElement;

        // Create keyboard navigation with focus trap
        this.keyboardNav = new KeyboardNavigation({
            container: this.modal,
            trapFocus: true,
            onEscape: () => {
                if (this.options.closeOnEscape) {
                    this.release();
                    if (this.options.onClose) {
                        this.options.onClose();
                    }
                }
            },
        });

        this.keyboardNav.init();
        this.keyboardNav.activate();

        // Set initial focus
        const initialFocus = this.options.initialFocus
            ? this.modal.querySelector(this.options.initialFocus)
            : this.modal.querySelector('button, [tabindex="0"], input, select, textarea');

        if (initialFocus) {
            initialFocus.focus();
        } else {
            this.keyboardNav.focusFirst();
        }
    }

    release() {
        if (this.keyboardNav) {
            this.keyboardNav.deactivate();
        }

        // Return focus to previous element
        const returnFocus = this.options.returnFocus
            ? document.querySelector(this.options.returnFocus)
            : this.previousFocus;

        if (returnFocus) {
            returnFocus.focus();
        }
    }
}

// ==================== Utility Functions ====================

/**
 * Add tabindex to interactive elements
 */
function addTabIndices(container = document) {
    const containerEl = typeof container === 'string' ? document.querySelector(container) : container;

    // Add tabindex to clickable elements without one
    containerEl.querySelectorAll('.vault-item, .message-item, [role="button"]').forEach((el, index) => {
        if (!el.hasAttribute('tabindex')) {
            el.setAttribute('tabindex', '0');
        }
    });

    // Add role="button" to clickable elements
    containerEl.querySelectorAll('[tabindex="0"]:not(button):not(a)').forEach(el => {
        if (!el.hasAttribute('role')) {
            el.setAttribute('role', 'button');
        }
    });
}

/**
 * Add visible focus indicators
 */
function addFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
        /* Focus visible styles */
        :focus-visible {
            outline: 2px solid #135bec;
            outline-offset: 2px;
        }
        
        /* Remove default outline when not using keyboard */
        :focus:not(:focus-visible) {
            outline: none;
        }
        
        /* Custom focus styles for cards */
        .vault-item:focus-visible,
        .message-item:focus-visible {
            outline: 2px solid #135bec;
            outline-offset: 2px;
            box-shadow: 0 0 0 4px rgba(19, 91, 236, 0.1);
        }
        
        /* Skip link styles */
        .skip-link {
            position: absolute;
            top: -40px;
            left: 0;
            background: #135bec;
            color: white;
            padding: 8px 16px;
            z-index: 100;
            transition: top 0.3s;
        }
        
        .skip-link:focus {
            top: 0;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Create skip link for accessibility
 */
function createSkipLink(targetId) {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus();
        }
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Initialize accessibility features
 */
function initAccessibility() {
    addFocusIndicators();
    addTabIndices();
    createSkipLink('main-content');

    // Add main content id to main element if not present
    const mainEl = document.querySelector('main');
    if (mainEl && !mainEl.id) {
        mainEl.id = 'main-content';
    }
}

// ==================== Export ====================

window.LoadingSpinner = LoadingSpinner;
window.SkeletonLoader = SkeletonLoader;
window.LoadingOverlay = LoadingOverlay;
window.KeyboardNavigation = KeyboardNavigation;
window.FocusManager = FocusManager;
window.initAccessibility = initAccessibility;
window.addTabIndices = addTabIndices;
window.addFocusIndicators = addFocusIndicators;

export {
    LoadingSpinner,
    SkeletonLoader,
    LoadingOverlay,
    KeyboardNavigation,
    FocusManager,
    initAccessibility,
    addTabIndices,
    addFocusIndicators,
};