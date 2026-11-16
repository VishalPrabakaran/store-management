/**
 * Vishal Hypermarket & Store Management System
 * Dashboard Logic, Statistics Calculation, Chart.js Visuals, and Quick Actions
 */

let stockDistributionChart = null;

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    initQuickAddProductModal();
    initQuickStockModal();
});

/**
 * Load and render all dashboard statistics, charts, and product sections
 */
function loadDashboardData() {
    const products = getStoredProducts();
    const activities = getStoredActivities();

    renderDashboardStats(products);
    renderStockDistributionChart(products);
    renderCategorySummary(products);
    renderStockAlerts(products);
    renderRecentProducts(products);
    renderRecentActivity(activities);
}

/**
 * Render the 6 Dynamic Statistic Cards
 */
function renderDashboardStats(products) {
    const totalProducts = products.length;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValue = 0;
    const categoriesSet = new Set();

    products.forEach(p => {
        const stock = Number(p.stock) || 0;
        const minStock = Number(p.minStock) || 0;
        const cost = Number(p.costPrice) || 0;

        totalStockUnits += stock;
        totalInventoryValue += (cost * stock);

        if (p.category) {
            categoriesSet.add(p.category.trim());
        }

        if (stock === 0) {
            outOfStockCount++;
        } else if (stock <= minStock) {
            lowStockCount++;
        }
    });

    const statTotalProducts = document.getElementById('stat-total-products');
    const statTotalStock = document.getElementById('stat-total-stock');
    const statLowStock = document.getElementById('stat-low-stock');
    const statOutOfStock = document.getElementById('stat-out-of-stock');
    const statInventoryValue = document.getElementById('stat-inventory-value');
    const statCategories = document.getElementById('stat-categories');

    if (statTotalProducts) statTotalProducts.textContent = formatNumber(totalProducts);
    if (statTotalStock) statTotalStock.textContent = formatNumber(totalStockUnits);
    if (statLowStock) statLowStock.textContent = formatNumber(lowStockCount);
    if (statOutOfStock) statOutOfStock.textContent = formatNumber(outOfStockCount);
    if (statInventoryValue) statInventoryValue.textContent = formatCurrency(totalInventoryValue);
    if (statCategories) statCategories.textContent = formatNumber(categoriesSet.size);

    // Update low stock badge on header alert if present
    const topLowBadge = document.getElementById('dash-top-low-badge');
    if (topLowBadge) {
        topLowBadge.textContent = `${lowStockCount + outOfStockCount} critical items`;
    }
}

/**
 * Render Stock Distribution Chart (Chart.js)
 */
function renderStockDistributionChart(products) {
    const canvas = document.getElementById('stockDistributionChart');
    if (!canvas) return;

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach(p => {
        const stock = Number(p.stock) || 0;
        const minStock = Number(p.minStock) || 0;
        if (stock === 0) outOfStock++;
        else if (stock <= minStock) lowStock++;
        else inStock++;
    });

    if (stockDistributionChart) {
        stockDistributionChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    stockDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['In Stock', 'Low Stock', 'Out of Stock'],
            datasets: [{
                data: [inStock, lowStock, outOfStock],
                backgroundColor: [
                    '#16a34a', // Green
                    '#d97706', // Orange / Amber
                    '#dc2626'  // Red
                ],
                hoverBackgroundColor: [
                    '#15803d',
                    '#b45309',
                    '#b91c1c'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 14,
                        padding: 16,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 13,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const val = context.parsed;
                            const total = inStock + lowStock + outOfStock;
                            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                            return ` ${context.label}: ${val} products (${pct}%)`;
                        }
                    }
                }
            },
            cutout: '68%'
        }
    });

    // Update legend summary labels
    const elIn = document.getElementById('chart-count-instock');
    const elLow = document.getElementById('chart-count-lowstock');
    const elOut = document.getElementById('chart-count-outofstock');
    if (elIn) elIn.textContent = `${inStock} items`;
    if (elLow) elLow.textContent = `${lowStock} items`;
    if (elOut) elOut.textContent = `${outOfStock} items`;
}

/**
 * Render Product Category Summary Badges / Cards
 */
