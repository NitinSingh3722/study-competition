document.addEventListener('DOMContentLoaded', function() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tabName}-form`).classList.add('active');
        });
    });

    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        console.log('Attempting login for email:', email);

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok) {
                if (data.message === 'Login successful') {
                    alert('Login successful');
                    // Store the token in localStorage
                    localStorage.setItem('token', data.token);
                    // Redirect to dashboard
                    window.location.href = '/dashboard';
                } else {
                    alert(data.message || 'Login failed');
                }
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    });

    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const college = document.getElementById('register-college').value;
        const city = document.getElementById('register-city').value;

        const response = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, college, city })
        });

        const data = await response.json();
        if (data.message === 'User registered') {
            // Show success message and switch to login tab
            alert('Registration successful. Please log in.');
            document.querySelector('[data-tab="login"]').click();
        } else {
            alert(data.message);
        }
    });
});
