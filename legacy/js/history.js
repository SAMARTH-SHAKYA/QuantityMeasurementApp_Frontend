import config from './config.js';

// DOM Elements
const historyBody = document.getElementById('history-body');
const historyTable = document.getElementById('history-table');
const loadingDiv = document.getElementById('loading');
const emptyStateDiv = document.getElementById('empty-state');
const errorMessage = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn');

// --- Authentication Check ---
function checkAuth() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
    }
    return token;
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
}

// Get Badge Class
function getBadgeClass(type) {
    if(!type) return '';
    return type.toLowerCase();
}

// Fetch History
async function loadHistory() {
    const token = checkAuth();
    
    try {
        const response = await fetch(`${config.API_BASE_URL}/api/measurement/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('jwt_token');
                window.location.href = 'login.html';
                return;
            }
            throw new Error("Failed to load history.");
        }

        const data = await response.json();
        
        loadingDiv.classList.add('hidden');
        
        if (data && data.length > 0) {
            renderTable(data);
            historyTable.classList.remove('hidden');
        } else {
            emptyStateDiv.classList.remove('hidden');
        }
        
    } catch (err) {
        loadingDiv.classList.add('hidden');
        errorMessage.textContent = err.message;
        errorMessage.classList.remove('hidden');
    }
}

// Render Table
function renderTable(historyItems) {
    historyBody.innerHTML = '';
    
    // Reverse logic if want newest first (depends if backend sorted it)
    historyItems.reverse().forEach(item => {
        const row = document.createElement('tr');
        
        // Structure based on likely fields in Entity
        // Item assumed properties (mapped natively to QuantityMeasurementEntity.cs JSON serialization)
        const typeBadge = `<span class="badge ${getBadgeClass(item.measurementType)}">${item.measurementType || 'Unknown'}</span>`;
        
        const val1 = item.firstOperand || '-';
        const val2 = item.secondOperand || '-';
        const result = item.hasError ? `Error: ${item.errorMessage}` : (item.finalResult || '-');

        row.innerHTML = `
            <td>${typeBadge}</td>
            <td>${item.operationType || 'N/A'}</td>
            <td>${val1}</td>
            <td>${val2}</td>
            <td><strong>${result}</strong></td>
            <td>${item.timestamp ? formatDate(item.timestamp) : '-'}</td>
        `;
        
        historyBody.appendChild(row);
    });
}

// Boot up
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadHistory();
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('jwt_token');
            window.location.href = 'login.html';
        });
    }
});