function renderCategorySummary(products) {
    const container = document.getElementById('category-summary-container');
    if (!container) return;

    const catMap = {};
    products.forEach(p => {
        const cat = p.category ? p.category.trim() : 'Uncategorized';
        if (!catMap[cat]) {
            catMap[cat] = { count: 0, stock: 0, value: 0 };
        }
        catMap[cat].count++;
        catMap[cat].stock += (Number(p.stock) || 0);
        catMap[cat].value += ((Number(p.costPrice) || 0) * (Number(p.stock) || 0));
    });

    const categoryList = Object.keys(catMap).map(name => ({
        name,
        ...catMap[name]
    })).sort((a, b) => b.stock - a.stock);

    if (categoryList.length === 0) {
        container.innerHTML = '<div class="empty-state-sm">No categories available</div>';
        return;
    }

    container.innerHTML = categoryList.map(cat => `
        <div class="category-summary-card" onclick="window.location.href='products.html?category=${encodeURIComponent(cat.name)}'">
            <div class="cat-card-header">
                <span class="cat-name">${escapeHtml(cat.name)}</span>
                <span class="cat-pill">${cat.count} ${cat.count === 1 ? 'item' : 'items'}</span>
            </div>
            <div class="cat-card-body">
                <div class="cat-stat">
                    <span class="cat-label">Total Units:</span>
                    <strong class="cat-val">${formatNumber(cat.stock)}</strong>
                </div>
                <div class="cat-stat">
                    <span class="cat-label">Inventory Value:</span>
                    <strong class="cat-val">${formatCurrency(cat.value)}</strong>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Render Stock Alerts: Low Stock & Out of Stock Sections
 */
function renderStockAlerts(products) {
    const lowContainer = document.getElementById('low-stock-alert-list');
    const outContainer = document.getElementById('out-of-stock-alert-list');

    const lowItems = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= Number(p.minStock));
    const outItems = products.filter(p => Number(p.stock) === 0);

    // Render Low Stock
    if (lowContainer) {
        if (lowItems.length === 0) {
            lowContainer.innerHTML = `
                <div class="alert-empty-box">
                    <i class="fa-solid fa-circle-check text-success"></i>
                    <span>No low-stock alerts. All products exceed their minimum threshold!</span>
                </div>
            `;
        } else {
            lowContainer.innerHTML = lowItems.map(p => `
                <div class="alert-product-card">
                    <div class="alert-product-media" onclick="openImagePreview('${escapeHtml(formatImagePath(p.image))}', '${escapeHtml(p.name)}')">
                        <img src="${escapeHtml(formatImagePath(p.image))}" alt="${escapeHtml(p.name)}" class="alert-product-img" onerror="handleImageError(this)">
                    </div>
                    <div class="alert-product-info">
                        <div class="alert-product-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
                        <div class="alert-product-meta">
                            <span class="meta-tag"><i class="fa-solid fa-barcode"></i> ${escapeHtml(p.sku)}</span>
                            <span class="meta-tag"><i class="fa-solid fa-folder"></i> ${escapeHtml(p.category)}</span>
                        </div>
                        <div class="stock-progress-wrap">
                            <div class="stock-progress-label">
                                <span>Stock: <strong>${p.stock}</strong> units</span>
                                <span class="text-warning">Threshold: ${p.minStock}</span>
                            </div>
                            <div class="stock-progress-bar">
                                <div class="stock-progress-fill fill-warning" style="width: ${Math.min(100, Math.round((p.stock / p.minStock) * 100))}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="alert-product-action">
                        <button class="btn btn-sm btn-outline-warning" onclick="openStockModal(${p.id})">
                            <i class="fa-solid fa-plus-minus"></i> Adjust Stock
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    // Render Out of Stock
    if (outContainer) {
        if (outItems.length === 0) {
            outContainer.innerHTML = `
                <div class="alert-empty-box">
                    <i class="fa-solid fa-circle-check text-success"></i>
                    <span>No out-of-stock items. Inventory is fully stocked!</span>
                </div>
            `;
        } else {
            outContainer.innerHTML = outItems.map(p => `
                <div class="alert-product-card out-of-stock-card">
                    <div class="alert-product-media" onclick="openImagePreview('${escapeHtml(formatImagePath(p.image))}', '${escapeHtml(p.name)}')">
                        <img src="${escapeHtml(formatImagePath(p.image))}" alt="${escapeHtml(p.name)}" class="alert-product-img" onerror="handleImageError(this)">
                    </div>
                    <div class="alert-product-info">
                        <div class="alert-product-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
                        <div class="alert-product-meta">
                            <span class="meta-tag"><i class="fa-solid fa-barcode"></i> ${escapeHtml(p.sku)}</span>
                            <span class="badge badge-danger"><i class="fa-solid fa-circle-xmark"></i> 0 Units Left</span>
                        </div>
                        <p class="alert-danger-notice">Customers cannot purchase this item. Immediate replenishment required.</p>
                    </div>
                    <div class="alert-product-action">
                        <button class="btn btn-sm btn-danger" onclick="openStockModal(${p.id})">
                            <i class="fa-solid fa-boxes-stacked"></i> Restock Now
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
}

/**
 * Render Recently Added Products with Photographs
 */
function renderRecentProducts(products) {
    const container = document.getElementById('recent-products-list');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state-sm">No products added yet.</div>';
        return;
    }

    // Sort by createdAt or ID descending (latest first)
    const sorted = [...products].sort((a, b) => {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return db - da;
    }).slice(0, 5);

    container.innerHTML = sorted.map(p => {
        const status = getStockStatus(p.stock, p.minStock);
        return `
            <div class="recent-product-item">
                <div class="recent-product-img-box" onclick="openImagePreview('${escapeHtml(formatImagePath(p.image))}', '${escapeHtml(p.name)}')">
                    <img src="${escapeHtml(formatImagePath(p.image))}" alt="${escapeHtml(p.name)}" class="recent-product-img" onerror="handleImageError(this)">
                </div>
                <div class="recent-product-details">
                    <div class="recent-product-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
                    <div class="recent-product-meta">
                        <span class="recent-cat">${escapeHtml(p.category)}</span>
                        <span class="recent-dot">•</span>
                        <span class="recent-sku">${escapeHtml(p.sku)}</span>
                        <span class="recent-dot">•</span>
                        <span class="recent-date">${formatDate(p.createdAt)}</span>
                    </div>
                </div>
                <div class="recent-product-pricing">
                    <div class="recent-price">${formatCurrency(p.sellingPrice)}</div>
                    <div class="recent-cost">Cost: ${formatCurrency(p.costPrice)}</div>
                </div>
                <div class="recent-product-stock">
                    <span class="badge ${status.badgeClass}">${status.label} (${p.stock})</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render Recent Inventory Activity Log
 */
function renderRecentActivity(activities) {
    const container = document.getElementById('recent-activity-list');
    if (!container) return;

    if (!activities || activities.length === 0) {
        container.innerHTML = '<div class="empty-state-sm">No recent inventory activity recorded.</div>';
        return;
    }

    const sorted = [...activities].sort((a, b) => {
        const da = new Date(a.timestamp || 0).getTime();
        const db = new Date(b.timestamp || 0).getTime();
        return db - da;
    }).slice(0, 5);

    container.innerHTML = sorted.map(act => {
        const isAdd = act.type === 'add' || act.change > 0;
        const changeStr = isAdd ? `+${Math.abs(act.change)}` : `-${Math.abs(act.change)}`;
        const badgeClass = isAdd ? 'badge-success' : 'badge-warning';
        const iconClass = isAdd ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';

        return `
            <div class="activity-timeline-item">
                <div class="activity-thumb-box">
                    <img src="${escapeHtml(formatImagePath(act.productImage))}" alt="${escapeHtml(act.productName)}" class="activity-thumb" onerror="handleImageError(this)">
                </div>
                <div class="activity-content">
                    <div class="activity-header-row">
                        <span class="activity-product">${escapeHtml(act.productName)}</span>
                        <span class="badge ${badgeClass}"><i class="fa-solid ${iconClass}"></i> ${changeStr} units</span>
                    </div>
                    <div class="activity-details">
                        <span class="activity-reason"><i class="fa-regular fa-comment-dots"></i> ${escapeHtml(act.reason || 'Manual Adjustment')}</span>
                    </div>
                    <div class="activity-footer">
                        <span class="activity-stock-flow">Stock: ${act.previousStock} &rarr; <strong>${act.newStock}</strong></span>
                        <span class="activity-time"><i class="fa-regular fa-clock"></i> ${formatDateTime(act.timestamp)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Quick Stock Adjustment Modal directly on Dashboard
 */
function initQuickStockModal() {
    const modal = document.getElementById('quick-stock-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('quick-stock-close');
    const cancelBtn = document.getElementById('quick-stock-cancel');
    const form = document.getElementById('quick-stock-form');
    const typeRadios = document.querySelectorAll('input[name="quickStockType"]');
    const qtyInput = document.getElementById('quick-stock-qty');

    const closeModal = () => modal.classList.remove('show');
    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    // Real-time stock calculation preview
    function updatePreview() {
        const current = Number(modal.dataset.currentStock) || 0;
        const qty = parseInt(qtyInput.value, 10) || 0;
        let selectedType = 'add';
        typeRadios.forEach(r => { if (r.checked) selectedType = r.value; });

        let updated = selectedType === 'add' ? current + qty : current - qty;
        const previewEl = document.getElementById('quick-stock-preview');
        const warningEl = document.getElementById('quick-stock-error');

        if (warningEl) warningEl.style.display = 'none';

        if (updated < 0) {
            if (warningEl) {
                warningEl.textContent = `Stock cannot become negative! Max reduction is ${current}.`;
                warningEl.style.display = 'block';
            }
            if (previewEl) previewEl.textContent = 'Invalid Quantity';
        } else {
            if (previewEl) previewEl.textContent = `${current} ${selectedType === 'add' ? '+' : '-'} ${qty} = ${updated} units`;
        }
    }

    if (qtyInput) qtyInput.addEventListener('input', updatePreview);
    typeRadios.forEach(r => r.addEventListener('change', updatePreview));

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const productId = Number(modal.dataset.productId);
            const currentStock = Number(modal.dataset.currentStock) || 0;
            const qty = parseInt(qtyInput.value, 10);
            let selectedType = 'add';
            typeRadios.forEach(r => { if (r.checked) selectedType = r.value; });
            const reason = document.getElementById('quick-stock-reason')?.value.trim() || 'Dashboard Adjustment';

            if (!qty || qty <= 0) {
                showToast('Please enter a valid positive adjustment quantity.', 'error');
                return;
            }

            const changeAmount = selectedType === 'add' ? qty : -qty;
            const newStock = currentStock + changeAmount;

            if (newStock < 0) {
                showToast(`Cannot reduce stock below zero. Current stock is ${currentStock}.`, 'error');
                return;
            }

            // Update in products LocalStorage
            const products = getStoredProducts();
            const idx = products.findIndex(p => p.id === productId);
            if (idx === -1) {
                showToast('Product not found.', 'error');
                return;
            }

            const prod = products[idx];
            prod.stock = newStock;
            prod.lastUpdated = new Date().toISOString();
            products[idx] = prod;
            saveStoredProducts(products);

            // Record in activities LocalStorage
            const activities = getStoredActivities();
            const newActivity = {
                id: Date.now(),
                productId: prod.id,
                productName: prod.name,
                productImage: prod.image,
                previousStock: currentStock,
                change: changeAmount,
                newStock: newStock,
                type: selectedType,
                reason: reason,
                timestamp: new Date().toISOString()
            };
            activities.unshift(newActivity);
            saveStoredActivities(activities);

            closeModal();
            showToast(`Stock updated successfully for "${prod.name}"! New Stock: ${newStock}`, 'success');

            // Refresh Dashboard data
            loadDashboardData();
            initNotificationDropdown();
        });
    }
}

function openStockModal(productId) {
    const products = getStoredProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const modal = document.getElementById('quick-stock-modal');
    if (!modal) {
        // Fallback navigate to inventory
        window.location.href = `inventory.html?product=${productId}`;
        return;
    }

    modal.dataset.productId = prod.id;
    modal.dataset.currentStock = prod.stock;

    document.getElementById('quick-stock-product-name').textContent = prod.name;
    document.getElementById('quick-stock-sku').textContent = prod.sku;
    document.getElementById('quick-stock-current').textContent = `${prod.stock} units`;
    const imgEl = document.getElementById('quick-stock-img');
    if (imgEl) {
        imgEl.src = formatImagePath(prod.image);
        imgEl.alt = prod.name;
    }

    const qtyInput = document.getElementById('quick-stock-qty');
    if (qtyInput) qtyInput.value = '10';

    const addRadio = document.querySelector('input[name="quickStockType"][value="add"]');
    if (addRadio) addRadio.checked = true;

    const reasonSelect = document.getElementById('quick-stock-reason');
    if (reasonSelect) reasonSelect.value = 'Vendor Delivery / Restock';

    const warningEl = document.getElementById('quick-stock-error');
    if (warningEl) warningEl.style.display = 'none';

    const previewEl = document.getElementById('quick-stock-preview');
    if (previewEl) previewEl.textContent = `${prod.stock} + 10 = ${prod.stock + 10} units`;

    modal.classList.add('show');
    if (qtyInput) qtyInput.focus();
}

/**
 * Quick Add Product Modal directly from Dashboard
 */
function initQuickAddProductModal() {
    const modal = document.getElementById('add-product-modal');
    const openBtn = document.getElementById('btn-dash-add-product');
    if (!modal || !openBtn) return;

    const closeBtn = document.getElementById('add-product-close');
    const cancelBtn = document.getElementById('add-product-cancel');
    const form = document.getElementById('add-product-form');
    const imgInput = document.getElementById('new-product-image');
    const imgPreview = document.getElementById('new-product-preview-img');

    const closeModal = () => modal.classList.remove('show');
    openBtn.onclick = () => {
        form.reset();
        if (imgPreview) imgPreview.src = '../assets/images/no-image.png';
        modal.classList.add('show');
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    // Live image preview
    if (imgInput && imgPreview) {
        imgInput.addEventListener('input', () => {
            const url = imgInput.value.trim();
            imgPreview.src = formatImagePath(url);
        });
        imgPreview.onerror = () => {
            imgPreview.src = '../assets/images/no-image.png';
        };
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('new-product-name').value.trim();
            const sku = document.getElementById('new-product-sku').value.trim().toUpperCase();
            const category = document.getElementById('new-product-category').value.trim();
            const brand = document.getElementById('new-product-brand').value.trim();
            const costPrice = parseFloat(document.getElementById('new-product-cost').value);
            const sellingPrice = parseFloat(document.getElementById('new-product-price').value);
            const stock = parseInt(document.getElementById('new-product-stock').value, 10);
            const minStock = parseInt(document.getElementById('new-product-min-stock').value, 10);
            const image = formatImagePath(imgInput.value.trim());

            // Validation
            if (!name || !sku || !category || !brand) {
                showToast('Please fill in all required product fields.', 'error');
                return;
            }

            if (isNaN(costPrice) || costPrice < 0 || isNaN(sellingPrice) || sellingPrice < 0) {
                showToast('Prices must be valid non-negative numbers.', 'error');
                return;
            }

            if (isNaN(stock) || stock < 0 || isNaN(minStock) || minStock < 0) {
                showToast('Stock quantities must be valid non-negative integers.', 'error');
                return;
            }

            const products = getStoredProducts();

            // Duplicate SKU Check
            if (products.some(p => p.sku.toUpperCase() === sku)) {
                showToast(`SKU "${sku}" is already assigned to another product. SKU must be unique.`, 'error');
                return;
            }

            const newId = products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 1;
            const newProduct = {
                id: newId,
                name,
                sku,
                category,
                brand,
                costPrice,
                sellingPrice,
                stock,
                minStock,
                image,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            products.unshift(newProduct);
            saveStoredProducts(products);

            // Record initial stock entry activity
            if (stock > 0) {
                const activities = getStoredActivities();
                activities.unshift({
                    id: Date.now(),
                    productId: newId,
                    productName: name,
                    productImage: image,
                    previousStock: 0,
                    change: stock,
                    newStock: stock,
                    type: 'add',
                    reason: 'Initial Product Registration & Stock Inward',
                    timestamp: new Date().toISOString()
                });
                saveStoredActivities(activities);
            }

            closeModal();
            showToast(`Product "${name}" added successfully!`, 'success');

            loadDashboardData();
            initNotificationDropdown();
        });
    }
}
