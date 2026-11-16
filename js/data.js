/**
 * Vishal Hypermarket & Store Management System
 * Data Model & LocalStorage Initialization
 */

const STORAGE_KEYS = {
    PRODUCTS: 'vishal_products',
    ACTIVITY: 'vishal_inventory_activity',
    SETTINGS: 'vishal_store_settings',
    AUTH: 'vishal_auth_session'
};

// Default Store Configuration
const DEFAULT_SETTINGS = {
    storeName: 'Vishal Hypermarket & Store Management',
    storeAddress: 'No. 45, Gandhi Road, Anna Nagar, Chennai - 600040',
    contactNumber: '+91 98765 43210',
    adminName: 'Admin Manager',
    currencySymbol: '₹',
    defaultMinStock: 10,
    theme: 'light'
};

// 12 Realistic Initial Demonstration Products with real photographs
const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: 'Aavin Milk (Toned 500ml)',
        sku: 'DAI-001',
        category: 'Dairy',
        brand: 'Aavin',
        costPrice: 22.00,
        sellingPrice: 25.00,
        stock: 40,
        minStock: 10,
        image: '../assets/images/aavin-milk.jpg',
        createdAt: '2026-10-01T09:30:00.000Z',
        lastUpdated: '2026-10-15T10:15:00.000Z'
    },
    {
        id: 2,
        name: 'Ponni Boiled Rice (5kg Bag)',
        sku: 'GRN-002',
        category: 'Grains',
        brand: 'India Gate',
        costPrice: 290.00,
        sellingPrice: 340.00,
        stock: 25,
        minStock: 8,
        image: '../assets/images/rice-bag.jpg',
        createdAt: '2026-10-02T11:00:00.000Z',
        lastUpdated: '2026-10-14T14:20:00.000Z'
    },
    {
        id: 3,
        name: 'Madhur Pure Refined Sugar (1kg)',
        sku: 'GRO-003',
        category: 'Grocery',
        brand: 'Madhur',
        costPrice: 42.00,
        sellingPrice: 48.00,
        stock: 8,
        minStock: 10, // LOW STOCK
        image: '../assets/images/sugar-packet.jpg',
        createdAt: '2026-10-03T10:15:00.000Z',
        lastUpdated: '2026-10-16T16:45:00.000Z'
    },
    {
        id: 4,
        name: 'Britannia Marie Gold Biscuits (250g)',
        sku: 'SNK-004',
        category: 'Snacks',
        brand: 'Britannia',
        costPrice: 28.00,
        sellingPrice: 35.00,
        stock: 55,
        minStock: 15,
        image: '../assets/images/biscuits.jpg',
        createdAt: '2026-10-04T12:30:00.000Z',
        lastUpdated: '2026-10-15T11:00:00.000Z'
    },
    {
        id: 5,
        name: 'Fortune Sunlite Sunflower Oil (1L)',
        sku: 'GRO-005',
        category: 'Grocery',
        brand: 'Fortune',
        costPrice: 135.00,
        sellingPrice: 155.00,
        stock: 4,
        minStock: 12, // LOW STOCK
        image: '../assets/images/cooking-oil.jpg',
        createdAt: '2026-10-05T08:45:00.000Z',
        lastUpdated: '2026-10-17T09:10:00.000Z'
    },
    {
        id: 6,
        name: 'Brooke Bond Red Label Tea (500g)',
        sku: 'BEV-006',
        category: 'Beverages',
        brand: 'Brooke Bond',
        costPrice: 210.00,
        sellingPrice: 240.00,
        stock: 18,
        minStock: 6,
        image: '../assets/images/tea-powder.jpg',
        createdAt: '2026-10-06T14:00:00.000Z',
        lastUpdated: '2026-10-14T17:30:00.000Z'
    },
    {
        id: 7,
        name: 'Lifebuoy Total Germ Protection Soap (125g)',
        sku: 'PC-007',
        category: 'Personal Care',
        brand: 'Lifebuoy',
        costPrice: 32.00,
        sellingPrice: 40.00,
        stock: 0,
        minStock: 15, // OUT OF STOCK
        image: '../assets/images/soap.jpg',
        createdAt: '2026-10-07T09:00:00.000Z',
        lastUpdated: '2026-10-17T08:00:00.000Z'
    },
    {
        id: 8,
        name: 'Head & Shoulders Anti-Dandruff Shampoo (180ml)',
        sku: 'PC-008',
        category: 'Personal Care',
        brand: 'Head & Shoulders',
        costPrice: 145.00,
        sellingPrice: 170.00,
        stock: 14,
        minStock: 5,
        image: '../assets/images/shampoo.jpg',
        createdAt: '2026-10-08T15:20:00.000Z',
        lastUpdated: '2026-10-13T12:00:00.000Z'
    },
    {
        id: 9,
        name: 'Aashirvaad Superior MP Whole Wheat Atta (5kg)',
        sku: 'GRN-009',
        category: 'Grains',
        brand: 'Aashirvaad',
        costPrice: 215.00,
        sellingPrice: 250.00,
        stock: 30,
        minStock: 10,
        image: '../assets/images/wheat-flour.jpg',
        createdAt: '2026-10-09T10:00:00.000Z',
        lastUpdated: '2026-10-16T15:10:00.000Z'
    },
    {
        id: 10,
        name: 'Tata Salt Vacuum Evaporated Iodized (1kg)',
        sku: 'GRO-010',
        category: 'Grocery',
        brand: 'Tata Salt',
        costPrice: 22.00,
        sellingPrice: 28.00,
        stock: 3,
        minStock: 10, // LOW STOCK
        image: '../assets/images/salt.jpg',
        createdAt: '2026-10-10T11:45:00.000Z',
        lastUpdated: '2026-10-17T10:00:00.000Z'
    },
    {
        id: 11,
        name: 'Colgate Strong Teeth Dental Cream (200g)',
        sku: 'PC-011',
        category: 'Personal Care',
        brand: 'Colgate',
        costPrice: 88.00,
        sellingPrice: 105.00,
        stock: 0,
        minStock: 10, // OUT OF STOCK
        image: '../assets/images/toothpaste.jpg',
        createdAt: '2026-10-11T13:15:00.000Z',
        lastUpdated: '2026-10-17T07:30:00.000Z'
    },
    {
        id: 12,
        name: 'Surf Excel Quick Wash Detergent Powder (1kg)',
        sku: 'HSD-012',
        category: 'Household',
        brand: 'Surf Excel',
        costPrice: 130.00,
        sellingPrice: 150.00,
        stock: 22,
        minStock: 8,
        image: '../assets/images/detergent.jpg',
        createdAt: '2026-10-12T16:30:00.000Z',
        lastUpdated: '2026-10-15T14:40:00.000Z'
    }
];

