/**
 * Vishal Hypermarket & Store Management System
 * Insights & Analytics: Chart.js Visualizations and Inventory Health Metrics
 */

let chartStockByCategory = null;
let chartProductComparison = null;
let chartValueByCategory = null;
let chartStatusDistribution = null;

document.addEventListener('DOMContentLoaded', () => {
    loadInsightsData();

    // Print / Export report listener
    const printBtn = document.getElementById('btn-print-insights');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
});

function loadInsightsData() {
    const products = getStoredProducts();

    if (!products || products.length === 0) {
        showEmptyInsightsState();
        return;
    }

    renderInsightMetricCards(products);
    renderChartStockByCategory(products);
    renderChartProductComparison(products);
    renderChartValueByCategory(products);
    renderChartStatusDistribution(products);
    renderPriorityReorderSpotlight(products);
}

function showEmptyInsightsState() {
    const grid = document.querySelector('.insights-charts-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="empty-state-card full-width">
                <i class="fa-solid fa-chart-pie fa-3x text-muted"></i>
                <h3>No Inventory Data Available</h3>
                <p>Add products to your catalog to generate real-time stock charts and inventory analytics.</p>
                <a href="products.html" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add Products</a>
            </div>
        `;
    }
}

/**
 * Render Key Metric Observations
 */
function renderInsightMetricCards(products) {
    // 1. Group by category
    const catStockMap = {};
    const catValueMap = {};

    products.forEach(p => {
        const cat = p.category ? p.category.trim() : 'General';
        const stock = Number(p.stock) || 0;
        const cost = Number(p.costPrice) || 0;

        catStockMap[cat] = (catStockMap[cat] || 0) + stock;
        catValueMap[cat] = (catValueMap[cat] || 0) + (cost * stock);
    });

    // Find highest stock category
    let topStockCat = '—';
    let maxStock = -1;
    for (const [c, s] of Object.entries(catStockMap)) {
        if (s > maxStock) {
            maxStock = s;
            topStockCat = c;
        }
    }

    // Find highest value category
    let topValCat = '—';
    let maxVal = -1;
    for (const [c, v] of Object.entries(catValueMap)) {
        if (v > maxVal) {
            maxVal = v;
            topValCat = c;
        }
    }

    // Low & out of stock products
    const lowItems = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= Number(p.minStock));
    const outItems = products.filter(p => Number(p.stock) === 0);

    const elTopCat = document.getElementById('metric-highest-stock-cat');
    const elTopCatVal = document.getElementById('metric-highest-stock-qty');
    const elTopValCat = document.getElementById('metric-highest-value-cat');
    const elTopValAmt = document.getElementById('metric-highest-value-amt');
    const elLowCount = document.getElementById('metric-low-stock-count');
    const elOutCount = document.getElementById('metric-out-stock-count');

    if (elTopCat) elTopCat.textContent = topStockCat;
    if (elTopCatVal) elTopCatVal.textContent = `${formatNumber(maxStock)} units`;
    if (elTopValCat) elTopValCat.textContent = topValCat;
    if (elTopValAmt) elTopValAmt.textContent = formatCurrency(maxVal);
    if (elLowCount) elLowCount.textContent = `${lowItems.length} Products`;
    if (elOutCount) elOutCount.textContent = `${outItems.length} Products`;
}

/**
 * Chart 1: Stock by Category (Bar Chart)
 */
function renderChartStockByCategory(products) {
    const canvas = document.getElementById('chartStockByCategory');
    if (!canvas) return;

    const catMap = {};
    products.forEach(p => {
        const cat = p.category ? p.category.trim() : 'General';
        catMap[cat] = (catMap[cat] || 0) + (Number(p.stock) || 0);
    });

    const labels = Object.keys(catMap);
    const data = labels.map(k => catMap[k]);

    const colors = [
        '#2563eb', '#3b82f6', '#0284c7', '#0ea5e9',
        '#059669', '#10b981', '#f59e0b', '#8b5cf6'
    ];

    if (chartStockByCategory) chartStockByCategory.destroy();

    const ctx = canvas.getContext('2d');
    chartStockByCategory = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Stock Units',
                data,
                backgroundColor: colors.slice(0, labels.length),
                borderRadius: 6,
                maxBarThickness: 45
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.parsed.y} stock units`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, font: { family: "'Inter', sans-serif" } },
                    grid: { color: '#f1f5f9' }
                },
                x: {
                    ticks: { font: { family: "'Inter', sans-serif" } },
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Chart 2: Product Quantity Comparison (Horizontal Bar Chart)
 * Color coded: Green for in-stock, Orange for low-stock, Red for out-of-stock
 */
function renderChartProductComparison(products) {
    const canvas = document.getElementById('chartProductComparison');
    if (!canvas) return;

    // Sort by stock ascending so low-stock items appear on top for immediate awareness
    const sorted = [...products].sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0));

    const labels = sorted.map(p => p.name.length > 22 ? p.name.substring(0, 20) + '...' : p.name);
    const data = sorted.map(p => Number(p.stock) || 0);
    const barColors = sorted.map(p => {
        const s = Number(p.stock) || 0;
        const m = Number(p.minStock) || 0;
        if (s === 0) return '#dc2626'; // Red
        if (s <= m) return '#d97706'; // Orange
        return '#16a34a'; // Green
    });

    if (chartProductComparison) chartProductComparison.destroy();

    const ctx = canvas.getContext('2d');
    chartProductComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Current Quantity',
                data,
                backgroundColor: barColors,
                borderRadius: 4,
                maxBarThickness: 22
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` Stock: ${ctx.parsed.x} units`
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { precision: 0, font: { family: "'Inter', sans-serif" } },
                    grid: { color: '#f1f5f9' }
                },
                y: {
                    ticks: { font: { family: "'Inter', sans-serif", size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

/**
 * Chart 3: Inventory Value by Category (Doughnut / Pie Chart)
 * Inventory Value = Cost Price * Stock Quantity
 */
function renderChartValueByCategory(products) {
    const canvas = document.getElementById('chartValueByCategory');
    if (!canvas) return;

    const catMap = {};
    products.forEach(p => {
        const cat = p.category ? p.category.trim() : 'General';
        const cost = Number(p.costPrice) || 0;
        const stock = Number(p.stock) || 0;
        catMap[cat] = (catMap[cat] || 0) + (cost * stock);
    });

    const labels = Object.keys(catMap);
    const data = labels.map(k => catMap[k]);

    const palette = [
        '#0284c7', '#2563eb', '#7c3aed', '#db2777',
        '#ea580c', '#16a34a', '#0d9488', '#4b5563'
    ];

    if (chartValueByCategory) chartValueByCategory.destroy();

    const ctx = canvas.getContext('2d');
    chartValueByCategory = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: palette.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 12,
                        font: { family: "'Inter', sans-serif", size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}`
                    }
                }
            },
            cutout: '55%'
        }
    });
}

/**
 * Chart 4: Stock Status Distribution (Doughnut Chart)
 */
function renderChartStatusDistribution(products) {
    const canvas = document.getElementById('chartStatusDistribution');
    if (!canvas) return;

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach(p => {
        const s = Number(p.stock) || 0;
        const m = Number(p.minStock) || 0;
        if (s === 0) outOfStock++;
        else if (s <= m) lowStock++;
        else inStock++;
    });

    if (chartStatusDistribution) chartStatusDistribution.destroy();

    const ctx = canvas.getContext('2d');
    chartStatusDistribution = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['In Stock (> Min)', 'Low Stock (≤ Min)', 'Out of Stock (0)'],
            datasets: [{
                data: [inStock, lowStock, outOfStock],
                backgroundColor: ['#16a34a', '#d97706', '#dc2626'],
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
                        boxWidth: 12,
                        padding: 14,
                        font: { family: "'Inter', sans-serif", size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${ctx.parsed} products`
                    }
                }
            }
        }
    });
}

