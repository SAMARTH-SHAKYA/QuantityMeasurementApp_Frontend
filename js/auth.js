import config from './config.js';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');

function showMessage(msg, isSuccess = false) {
    if(!authMessage) return;
    authMessage.textContent = msg;
    authMessage.className = `result-message ${isSuccess ? 'success' : 'error'} fadeIn`;
    authMessage.classList.remove('hidden');
}

function hideMessage() {
    if(authMessage) authMessage.classList.add('hidden');
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const btn = loginForm.querySelector('button');
        btn.disabled = true;
        btn.textContent = "Logging in...";

        try {
            const res = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.Error || data.message || "Failed to login");
            }
            
            // Assume the backend returns a token in data.token, or the string itself might just be the token
            const token = data.token || data; 
            
            localStorage.setItem('jwt_token', token);
            window.location.href = 'index.html'; // Redirect to dashboard
            
        } catch (error) {
            showMessage(error.message, false);
        } finally {
            btn.disabled = false;
            btn.textContent = "Login";
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (password !== confirmPassword) {
            showMessage("Passwords do not match", false);
            return;
        }

        const btn = registerForm.querySelector('button');
        btn.disabled = true;
        btn.textContent = "Registering...";

        try {
            const res = await fetch(`${config.API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.Error || data.message || "Failed to register");
            }

            showMessage("Registration successful! Redirecting to login...", true);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);

        } catch (error) {
            showMessage(error.message, false);
        } finally {
            btn.disabled = false;
            btn.textContent = "Register";
        }
    });
}

// Check if user is already logged in on auth pages
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        // Only redirect if they are actively on login/register pages
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
            window.location.href = 'index.html';
        }
    }
});
