/**
 * Vishal Hypermarket & Store Management System
 * Settings Management & Demo Data Reset
 */

document.addEventListener('DOMContentLoaded', () => {
    initSettingsPage();
});

function initSettingsPage() {
    loadSettingsIntoForm();

    const form = document.getElementById('settings-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const storeName = document.getElementById('setting-store-name').value.trim();
            const storeAddress = document.getElementById('setting-store-address').value.trim();
            const contactNumber = document.getElementById('setting-store-phone').value.trim();
            const adminName = document.getElementById('setting-admin-name').value.trim();
            const currencySymbol = document.getElementById('setting-currency').value.trim() || '₹';
            const defaultMinStock = parseInt(document.getElementById('setting-default-min-stock').value, 10) || 10;
            const theme = document.getElementById('setting-theme')?.value || 'light';

            if (!storeName || !contactNumber || !adminName) {
                showToast('Please fill in the store name, contact number, and admin name.', 'error');
                return;
            }

            const updatedSettings = {
                storeName,
                storeAddress,
                contactNumber,
                adminName,
                currencySymbol,
                defaultMinStock,
                theme
            };

            saveStoredSettings(updatedSettings);

            // Update visible branding across page
            document.querySelectorAll('.store-brand-name').forEach(el => el.textContent = storeName);
            document.querySelectorAll('.admin-display-name').forEach(el => el.textContent = adminName);

            showToast('Store settings saved successfully!', 'success');
        });
    }

    // Reset Demo Data Button
    const resetBtn = document.getElementById('btn-reset-demo-data');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            showConfirmModal({
                title: 'Reset to Demonstration Data?',
                message: `
                    <div class="reset-confirm-content">
                        <i class="fa-solid fa-rotate-left fa-2x text-danger mb-2"></i>
                        <p>This will restore the original <strong>12 demonstration grocery products</strong>, reset all stock quantities, and restore initial inventory activity logs.</p>
                        <p class="text-sm text-danger mt-1">Any custom products or manual stock modifications you have added will be replaced with fresh demo data.</p>
                    </div>
                `,
                confirmText: 'Yes, Reset Demo Data',
                confirmType: 'danger',
                onConfirm: () => {
                    resetToDemoData();
                    loadSettingsIntoForm();
                    showToast('Application reset to initial demonstration state!', 'success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 800);
                }
            });
        });
    }
}

function loadSettingsIntoForm() {
    const s = getStoredSettings();

    const nameInput = document.getElementById('setting-store-name');
    const addrInput = document.getElementById('setting-store-address');
    const phoneInput = document.getElementById('setting-store-phone');
    const adminInput = document.getElementById('setting-admin-name');
    const currInput = document.getElementById('setting-currency');
    const minInput = document.getElementById('setting-default-min-stock');
    const themeInput = document.getElementById('setting-theme');

    if (nameInput) nameInput.value = s.storeName || '';
    if (addrInput) addrInput.value = s.storeAddress || '';
    if (phoneInput) phoneInput.value = s.contactNumber || '';
    if (adminInput) adminInput.value = s.adminName || '';
    if (currInput) currInput.value = s.currencySymbol || '₹';
    if (minInput) minInput.value = s.defaultMinStock || 10;
    if (themeInput) themeInput.value = s.theme || 'light';

    // Update preview card
    const prevStore = document.getElementById('preview-store-name');
    const prevAddr = document.getElementById('preview-store-address');
    const prevPhone = document.getElementById('preview-store-phone');
    const prevAdmin = document.getElementById('preview-admin-name');

    if (prevStore) prevStore.textContent = s.storeName;
    if (prevAddr) prevAddr.textContent = s.storeAddress;
    if (prevPhone) prevPhone.textContent = s.contactNumber;
    if (prevAdmin) prevAdmin.textContent = s.adminName;
}
