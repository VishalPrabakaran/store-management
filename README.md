# Vishal Hypermarket & Store Management System

A modern, responsive, frontend-only **Store Management & Inventory System** designed for a retail shop, supermarket, or departmental store. Built exclusively with **HTML5, CSS3, and Vanilla JavaScript**, with **Chart.js** for visual analytics and browser **LocalStorage** for data persistence.

---

## 📌 Project Overview

**Vishal Hypermarket & Store Management** helps store administrators and shop owners manage inventory, track stock levels in real time, identify low-stock and out-of-stock items, adjust inventory with negative-stock prevention, and analyze stock health through interactive charts.

This project is tailored as an **advanced, polished frontend college project**, demonstrating professional UI/UX standards, real product photographs, and robust client-side business logic without requiring any backend server or database setup.

---

## 🚀 Key Features

### 1. Admin Authentication (`index.html`)
- Clean, retail-branded login portal.
- Demonstration credentials:
  - **Username:** `admin` (or `admin@vishal.com`)
  - **Password:** `admin123`
- **1-Click Auto-Fill Demo Button** for quick evaluation during viva/presentations.
- Show/Hide password toggle, input validation, and animated error alerts.
- Session protection via `sessionStorage` preventing unauthenticated access to dashboard pages.

### 2. Main Dashboard (`dashboard.html`)
- **6 Dynamic Statistic Cards** calculated directly from LocalStorage:
  1. *Total Products* (unique catalog items)
  2. *Total Stock Units* (sum of all product quantities)
  3. *Low-Stock Products* (positive stock at or below minimum threshold)
  4. *Out-of-Stock Products* (products with 0 stock)
  5. *Total Inventory Cost Value* (sum of $\text{Cost Price} \times \text{Available Stock}$)
  6. *Product Categories* (number of distinct retail departments)
- **Stock Distribution Chart:** Doughnut chart powered by Chart.js showing in-stock, low-stock, and out-of-stock proportions.
- **Department & Category Summary:** Interactive department cards with unit counts and valuations.
- **Low-Stock Alerts Section:** Displays products needing replenishment with real photographs, stock meters, and instant "Adjust Stock" buttons.
- **Critical Out-of-Stock Alerts:** Displays zero-stock items with immediate "Restock Now" modal triggers.
- **Recently Added Products:** Displays latest catalog entries with photos, prices, and timestamps.
- **Recent Inventory Activity:** Recent audit log of manual stock updates with inward/outward badges.
- **Quick Action Modals:** Add products or adjust stock directly from the dashboard.

### 3. Product Catalog Management (`products.html`)
- Complete product table displaying:
  - Product photograph thumbnail (click to open high-resolution lightbox preview)
  - Product name and brand
  - Unique SKU code
  - Category / department
  - Cost price (₹) and Selling price (₹)
  - Available stock quantity and minimum safety stock level
  - Real-time stock status badge (Green: In Stock, Orange: Low Stock, Red: Out of Stock)
  - Date added
  - Action buttons: Edit and Delete
- **Live Search & Multi-Filter Toolbar:**
  - Real-time search across product name, SKU, brand, and category
  - Dynamic category dropdown filter
  - Stock status filter (In Stock, Low Stock, Out of Stock)
  - Sorting: Name (A–Z / Z–A), Price (Low–High / High–Low), Stock (Low–High / High–Low), Date (Newest / Oldest)
  - Clear filters button
- **Add Product Modal:**
  - Full validation (required fields, positive numbers, non-negative stock)
  - **Duplicate SKU prevention** (rejects duplicate codes)
  - Live image URL input with real-time thumbnail preview box
  - Quick image preset chips for sample products
- **Edit Product Modal:**
  - Prefilled with selected product information
  - Unique SKU check (excluding self)
  - Instant LocalStorage synchronization
- **Delete Product Dialog:**
  - Confirmation modal displaying product thumbnail and details before deletion.

### 4. Inventory Management & Stock Adjustments (`inventory.html`)
- Dedicated monitoring interface with top metric counter pills.
- **Stock Adjustment Modal:**
  - Add Stock (+) or Deduct Stock (-) toggle
  - Quantity input with real-time formula calculator
  - **Negative Stock Prevention:** Prohibits deductions that would reduce stock below zero.
  - Reason logging (Vendor Delivery, Audit Correction, Damaged/Expired Goods, Customer Return, Store Transfer, or Custom Reason).
- **Traceable Activity History Table:**
  - Records every inward/outward adjustment with previous stock, adjustment amount, new stock, reason, and exact date/time timestamp.