/**
 * Priority Reorder Spotlight with Real Product Photographs
 */
function renderPriorityReorderSpotlight(products) {
    const container = document.getElementById('reorder-spotlight-list');
    if (!container) return;

    // Filter items with stock <= minStock and sort ascending by stock
    const critical = products
        .filter(p => Number(p.stock) <= Number(p.minStock))
        .sort((a, b) => Number(a.stock) - Number(b.stock))
        .slice(0, 4);

    if (critical.length === 0) {
        container.innerHTML = `
            <div class="spotlight-healthy-card">
                <i class="fa-solid fa-shield-heart fa-2x text-success"></i>
                <div>
                    <h4 class="font-bold text-success mb-1">Excellent Stock Health</h4>
                    <p class="text-sm text-muted">No items require immediate reordering. All products exceed required safety stock thresholds.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = critical.map(p => {
        const isZero = p.stock === 0;
        const status = getStockStatus(p.stock, p.minStock);
        const suggestedReorder = Math.max(15, (p.minStock * 2) - p.stock);

        return `
            <div class="reorder-card ${isZero ? 'reorder-zero' : 'reorder-low'}">
                <div class="reorder-card-media" onclick="openImagePreview('${escapeHtml(formatImagePath(p.image))}', '${escapeHtml(p.name)}')">
                    <img src="${escapeHtml(formatImagePath(p.image))}" alt="${escapeHtml(p.name)}" class="reorder-img" onerror="handleImageError(this)">
                </div>
                <div class="reorder-card-body">
                    <div class="reorder-title" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
                    <div class="reorder-meta">
                        <span class="badge ${status.badgeClass}">${status.label}</span>
                        <span class="text-xs text-muted">SKU: ${escapeHtml(p.sku)}</span>
                    </div>
                    <div class="reorder-metrics-grid">
                        <div class="reorder-metric">
                            <span class="text-xs text-muted">Current</span>
                            <strong class="${isZero ? 'text-danger' : 'text-warning'}">${p.stock} units</strong>
                        </div>
                        <div class="reorder-metric">
                            <span class="text-xs text-muted">Threshold</span>
                            <strong>${p.minStock} units</strong>
                        </div>
                        <div class="reorder-metric">
                            <span class="text-xs text-muted">Suggested Order</span>
                            <strong class="text-primary">+${suggestedReorder} units</strong>
                        </div>
                    </div>
                </div>
                <div class="reorder-card-action">
                    <a href="inventory.html?product=${p.id}" class="btn btn-sm ${isZero ? 'btn-danger' : 'btn-outline-warning'}">
                        <i class="fa-solid fa-cart-flatbed"></i> Restock
                    </a>
                </div>
            </div>
        `;
    }).join('');
}