// Initial Realistic Sample Inventory Activity Log
const INITIAL_ACTIVITIES = [
    {
        id: 1,
        productId: 5,
        productName: 'Fortune Sunlite Sunflower Oil (1L)',
        productImage: '../assets/images/cooking-oil.jpg',
        previousStock: 14,
        change: -10,
        newStock: 4,
        type: 'remove',
        reason: 'Store Sale & Dispatch to Shelf',
        timestamp: '2026-10-17T09:10:00.000Z'
    },
    {
        id: 2,
        productId: 7,
        productName: 'Lifebuoy Total Germ Protection Soap (125g)',
        productImage: '../assets/images/soap.jpg',
        previousStock: 5,
        change: -5,
        newStock: 0,
        type: 'remove',
        reason: 'Stock Depleted - High Weekend Demand',
        timestamp: '2026-10-17T08:00:00.000Z'
    },
    {
        id: 3,
        productId: 10,
        productName: 'Tata Salt Vacuum Evaporated Iodized (1kg)',
        productImage: '../assets/images/salt.jpg',
        previousStock: 8,
        change: -5,
        newStock: 3,
        type: 'remove',
        reason: 'Stock Audit Adjustment',
        timestamp: '2026-10-17T10:00:00.000Z'
    },
    {
        id: 4,
        productId: 1,
        productName: 'Aavin Milk (Toned 500ml)',
        productImage: '../assets/images/aavin-milk.jpg',
        previousStock: 20,
        change: 20,
        newStock: 40,
        type: 'add',
        reason: 'Morning Dairy Vendor Delivery',
        timestamp: '2026-10-15T10:15:00.000Z'
    },
    {
        id: 5,
        productId: 9,
        productName: 'Aashirvaad Superior MP Whole Wheat Atta (5kg)',
        productImage: '../assets/images/wheat-flour.jpg',
        previousStock: 15,
        change: 15,
        newStock: 30,
        type: 'add',
        reason: 'Weekly Bulk Consignment Received',
        timestamp: '2026-10-16T15:10:00.000Z'
    }
];

/**
 * Initialize data in LocalStorage if not present.
 * Does not overwrite existing user-edited data on page reload.
 * Migrates paths if previously stored under root.
 */
function initDataStore() {
    const storedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!storedProds) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    } else {
        try {
            const parsed = JSON.parse(storedProds);
            let updated = false;
            parsed.forEach(p => {
                if (p.image && typeof p.image === 'string' && p.image.startsWith('assets/')) {
                    p.image = '../' + p.image;
                    updated = true;
                }
            });
            if (updated) {
                localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(parsed));
            }
        } catch (e) {}
    }

    const storedActs = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    if (!storedActs) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITIES));
    } else {
        try {
            const parsed = JSON.parse(storedActs);
            let updated = false;
            parsed.forEach(a => {
                if (a.productImage && typeof a.productImage === 'string' && a.productImage.startsWith('assets/')) {
                    a.productImage = '../' + a.productImage;
                    updated = true;
                }
            });
            if (updated) {
                localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(parsed));
            }
        } catch (e) {}
    }

    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
}

/**
 * Reset data store to initial demonstration data
 */
function resetToDemoData() {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
}

/**
 * Helper Data Access Methods
 */
function getStoredProducts() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch (e) {
        console.error('Error reading products from LocalStorage', e);
        return INITIAL_PRODUCTS;
    }
}

function saveStoredProducts(products) {
    try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        return true;
    } catch (e) {
        console.error('Error saving products to LocalStorage', e);
        return false;
    }
}

function getStoredActivities() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
        return data ? JSON.parse(data) : INITIAL_ACTIVITIES;
    } catch (e) {
        console.error('Error reading activities from LocalStorage', e);
        return INITIAL_ACTIVITIES;
    }
}

function saveStoredActivities(activities) {
    try {
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activities));
        return true;
    } catch (e) {
        console.error('Error saving activities to LocalStorage', e);
        return false;
    }
}

function getStoredSettings() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
        console.error('Error reading settings from LocalStorage', e);
        return DEFAULT_SETTINGS;
    }
}

function saveStoredSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        return true;
    } catch (e) {
        console.error('Error saving settings to LocalStorage', e);
        return false;
    }
}

// Ensure store is ready immediately upon script loading
initDataStore();
