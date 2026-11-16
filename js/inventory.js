/**
 * Vishal Hypermarket & Store Management System
 * Inventory Management: Stock Monitoring, Stock Adjustments, Negative Stock Prevention, and Audit Trail
 */

let inventoryProducts = [];
let activeAdjustmentProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    initInventoryPage();
    initStockAdjustmentModal();
    initInventoryFilters();

    // Check if URL has ?product= query param from dashboard click
    const urlParams = new URLSearchParams(window.location.search);
    const prodParam = urlParams.get('product');
    if (prodParam) {
        setTimeout(() => {
            openStockAdjustmentModal(Number(prodParam));
        }, 200);
    }
});

function initInventoryPage() {
    loadAndRenderInventory();
    renderActivityHistory();
    populateInventoryCategories();
}

function loadAndRenderInventory() {
    inventoryProducts = getStoredProducts();
    filterInventory();
}

/**
 * Filter & Search Inventory Table
 */
function filterInventory() {
    const searchVal = document.getElementById('inventory-search')?.value.trim().toLowerCase() || '';
    const statusVal = document.getElementById('inventory-status-filter')?.value || '';
    const categoryVal = document.getElementById('inventory-category-filter')?.value || '';

    let filtered = [...inventoryProducts];

    if (searchVal) {
        filtered = filtered.filter(p =>
            (p.name && p.name.toLowerCase().includes(searchVal)) ||
            (p.sku && p.sku.toLowerCase().includes(searchVal)) ||
            (p.category && p.category.toLowerCase().includes(searchVal))
        );
    }

    if (statusVal) {
        filtered = filtered.filter(p => {
            const status = getStockStatus(p.stock, p.minStock);
            return status.status === statusVal;
        });
    }

    if (categoryVal) {
        filtered = filtered.filter(p => p.category && p.category.toLowerCase() === categoryVal.toLowerCase());
    }

    renderInventoryTable(filtered);
    updateInventorySummaryCounters(inventoryProducts);
}

/**
 * Render Inventory Table
 */
