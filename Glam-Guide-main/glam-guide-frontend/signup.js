document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Live validation feedback
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const email = emailInput.value.trim();
            emailInput.style.borderColor = validateEmail(email) ? '#28a745' : '#dc3545';
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            passwordInput.style.borderColor = passwordInput.value.length >= 8 ? '#28a745' : '#dc3545';
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!name) {
                alert('Please enter your full name.');
                return;
            }

            if (!validateEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            if (password.length < 8) {
                alert('Password must be at least 8 characters long.');
                return;
            }

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : 'Sign Up';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Creating Account...';
            }

            try {
                const data = await GlamAPI.register(name, email, password);
                alert(data.message || 'Signup successful! Welcome to Glam Guide!');
                window.location.href = 'wardrobemanagement.html';
            } catch (error) {
                console.error('Signup error:', error);
                alert(error.message || 'Signup failed. Please try again.');
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
