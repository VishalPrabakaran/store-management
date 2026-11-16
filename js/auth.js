/**
 * Vishal Hypermarket & Store Management System
 * Authentication & Login Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect straight to dashboard
    checkAuth(true);

    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleIcon = document.getElementById('toggle-password-icon');
    const errorAlert = document.getElementById('login-error-alert');
    const errorMessage = document.getElementById('login-error-message');
    const fillDemoBtn = document.getElementById('btn-fill-demo');

    // Toggle Show/Hide Password
    if (togglePasswordBtn && passwordInput && toggleIcon) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            toggleIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
        });
    }

    // Quick Fill Demo Credentials
    if (fillDemoBtn && usernameInput && passwordInput) {
        fillDemoBtn.addEventListener('click', () => {
            usernameInput.value = 'admin';
            passwordInput.value = 'admin123';
            hideError();
            usernameInput.focus();
            showToast('Demo credentials filled: admin / admin123', 'info', 2000);
        });
    }

    // Hide error on input
    if (usernameInput) usernameInput.addEventListener('input', hideError);
    if (passwordInput) passwordInput.addEventListener('input', hideError);

    function showError(msg) {
        if (errorAlert && errorMessage) {
            errorMessage.textContent = msg;
            errorAlert.style.display = 'flex';
        }
    }

    function hideError() {
        if (errorAlert) {
            errorAlert.style.display = 'none';
        }
    }

    // Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            hideError();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            const rememberMe = document.getElementById('remember-me')?.checked;

            // Form validation
            if (!username) {
                showError('Please enter your administrator username or email.');
                usernameInput.focus();
                return;
            }

            if (!password) {
                showError('Please enter your password.');
                passwordInput.focus();
                return;
            }

            // Demo Credential Check
            // Accepted: admin / admin123 (or admin@vishal.com)
            const isValidUser = (username.toLowerCase() === 'admin' || username.toLowerCase() === 'admin@vishal.com');
            const isValidPass = (password === 'admin123');

            const submitBtn = document.getElementById('btn-login-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
            }

            setTimeout(() => {
                if (isValidUser && isValidPass) {
                    // Successful login
                    setAuthSession({
                        username: 'admin',
                        displayName: 'Admin Manager'
                    });

                    if (rememberMe) {
                        localStorage.setItem('vishal_remember_user', username);
                    } else {
                        localStorage.removeItem('vishal_remember_user');
                    }

                    showToast('Login successful! Redirecting to dashboard...', 'success', 1500);

                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 800);
                } else {
                    // Invalid credentials
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Sign In <i class="fa-solid fa-arrow-right"></i>';
                    }
                    showError('Invalid username or password. Please use demo credentials: admin / admin123');
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            }, 600);
        });
    }

    // Auto-populate remembered username if available
    const remembered = localStorage.getItem('vishal_remember_user');
    if (remembered && usernameInput) {
        usernameInput.value = remembered;
        const rememberCheckbox = document.getElementById('remember-me');
        if (rememberCheckbox) rememberCheckbox.checked = true;
        if (passwordInput) passwordInput.focus();
    }
});
