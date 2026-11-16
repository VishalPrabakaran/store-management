/**
 * Vishal Hypermarket & Store Management System
 * Product Management: CRUD, Filtering, Searching, Sorting, and Image Previews
 */

let currentProductsList = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    initProductPage();
    initAddProductModal();
    initEditProductModal();
    initFilters();
});

function initProductPage() {
    loadAndRenderProducts();
    populateCategoryFilter();

    // Check if URL has ?category= query param from dashboard click
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    if (catParam) {
        const catSelect = document.getElementById('filter-category');
        if (catSelect) {
            catSelect.value = catParam;
            filterProducts();
        }
    }
}

function loadAndRenderProducts() {
    currentProductsList = getStoredProducts();
    filterProducts();
}

/**
 * Filter, Search, and Sort Pipeline
 */
function filterProducts() {
    const searchVal = document.getElementById('search-input')?.value.trim().toLowerCase() || '';
    const categoryVal = document.getElementById('filter-category')?.value || '';
    const statusVal = document.getElementById('filter-status')?.value || '';
    const sortVal = document.getElementById('sort-by')?.value || 'newest';

    let filtered = [...currentProductsList];

    // 1. Search Query
    if (searchVal) {
        filtered = filtered.filter(p => 
            (p.name && p.name.toLowerCase().includes(searchVal)) ||
            (p.sku && p.sku.toLowerCase().includes(searchVal)) ||
            (p.brand && p.brand.toLowerCase().includes(searchVal)) ||
            (p.category && p.category.toLowerCase().includes(searchVal))
        );
    }

    // 2. Category Filter
    if (categoryVal) {
        filtered = filtered.filter(p => p.category && p.category.toLowerCase() === categoryVal.toLowerCase());
    }

    // 3. Stock Status Filter
    if (statusVal) {
        filtered = filtered.filter(p => {
            const statusObj = getStockStatus(p.stock, p.minStock);
            return statusObj.status === statusVal;
        });
    }

    // 4. Sorting
    filtered.sort((a, b) => {
        switch (sortVal) {
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'price_asc':
                return (Number(a.sellingPrice) || 0) - (Number(b.sellingPrice) || 0);
            case 'price_desc':
                return (Number(b.sellingPrice) || 0) - (Number(a.sellingPrice) || 0);
            case 'stock_asc':
                return (Number(a.stock) || 0) - (Number(b.stock) || 0);
            case 'stock_desc':
                return (Number(b.stock) || 0) - (Number(a.stock) || 0);
            case 'oldest':
                return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            case 'newest':
            default:
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
    });

    renderProductTable(filtered);
    updateResultCount(filtered.length, currentProductsList.length);
}

/**
 * Render HTML Table with Product rows
 */
function renderProductTable(products) {
    const tbody = document.getElementById('products-table-body');
    const emptyState = document.getElementById('products-empty-state');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    tbody.innerHTML = products.map((p, index) => {
        const status = getStockStatus(p.stock, p.minStock);
        return `
            <tr>
                <td class="text-center font-mono text-muted">${index + 1}</td>
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
                <td>
                    <span class="sku-badge font-mono">${escapeHtml(p.sku)}</span>
                </td>
                <td>
                    <span class="cat-pill-table">${escapeHtml(p.category)}</span>
                </td>
                <td class="text-right text-muted">${formatCurrency(p.costPrice)}</td>
                <td class="text-right font-semibold text-dark">${formatCurrency(p.sellingPrice)}</td>
                <td class="text-center font-bold ${p.stock === 0 ? 'text-danger' : (p.stock <= p.minStock ? 'text-warning' : 'text-success')}">
                    ${formatNumber(p.stock)}
                </td>
                <td class="text-center text-muted">${formatNumber(p.minStock)}</td>
                <td class="text-center">
                    <span class="badge ${status.badgeClass}">
                        <i class="fa-solid ${status.icon}"></i> ${status.label}
                    </span>
                </td>
                <td class="text-muted text-sm">${formatDate(p.createdAt)}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-action btn-action-edit" title="Edit Product" onclick="openEditModal(${p.id})">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn-action btn-action-delete" title="Delete Product" onclick="confirmDeleteProduct(${p.id})">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateResultCount(filteredCount, totalCount) {
    const counterEl = document.getElementById('products-count-badge');
    if (counterEl) {
        counterEl.textContent = `Showing ${filteredCount} of ${totalCount} products`;
    }
}

/**
 * Dynamic Category Filter Dropdown
 */
function populateCategoryFilter() {
    const select = document.getElementById('filter-category');
    if (!select) return;

    const currentVal = select.value;
    const categories = Array.from(new Set(currentProductsList.map(p => p.category).filter(Boolean))).sort();

    select.innerHTML = '<option value="">All Categories</option>' +
        categories.map(cat => `<option value="${escapeHtml(cat)}"${cat === currentVal ? ' selected' : ''}>${escapeHtml(cat)}</option>`).join('');
}

/**
 * Filter Events Binding
 */
function initFilters() {
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('filter-category');
    const statusSelect = document.getElementById('filter-status');
    const sortSelect = document.getElementById('sort-by');
    const clearBtn = document.getElementById('btn-clear-filters');

    if (searchInput) searchInput.addEventListener('input', filterProducts);
    if (categorySelect) categorySelect.addEventListener('change', filterProducts);
    if (statusSelect) statusSelect.addEventListener('change', filterProducts);
    if (sortSelect) sortSelect.addEventListener('change', filterProducts);

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (categorySelect) categorySelect.value = '';
            if (statusSelect) statusSelect.value = '';
            if (sortSelect) sortSelect.value = 'newest';
            filterProducts();
            showToast('Filters cleared', 'info', 1500);
        });
    }
}

/**
 * Add Product Modal Logic
 */
function initAddProductModal() {
    const modal = document.getElementById('add-product-modal');
    const openBtn = document.getElementById('btn-open-add-product');
    if (!modal) return;

    const closeBtn = document.getElementById('add-product-close');
    const cancelBtn = document.getElementById('add-product-cancel');
    const form = document.getElementById('add-product-form');
    const imgInput = document.getElementById('add-product-image');
    const imgPreview = document.getElementById('add-product-preview-img');

    const closeModal = () => modal.classList.remove('show');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            form.reset();
            if (imgPreview) imgPreview.src = '../assets/images/no-image.png';
            modal.classList.add('show');
            document.getElementById('add-product-name')?.focus();
        });
    }

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    // Live preview
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

            const name = document.getElementById('add-product-name').value.trim();
            const sku = document.getElementById('add-product-sku').value.trim().toUpperCase();
            const category = document.getElementById('add-product-category').value.trim();
            const brand = document.getElementById('add-product-brand').value.trim();
            const costPrice = parseFloat(document.getElementById('add-product-cost').value);
            const sellingPrice = parseFloat(document.getElementById('add-product-price').value);
            const stock = parseInt(document.getElementById('add-product-stock').value, 10);
            const minStock = parseInt(document.getElementById('add-product-min-stock').value, 10);
            const image = formatImagePath(imgInput.value.trim());

            // Validation
            if (!name || !sku || !category || !brand) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            if (isNaN(costPrice) || costPrice < 0) {
                showToast('Cost price must be a non-negative number.', 'error');
                return;
            }

            if (isNaN(sellingPrice) || sellingPrice < 0) {
                showToast('Selling price must be a non-negative number.', 'error');
                return;
            }

            if (isNaN(stock) || stock < 0) {
                showToast('Initial stock quantity cannot be negative.', 'error');
                return;
            }

            if (isNaN(minStock) || minStock < 0) {
                showToast('Minimum stock level cannot be negative.', 'error');
                return;
            }

            const products = getStoredProducts();

            // Unique SKU verification
            if (products.some(p => p.sku.toUpperCase() === sku)) {
                showToast(`SKU "${sku}" is already assigned to an existing product. Please use a unique SKU.`, 'error');
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

            // Record initial stock inventory activity
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
            showToast(`Product "${name}" created successfully!`, 'success');

            loadAndRenderProducts();
            populateCategoryFilter();
            initNotificationDropdown();
        });
    }
}

/**
 * Edit Product Modal Logic
 */
function initEditProductModal() {
    const modal = document.getElementById('edit-product-modal');
    if (!modal) return;

    const closeBtn = document.getElementById('edit-product-close');
    const cancelBtn = document.getElementById('edit-product-cancel');
    const form = document.getElementById('edit-product-form');
    const imgInput = document.getElementById('edit-product-image');
    const imgPreview = document.getElementById('edit-product-preview-img');

    const closeModal = () => modal.classList.remove('show');

    if (closeBtn) closeBtn.onclick = closeModal;
    if (cancelBtn) cancelBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };

    // Live preview
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
            if (!editingProductId) return;

            const name = document.getElementById('edit-product-name').value.trim();
            const sku = document.getElementById('edit-product-sku').value.trim().toUpperCase();
            const category = document.getElementById('edit-product-category').value.trim();
            const brand = document.getElementById('edit-product-brand').value.trim();
            const costPrice = parseFloat(document.getElementById('edit-product-cost').value);
            const sellingPrice = parseFloat(document.getElementById('edit-product-price').value);
            const stock = parseInt(document.getElementById('edit-product-stock').value, 10);
            const minStock = parseInt(document.getElementById('edit-product-min-stock').value, 10);
            const image = formatImagePath(imgInput.value.trim());

            // Validation
            if (!name || !sku || !category || !brand) {
                showToast('Please fill in all required fields.', 'error');
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

            // Duplicate SKU Check (excluding self)
            if (products.some(p => p.id !== editingProductId && p.sku.toUpperCase() === sku)) {
                showToast(`SKU "${sku}" is already in use by another product.`, 'error');
                return;
            }

            const idx = products.findIndex(p => p.id === editingProductId);
            if (idx === -1) {
                showToast('Product not found.', 'error');
                return;
            }

            const existing = products[idx];
            const oldStock = existing.stock;

            products[idx] = {
                ...existing,
                name,
                sku,
                category,
                brand,
                costPrice,
                sellingPrice,
                stock,
                minStock,
                image,
                lastUpdated: new Date().toISOString()
            };

            saveStoredProducts(products);

            // Record activity if stock changed in edit
            if (oldStock !== stock) {
                const diff = stock - oldStock;
                const activities = getStoredActivities();
                activities.unshift({
                    id: Date.now(),
                    productId: editingProductId,
                    productName: name,
                    productImage: image,
                    previousStock: oldStock,
                    change: diff,
                    newStock: stock,
                    type: diff > 0 ? 'add' : 'remove',
                    reason: 'Product Details Edit / Manual Stock Correction',
                    timestamp: new Date().toISOString()
                });
                saveStoredActivities(activities);
            }

            closeModal();
            showToast(`Product "${name}" updated successfully!`, 'success');

            loadAndRenderProducts();
            populateCategoryFilter();
            initNotificationDropdown();
        });
    }
}

/**
 * Open Edit Product Modal and Prefill values
 */
function openEditModal(productId) {
    const products = getStoredProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    editingProductId = prod.id;
    const modal = document.getElementById('edit-product-modal');
    if (!modal) return;

    document.getElementById('edit-product-name').value = prod.name || '';
    document.getElementById('edit-product-sku').value = prod.sku || '';
    document.getElementById('edit-product-category').value = prod.category || '';
    document.getElementById('edit-product-brand').value = prod.brand || '';
    document.getElementById('edit-product-cost').value = prod.costPrice;
    document.getElementById('edit-product-price').value = prod.sellingPrice;
    document.getElementById('edit-product-stock').value = prod.stock;
    document.getElementById('edit-product-min-stock').value = prod.minStock;
    document.getElementById('edit-product-image').value = prod.image || '';

    const preview = document.getElementById('edit-product-preview-img');
    if (preview) {
        preview.src = formatImagePath(prod.image);
    }

    modal.classList.add('show');
}

/**
 * Confirm and Delete Product
 */
function confirmDeleteProduct(productId) {
    const products = getStoredProducts();
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const messageHtml = `
        <div class="delete-confirm-box">
            <div class="delete-confirm-thumb">
                <img src="${escapeHtml(formatImagePath(prod.image))}" alt="${escapeHtml(prod.name)}" onerror="handleImageError(this)">
            </div>
            <div class="delete-confirm-info">
                <div class="font-bold text-dark">${escapeHtml(prod.name)}</div>
                <div class="text-sm text-muted">SKU: ${escapeHtml(prod.sku)} | Category: ${escapeHtml(prod.category)}</div>
                <div class="delete-confirm-warning">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    This action will permanently delete this product and remove its ${prod.stock} stock units from inventory.
                </div>
            </div>
        </div>
    `;

    showConfirmModal({
        title: 'Delete Product Confirmation',
        message: messageHtml,
        confirmText: 'Delete Product',
        confirmType: 'danger',
        onConfirm: () => {
            const updated = products.filter(p => p.id !== productId);
            saveStoredProducts(updated);

            // Record deletion in activity log
            const activities = getStoredActivities();
            activities.unshift({
                id: Date.now(),
                productId: prod.id,
                productName: prod.name,
                productImage: prod.image,
                previousStock: prod.stock,
                change: -prod.stock,
                newStock: 0,
                type: 'remove',
                reason: 'Product Deletion from Catalog',
                timestamp: new Date().toISOString()
            });
            saveStoredActivities(activities);

            showToast(`Product "${prod.name}" has been removed.`, 'info');
            loadAndRenderProducts();
            populateCategoryFilter();
            initNotificationDropdown();
        }
    });
}