function renderInventoryTable(products) {
    const tbody = document.getElementById('inventory-table-body');
    const emptyState = document.getElementById('inventory-empty-state');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = products.map((p, idx) => {
        const status = getStockStatus(p.stock, p.minStock);
        const isOutOfStock = p.stock === 0;
        const isLow = p.stock > 0 && p.stock <= p.minStock;

        return `
            <tr class="${isOutOfStock ? 'row-danger-tint' : (isLow ? 'row-warning-tint' : '')}">
                <td class="text-center font-mono text-muted">${idx + 1}</td>
                <td>
                    <div class="product-cell-thumb" title="Click to view image" onclick="openImagePreview('${escapeHtml(formatImagePath(p.image))}', '${escapeHtml(p.name)}')">
                        <img src="${escapeHtml(formatImagePath(p.image))}" alt="${escapeHtml(p.name)}" class="product-img-thumb" onerror="handleImageError(this)">
                        <span class="thumb-zoom-icon"><i class="fa-solid fa-magnifying-glass-plus"></i></span>
                    </div>
                </td>
                <td>
                    <div class="product-cell-title">
                        <span class="product-title-text" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</span>
                        <span class="product-sub-brand text-muted">${escapeHtml(p.brand || '—')}</span>
                    </div>
                </td>
                <td><span class="sku-badge font-mono">${escapeHtml(p.sku)}</span></td>
                <td><span class="cat-pill-table">${escapeHtml(p.category)}</span></td>
                <td class="text-center">
                    <span class="inventory-stock-number ${isOutOfStock ? 'text-danger' : (isLow ? 'text-warning' : 'text-success')}">
                        ${formatNumber(p.stock)}
                    </span>
                    <span class="text-muted text-xs d-block">units</span>
                </td>
                <td class="text-center">
                    <span class="font-medium text-muted">${formatNumber(p.minStock)}</span>
                    <span class="text-muted text-xs d-block">threshold</span>
                </td>
                <td class="text-center">
                    <span class="badge ${status.badgeClass}">
                        <i class="fa-solid ${status.icon}"></i> ${status.label}
                    </span>
                </td>
                <td class="text-muted text-sm">${formatDateTime(p.lastUpdated || p.createdAt)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-primary-soft btn-stock-adjust" onclick="openStockAdjustmentModal(${p.id})">
                        <i class="fa-solid fa-sliders"></i> Update Stock
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Summary Counter Pills at top of Inventory Page
 */
function updateInventorySummaryCounters(products) {
    let totalStock = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach(p => {
        const s = Number(p.stock) || 0;
        const m = Number(p.minStock) || 0;
        totalStock += s;
        if (s === 0) outOfStock++;
        else if (s <= m) lowStock++;
        else inStock++;
    });

    const elTotal = document.getElementById('inv-stat-total-stock');
    const elIn = document.getElementById('inv-stat-in-stock');
    const elLow = document.getElementById('inv-stat-low-stock');
    const elOut = document.getElementById('inv-stat-out-stock');

    if (elTotal) elTotal.textContent = formatNumber(totalStock);
    if (elIn) elIn.textContent = `${inStock} Items`;
    if (elLow) elLow.textContent = `${lowStock} Items`;
    if (elOut) elOut.textContent = `${outOfStock} Items`;
}

/**
 * Stock Adjustment Modal
 */
function initStockAdjustmentModal() {
    const modal = document.getElementById('stock-adjust-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('stock-adjust-close');
    const cancelBtn = document.getElementById('stock-adjust-cancel');
    const form = document.getElementById('stock-adjust-form');
    const typeRadios = document.querySelectorAll('input[name="adjustType"]');
    const qtyInput = document.getElementById('adjust-quantity');

    const closeModal = () => modal.classList.remove('show');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    // Real-time stock calculator & negative prevention
    function recalcPreview() {
        const current = Number(modal.dataset.currentStock) || 0;
        const qty = parseInt(qtyInput.value, 10) || 0;
        let type = 'add';
        typeRadios.forEach(r => { if (r.checked) type = r.value; });

        const change = type === 'add' ? qty : -qty;
        const projected = current + change;

        const previewValEl = document.getElementById('adjust-preview-result');
        const calcFormulaEl = document.getElementById('adjust-calc-formula');
        const warningEl = document.getElementById('adjust-error-alert');
        const submitBtn = document.getElementById('btn-save-stock-adjust');

        if (warningEl) warningEl.style.display = 'none';
        if (submitBtn) submitBtn.disabled = false;

        if (projected < 0) {
            if (warningEl) {
                warningEl.textContent = `Negative stock prohibited! You cannot remove ${qty} units because only ${current} are in stock.`;
                warningEl.style.display = 'block';
            }
            if (previewValEl) previewValEl.textContent = 'Invalid (Below 0)';
            if (calcFormulaEl) calcFormulaEl.textContent = `${current} - ${qty} = ${projected} (Negative)`;
            if (submitBtn) submitBtn.disabled = true;
        } else {
            if (previewValEl) previewValEl.textContent = `${projected} units`;
            if (calcFormulaEl) {
                calcFormulaEl.textContent = `${current} ${type === 'add' ? '+' : '-'} ${qty} = ${projected} units`;
            }
        }
    }

    if (qtyInput) qtyInput.addEventListener('input', recalcPreview);
    typeRadios.forEach(r => r.addEventListener('change', recalcPreview));

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!activeAdjustmentProductId) return;

            const current = Number(modal.dataset.currentStock) || 0;
            const qty = parseInt(qtyInput.value, 10);
            let type = 'add';
            typeRadios.forEach(r => { if (r.checked) type = r.value; });

            const reasonSelect = document.getElementById('adjust-reason');
            const customReasonInput = document.getElementById('adjust-custom-reason');
            let reason = reasonSelect ? reasonSelect.value : '';
            if (reason === 'Other' && customReasonInput) {
                reason = customReasonInput.value.trim() || 'Custom Adjustment';
            }

            if (isNaN(qty) || qty <= 0) {
                showToast('Please enter an adjustment quantity greater than 0.', 'error');
                return;
            }

            const change = type === 'add' ? qty : -qty;
            const newStock = current + change;

            if (newStock < 0) {
                showToast(`Stock cannot become negative. Available stock is only ${current}.`, 'error');
                return;
            }

            // Save to products LocalStorage
            const products = getStoredProducts();
            const idx = products.findIndex(p => p.id === activeAdjustmentProductId);
            if (idx === -1) {
                showToast('Product not found.', 'error');
                return;
            }

            const prod = products[idx];
            prod.stock = newStock;
            prod.lastUpdated = new Date().toISOString();
            products[idx] = prod;
            saveStoredProducts(products);

            // Save to activity history LocalStorage
            const activities = getStoredActivities();
            const record = {
                id: Date.now(),
                productId: prod.id,
                productName: prod.name,
                productImage: prod.image,
                previousStock: current,
                change: change,
                newStock: newStock,
                type: type,
                reason: reason || (type === 'add' ? 'Stock Inward' : 'Stock Outward'),
                timestamp: new Date().toISOString()
            };
            activities.unshift(record);
            saveStoredActivities(activities);

            closeModal();
            showToast(`Updated stock for "${prod.name}": ${current} &rarr; ${newStock} units`, 'success');

            // Refresh UI
            loadAndRenderInventory();
            renderActivityHistory();
            initNotificationDropdown();
        });
    }

    // Toggle custom reason input visibility
    const reasonSelect = document.getElementById('adjust-reason');
    const customReasonWrap = document.getElementById('adjust-custom-reason-wrap');
    if (reasonSelect && customReasonWrap) {
        reasonSelect.addEventListener('change', () => {
            customReasonWrap.style.display = reasonSelect.value === 'Other' ? 'block' : 'none';
        });
    }
}

/**
 * Open Stock Adjustment Modal for a specific product
 */
function openStockAdjustmentModal(productId) {
    const products = getStoredProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    activeAdjustmentProductId = prod.id;
    const modal = document.getElementById('stock-adjust-modal');
    if (!modal) return;

    modal.dataset.currentStock = prod.stock;

    document.getElementById('adjust-product-name').textContent = prod.name;
    document.getElementById('adjust-product-sku').textContent = prod.sku;
    document.getElementById('adjust-product-category').textContent = prod.category;
    document.getElementById('adjust-current-stock-badge').textContent = `${prod.stock} units`;

    const img = document.getElementById('adjust-product-img');
    if (img) {
        img.src = formatImagePath(prod.image);
        img.alt = prod.name;
    }

    // Reset default form state
    const addRadio = document.querySelector('input[name="adjustType"][value="add"]');
    if (addRadio) addRadio.checked = true;

    const qtyInput = document.getElementById('adjust-quantity');
    if (qtyInput) qtyInput.value = '10';

    const reasonSelect = document.getElementById('adjust-reason');
    if (reasonSelect) reasonSelect.value = 'New Stock Delivery / Vendor Consignment';

    const customReasonWrap = document.getElementById('adjust-custom-reason-wrap');
    if (customReasonWrap) customReasonWrap.style.display = 'none';

    const customReasonInput = document.getElementById('adjust-custom-reason');
    if (customReasonInput) customReasonInput.value = '';

    const warningEl = document.getElementById('adjust-error-alert');
    if (warningEl) warningEl.style.display = 'none';

    const previewValEl = document.getElementById('adjust-preview-result');
    const calcFormulaEl = document.getElementById('adjust-calc-formula');
    if (previewValEl) previewValEl.textContent = `${prod.stock + 10} units`;
    if (calcFormulaEl) calcFormulaEl.textContent = `${prod.stock} + 10 = ${prod.stock + 10} units`;

    modal.classList.add('show');
    if (qtyInput) qtyInput.focus();
}

/**
 * Render Inventory Activity History Table
 */
function renderActivityHistory() {
    const tbody = document.getElementById('activity-table-body');
    const emptyState = document.getElementById('activity-empty-state');
    if (!tbody) return;

    const activities = getStoredActivities();

    if (!activities || activities.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = activities.slice(0, 20).map((act, index) => {
        const isAdd = act.type === 'add' || act.change > 0;
        const changeStr = isAdd ? `+${Math.abs(act.change)}` : `-${Math.abs(act.change)}`;
        const badgeClass = isAdd ? 'badge-success' : 'badge-warning';
        const iconClass = isAdd ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';

        return `
            <tr>
                <td class="text-center font-mono text-muted">${index + 1}</td>
                <td>
                    <div class="product-cell-thumb" title="Click to view image" onclick="openImagePreview('${escapeHtml(formatImagePath(act.productImage))}', '${escapeHtml(act.productName)}')">
                        <img src="${escapeHtml(formatImagePath(act.productImage))}" alt="${escapeHtml(act.productName)}" class="product-img-thumb" onerror="handleImageError(this)">
                        <span class="thumb-zoom-icon"><i class="fa-solid fa-magnifying-glass-plus"></i></span>
                    </div>
                </td>
                <td>
                    <span class="font-medium text-dark">${escapeHtml(act.productName)}</span>
                </td>
                <td class="text-center font-mono text-muted">${act.previousStock}</td>
                <td class="text-center">
                    <span class="badge ${badgeClass}">
                        <i class="fa-solid ${iconClass}"></i> ${changeStr}
                    </span>
                </td>
                <td class="text-center font-mono font-bold text-dark">${act.newStock}</td>
                <td>
                    <span class="badge ${isAdd ? 'badge-info' : 'badge-secondary'}">
                        ${isAdd ? 'Inward / Restock' : 'Outward / Adjustment'}
                    </span>
                </td>
                <td>
                    <span class="text-sm text-dark"><i class="fa-regular fa-comment-dots text-muted"></i> ${escapeHtml(act.reason || 'Manual Update')}</span>
                </td>
                <td class="text-muted text-sm">${formatDateTime(act.timestamp)}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Dynamic Categories for Inventory Filter
 */
function populateInventoryCategories() {
    const select = document.getElementById('inventory-category-filter');
    if (!select) return;

    const categories = Array.from(new Set(inventoryProducts.map(p => p.category).filter(Boolean))).sort();
    select.innerHTML = '<option value="">All Categories</option>' +
        categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function initInventoryFilters() {
    const search = document.getElementById('inventory-search');
    const status = document.getElementById('inventory-status-filter');
    const category = document.getElementById('inventory-category-filter');
    const clearBtn = document.getElementById('btn-clear-inv-filters');

    if (search) search.addEventListener('input', filterInventory);
    if (status) status.addEventListener('change', filterInventory);
    if (category) category.addEventListener('change', filterInventory);

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (search) search.value = '';
            if (status) status.value = '';
            if (category) category.value = '';
            filterInventory();
            showToast('Inventory filters cleared', 'info', 1500);
        });
    }
}