### 5. Insights & Analytics (`insights.html`)
- **4 Chart.js Visualizations:**
  1. *Chart 1: Stock Units by Category* (Bar Chart)
  2. *Chart 2: Product Quantity Comparison* (Horizontal Bar Chart with color-coded stock health)
  3. *Chart 3: Inventory Value by Category* (Doughnut Chart of $\text{Cost Price} \times \text{Stock}$ in ₹)
  4. *Chart 4: Stock Status Distribution* (Pie Chart)
- **Key Metric Observation Cards:**
  - Department with highest stock volume
  - Department with highest inventory capital valuation
  - Low-stock and out-of-stock counts
- **Priority Reorder Spotlight:**
  - Visual cards with actual product photographs, current stock, safety threshold, and calculated suggested reorder quantities.
- **Print / Export Summary Button** with print-optimized stylesheet.

### 6. Store Settings & Demo Reset (`settings.html`)
- Configurable Store Name, Address, Contact Number, and Administrator Display Name.
- Live Store Profile summary card.
- **Reset Demo Data Feature:** Restores initial 12 sample products and activity history with one click.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Structure | **HTML5** (Semantic markup, accessible forms, tables, modals) |
| Styling | **CSS3** (CSS Custom Variables, Flexbox, CSS Grid, Responsive Breakpoints, Custom Scrollbars, Animations) |
| Logic | **Vanilla JavaScript (ES6+)** (No frameworks, clean modular functions) |
| Data Storage | **Browser LocalStorage** (`vishal_products`, `vishal_inventory_activity`, `vishal_store_settings`) |
| Authentication | **Browser SessionStorage** (`vishal_auth_session`) |
| Charts | **Chart.js v4** (via CDN) |
| Icons | **Font Awesome 6** (via CDN) |
| Typography | **Inter** font family (via Google Fonts) |
| Photographs | 12 high-quality grocery product images in `assets/images/` |

---

## 📁 Project Directory Structure

```text
vishal-hypermarket/
│
├── index.html              # Root redirect entry point
├── README.md               # Project documentation & run guide
│
├── html/                   # HTML Pages
│   ├── index.html          # Admin login page
│   ├── dashboard.html      # Main overview dashboard
│   ├── products.html       # Full product catalog & CRUD operations
│   ├── inventory.html      # Stock monitoring, adjustments, and activity history
│   ├── insights.html       # 4 Chart.js analytics charts & reorder spotlight
│   └── settings.html       # Store profile configuration & demo data reset
│
├── css/
│   ├── style.css           # Master design system, variables, tables, modals, toasts
│   ├── auth.css            # Login page card and form styles
│   ├── dashboard.css       # Stat cards, alert cards, and dashboard layout
│   ├── products.css        # Product table toolbar, filters, image preview
│   ├── inventory.css       # Stock adjustment modal, calculator preview, history
│   └── insights.css        # Chart grid, metric cards, print styles
│
├── js/
│   ├── data.js             # 12 sample products, initial activities, LocalStorage helpers
│   ├── common.js           # Auth guard, toast notifications, formatters, lightbox
│   ├── auth.js             # Login verification and credential handling
│   ├── dashboard.js        # Stat calculations, dashboard chart, alerts, quick modals
│   ├── products.js         # Product table rendering, search, filters, CRUD modals
│   ├── inventory.js        # Stock calculation, negative prevention, audit trail
│   ├── insights.js         # 4 Chart.js chart initializations and summary metrics
│   └── settings.js         # Store settings persistence and demo reset handler
│
└── assets/
    ├── logo.svg            # Crisp vector brand logo
    ├── logo.png            # Raster brand logo
    └── images/
        ├── aavin-milk.jpg      # Aavin milk packet photo
        ├── rice-bag.jpg        # Rice bag photo
        ├── sugar-packet.jpg    # Sugar packet photo
        ├── biscuits.jpg        # Marie Gold biscuits photo
        ├── cooking-oil.jpg     # Sunflower cooking oil bottle photo
        ├── tea-powder.jpg      # Red Label tea powder photo
        ├── soap.jpg            # Lifebuoy soap bar photo
        ├── shampoo.jpg         # Head & Shoulders shampoo photo
        ├── wheat-flour.jpg     # Whole wheat flour bag photo
        ├── salt.jpg            # Tata Salt packet photo
        ├── toothpaste.jpg      # Colgate toothpaste photo
        ├── detergent.jpg       # Surf Excel detergent powder photo
        └── no-image.png        # Clean fallback image placeholder
```

