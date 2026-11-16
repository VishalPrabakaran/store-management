/**
 * Vishal Hypermarket & Store Management System
 * Shared Utilities, Navigation, Toast Notifications, Session Protection, and Modals
 */

// Global session & auth protection
function checkAuth(isLoginPage = false) {
    const session = getAuthSession();
    if (isLoginPage) {
        if (session && session.isLoggedIn) {
            window.location.replace('dashboard.html');
        }
    } else {
        if (!session || !session.isLoggedIn) {
            window.location.replace('index.html');
        }
    }
}

function getAuthSession() {
    try {
        const data = sessionStorage.getItem(STORAGE_KEYS.AUTH);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function setAuthSession(user) {
    const sessionData = {
        isLoggedIn: true,
        username: user.username || 'admin',
        displayName: user.displayName || 'Admin Manager',
        role: 'Store Administrator',
        loginTime: new Date().toISOString()
    };
    sessionStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(sessionData));
}

function logout() {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    showToast('Logged out successfully. Redirecting to login...', 'info');
    setTimeout(() => {
        window.location.replace('index.html');
    }, 800);
}

/**
 * Toast Notification System
 */
function showToast(message, type = 'success', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let iconClass = 'fa-circle-check';
    if (type === 'error' || type === 'danger') iconClass = 'fa-circle-xmark';
    else if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    else if (type === 'info') iconClass = 'fa-circle-info';

    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${escapeHtml(message)}</div>
        </div>
        <button class="toast-close" type="button" aria-label="Close">&times;</button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 300);
    };

    closeBtn.addEventListener('click', dismiss);

    const timer = setTimeout(dismiss, duration);
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
}

/**
 * Formatting Utilities
 */
function formatCurrency(amount) {
    const settings = getStoredSettings();
    const symbol = settings.currencySymbol || '₹';
    const num = Number(amount) || 0;
    return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(isoString) {
    if (!isoString) return '—';
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch (e) {
        return isoString;
    }
}

function formatDateTime(isoString) {
    if (!isoString) return '—';
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        return isoString;
    }
}

function formatNumber(num) {
    const n = Number(num) || 0;
    return n.toLocaleString('en-IN');
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Stock Status Assessment
 * Consistent Rules across all pages:
 * - Out of Stock: stock == 0 (Red)
 * - Low Stock: stock > 0 && stock <= minStock (Orange/Amber)
 * - In Stock: stock > minStock (Green)
 */
function getStockStatus(stock, minStock) {
    const qty = Number(stock) || 0;
    const min = Number(minStock) || 0;

    if (qty === 0) {
        return {
            status: 'out_of_stock',
            label: 'Out of Stock',
            badgeClass: 'badge-danger',
            pillClass: 'status-out',
            color: '#dc2626',
            bgColor: '#fee2e2',
            icon: 'fa-circle-xmark'
        };
    } else if (qty <= min) {
        return {
            status: 'low_stock',
            label: 'Low Stock',
            badgeClass: 'badge-warning',
            pillClass: 'status-low',
            color: '#d97706',
            bgColor: '#fef3c7',
            icon: 'fa-triangle-exclamation'
        };
    } else {
        return {
            status: 'in_stock',
            label: 'In Stock',
            badgeClass: 'badge-success',
            pillClass: 'status-in',
            color: '#16a34a',
            bgColor: '#dcfce7',
            icon: 'fa-circle-check'
        };
    }
}

/**
 * Normalize and resolve asset image paths relative to the current html/ directory.
 * Works whether the image was stored as 'assets/...', '../assets/...', or an external URL.
 */
function formatImagePath(url) {
    if (!url) return '../assets/images/no-image.png';
    const trimmed = String(url).trim();
    if (!trimmed) return '../assets/images/no-image.png';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
        return trimmed;
    }
    if (trimmed.startsWith('../')) {
        return trimmed;
    }
    if (trimmed.startsWith('assets/')) {
        return '../' + trimmed;
    }
    if (trimmed.startsWith('/assets/')) {
        return '..' + trimmed;
    }
    return trimmed;
}

/**
 * Image Fallback Handler
 */
function handleImageError(img) {
    if (!img) return;
    img.onerror = null;
    img.src = '../assets/images/no-image.png';
}

/**
 * Header & Sidebar Initialization
 */
