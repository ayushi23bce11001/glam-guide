document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    // Toggle password visibility
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('change', () => {
            passwordInput.type = togglePassword.checked ? 'text' : 'password';
        });
    }

    // Live validation feedback
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const email = emailInput.value.trim();
            if (!validateEmail(email)) {
                emailInput.style.borderColor = '#dc3545';
            } else {
                emailInput.style.borderColor = '#28a745';
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            if (password.length < 8) {
                passwordInput.style.borderColor = '#dc3545';
            } else {
                passwordInput.style.borderColor = '#28a745';
            }
        });
    }

    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!validateEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            if (password.length < 8) {
                alert('Password must be at least 8 characters long.');
                return;
            }

            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : 'Login';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Logging in...';
            }

            try {
                const response = await GlamAPI.login(email, password);
                alert('Login successful! Welcome back.');
                window.location.href = 'wardrobemanagement.html';
            } catch (error) {
                console.error('Login error:', error);
                alert(error.message || 'Login failed. Please check your credentials.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }

    function validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
});