---

## 🛒 Sample Demonstration Products

The application initializes with 12 realistic grocery and supermarket items across 7 departments:

1. **Aavin Milk (Toned 500ml)** — Dairy — ₹22 / ₹25 — Stock: 40 (In Stock)
2. **Ponni Boiled Rice (5kg Bag)** — Grains — ₹290 / ₹340 — Stock: 25 (In Stock)
3. **Madhur Pure Refined Sugar (1kg)** — Grocery — ₹42 / ₹48 — Stock: 8 (Low Stock)
4. **Britannia Marie Gold Biscuits (250g)** — Snacks — ₹28 / ₹35 — Stock: 55 (In Stock)
5. **Fortune Sunlite Sunflower Oil (1L)** — Grocery — ₹135 / ₹155 — Stock: 4 (Low Stock)
6. **Brooke Bond Red Label Tea (500g)** — Beverages — ₹210 / ₹240 — Stock: 18 (In Stock)
7. **Lifebuoy Total Germ Protection Soap (125g)** — Personal Care — ₹32 / ₹40 — Stock: 0 (Out of Stock)
8. **Head & Shoulders Anti-Dandruff Shampoo (180ml)** — Personal Care — ₹145 / ₹170 — Stock: 14 (In Stock)
9. **Aashirvaad Superior MP Whole Wheat Atta (5kg)** — Grains — ₹215 / ₹250 — Stock: 30 (In Stock)
10. **Tata Salt Vacuum Evaporated Iodized (1kg)** — Grocery — ₹22 / ₹28 — Stock: 3 (Low Stock)
11. **Colgate Strong Teeth Dental Cream (200g)** — Personal Care — ₹88 / ₹105 — Stock: 0 (Out of Stock)
12. **Surf Excel Quick Wash Detergent Powder (1kg)** — Household — ₹130 / ₹150 — Stock: 22 (In Stock)

---

## 💻 How to Run the Project in VS Code

### Option 1: Using VS Code Live Server Extension (Recommended)

1. Open **Visual Studio Code**.
2. Click **File > Open Folder...** and select the `pro` project folder.
3. Install the **Live Server** extension (by *Ritwick Dey*) from the VS Code Extensions marketplace (`Ctrl + Shift + X`).
4. Right-click on **`index.html`** in the file explorer.
5. Select **"Open with Live Server"** (or click **"Go Live"** on the bottom blue status bar).
6. Your default web browser will automatically open:
   ```text
   http://127.0.0.1:5500/index.html
   ```
7. Click the **"Auto Fill"** button on the login card to enter credentials (`admin` / `admin123`) and click **"Sign In to Dashboard"**.

### Option 2: Using Node.js `npx serve`

If you have Node.js installed, run:
```bash
npx serve -l 5500
```
Then open `http://localhost:5500` in any browser.

### Option 3: Using Python Built-in HTTP Server

Run in terminal:
```bash
python -m http.server 5500
```
Then open `http://localhost:5500/index.html` in your browser.

---

## 📋 Evaluation Checklist for College Project Presentation

- [x] **Pure Frontend:** No Node.js backend, React, or SQL database required.
- [x] **Authentication:** Demo session storage protection on all pages with working logout.
- [x] **Real Photographs:** All 12 products feature authentic product photographs with fallback handling and lightbox zoom.
- [x] **6 Dashboard Stat Cards:** Accurately calculated from LocalStorage with no fabricated sales figures.
- [x] **Product CRUD:** Add, Edit, Delete (with confirmation dialog), duplicate SKU prevention, positive pricing validation.
- [x] **Multi-Criteria Search & Filter:** Instant search by name/SKU/brand, category filter, stock status filter, sorting by 8 criteria.
- [x] **Inventory Adjustments:** Add/Remove stock with real-time calculator, negative stock prevention, and adjustment reason tracking.
- [x] **Audit Trail History:** Persistent activity log with timestamps and change badges.
- [x] **4 Interactive Chart.js Visualizations:** Stock by Category, Product Comparison, Valuation by Category, Status Distribution.
- [x] **Reorder Spotlight:** Visual reorder recommendations with suggested quantities.
- [x] **Settings & Demo Reset:** Easy 1-click restore to fresh demo state.
- [x] **Fully Responsive:** Tested across mobile, tablet, laptop, and desktop viewports.

---

## 📄 License
This project is prepared as an academic frontend college demonstration project. Free to use for learning, evaluation, and demonstration purposes.