function initLayout() {
    // Topbar live date
    const dateEl = document.getElementById('current-date-display');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Populate Store Settings Branding
    const settings = getStoredSettings();
    document.querySelectorAll('.store-brand-name').forEach(el => {
        el.textContent = settings.storeName || 'Vishal Hypermarket';
    });
    document.querySelectorAll('.admin-display-name').forEach(el => {
        el.textContent = settings.adminName || 'Admin Manager';
    });

    // Mobile Sidebar Drawer
    const sidebar = document.getElementById('app-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('sidebar-close');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('sidebar-open');
            if (overlay) overlay.classList.toggle('show');
        });
    }

    if (overlay && sidebar) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('sidebar-open');
            overlay.classList.remove('show');
        });
    }

    if (closeBtn && sidebar) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('sidebar-open');
            if (overlay) overlay.classList.remove('show');
        });
    }

    // Highlight current active sidebar nav link
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'dashboard.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Notification dropdown setup
    initNotificationDropdown();

    // Universal Logout Button Listeners
    document.querySelectorAll('.action-logout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showConfirmModal({
                title: 'Confirm Logout',
                message: 'Are you sure you want to end your administrator session and return to the login screen?',
                confirmText: 'Logout',
                confirmType: 'danger',
                onConfirm: logout
            });
        });
    });
}

/**
 * Topbar Notification Bell & Dropdown
 */
function initNotificationDropdown() {
    const bellBtn = document.getElementById('notification-bell-btn');
    const dropdown = document.getElementById('notification-dropdown');
    const badge = document.getElementById('notification-badge');
    const list = document.getElementById('notification-list');

    if (!bellBtn || !dropdown) return;

    // Calculate low and out of stock items
    const products = getStoredProducts();
    const alerts = products.filter(p => p.stock <= p.minStock);

    if (badge) {
        if (alerts.length > 0) {
            badge.textContent = alerts.length;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    if (list) {
        if (alerts.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <i class="fa-solid fa-bell-slash"></i>
                    <p>All stock levels are optimal. No alerts right now.</p>
                </div>
            `;
        } else {
            list.innerHTML = alerts.slice(0, 6).map(p => {
                const status = getStockStatus(p.stock, p.minStock);
                return `
                    <div class="notification-item ${p.stock === 0 ? 'notif-danger' : 'notif-warning'}" onclick="window.location.href='inventory.html'">
                        <img src="${escapeHtml(formatImagePath(p.image))}" alt="${escapeHtml(p.name)}" class="notif-thumb" onerror="handleImageError(this)">
                        <div class="notif-info">
                            <div class="notif-name">${escapeHtml(p.name)}</div>
                            <div class="notif-meta">
                                <span class="badge ${status.badgeClass}">${status.label}</span>
                                <span class="notif-qty">Current: <strong>${p.stock}</strong> / Min: ${p.minStock}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
}

/**
 * Universal Confirmation Modal
 */
function showConfirmModal({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmType = 'primary', onConfirm }) {
    let modal = document.getElementById('app-confirm-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'app-confirm-modal';
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-dialog modal-sm">
                <div class="modal-header">
                    <h3 class="modal-title" id="confirm-modal-title"></h3>
                    <button class="modal-close" id="confirm-modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body" id="confirm-modal-body"></div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="confirm-modal-cancel">Cancel</button>
                    <button class="btn" id="confirm-modal-btn">Confirm</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    document.getElementById('confirm-modal-title').textContent = title || 'Confirm Action';
    document.getElementById('confirm-modal-body').innerHTML = typeof message === 'string' ? `<p>${escapeHtml(message)}</p>` : message;
    
    const confirmBtn = document.getElementById('confirm-modal-btn');
    confirmBtn.textContent = confirmText;
    confirmBtn.className = `btn btn-${confirmType}`;

    const cancelBtn = document.getElementById('confirm-modal-cancel');
    cancelBtn.textContent = cancelText;

    const closeModal = () => {
        modal.classList.remove('show');
    };

    document.getElementById('confirm-modal-close').onclick = closeModal;
    cancelBtn.onclick = closeModal;
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    confirmBtn.onclick = () => {
        closeModal();
        if (typeof onConfirm === 'function') onConfirm();
    };

    modal.classList.add('show');
}

/**
 * Product Image Zoom / Lightbox Preview Modal
 */
function openImagePreview(imageUrl, productName) {
    let previewModal = document.getElementById('image-lightbox-modal');
    if (!previewModal) {
        previewModal = document.createElement('div');
        previewModal.id = 'image-lightbox-modal';
        previewModal.className = 'modal-backdrop lightbox-backdrop';
        previewModal.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" id="lightbox-close" aria-label="Close">&times;</button>
                <div class="lightbox-img-wrapper">
                    <img id="lightbox-img" src="" alt="Product Preview" onerror="handleImageError(this)">
                </div>
                <div class="lightbox-caption" id="lightbox-caption"></div>
            </div>
        `;
        document.body.appendChild(previewModal);

        previewModal.querySelector('#lightbox-close').addEventListener('click', () => {
            previewModal.classList.remove('show');
        });
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) previewModal.classList.remove('show');
        });
    }

    const img = previewModal.querySelector('#lightbox-img');
    const cap = previewModal.querySelector('#lightbox-caption');
    img.src = formatImagePath(imageUrl);
    cap.textContent = productName || 'Product Photograph Preview';
    previewModal.classList.add('show');
}

// Global initialization on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Only init layout if not on login page
    if (!document.body.classList.contains('auth-page')) {
        checkAuth(false);
        initLayout();
    }
});
