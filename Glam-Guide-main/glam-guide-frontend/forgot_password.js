document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = emailInput.value.trim();

            if (!validateEmail(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : 'Reset Password';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }

            try {
                const data = await GlamAPI.request('/api/auth/forgot-password', {
                    method: 'POST',
                    body: JSON.stringify({ email })
                });

                alert(data.message || 'If an account exists with this email address, password reset instructions have been sent.');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Password reset error:', error);
                alert(error.message || 'Failed to process password reset request.');
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
