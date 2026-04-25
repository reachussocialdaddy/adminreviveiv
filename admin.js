// admin.js - Enhanced with Mock Data & Advanced Functions

const API_URL = window.REVIVE_CONFIG ? window.REVIVE_CONFIG.API_URL : '';
let currentData = {
    bookings: [],
    enquiries: [],
    products: []
};

// Check Auth
const checkAuth = () => {
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/admin/');
    const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';

    if (!isLoggedIn && !isLoginPage) {
        window.location.href = 'index.html';
    } else if (isLoggedIn && isLoginPage) {
        window.location.href = 'dashboard.html';
    }
};

// Data Fetching with Mock Fallback
const fetchData = async (endpoint, mockKey) => {
    try {
        const res = await fetch(`${API_URL}/api/${endpoint}`);
        if (!res.ok) throw new Error('API Error');
        return await res.json();
    } catch (error) {
        console.warn(`Falling back to mock data for: ${endpoint}`);
        return window.REVIVE_MOCK_DATA ? window.REVIVE_MOCK_DATA[mockKey] : [];
    }
};

// Login handler
const handleLogin = (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    if (user === 'admin' && pass === 'Socialdaddy') {
        localStorage.setItem('admin_logged_in', 'true');
        window.location.href = 'dashboard.html';
    } else {
        errorMsg.style.display = 'block';
        setTimeout(() => errorMsg.style.display = 'none', 3000);
    }
};

// Logout handler
const handleLogout = (e) => {
    if(e) e.preventDefault();
    localStorage.removeItem('admin_logged_in');
    window.location.href = 'index.html';
};

// Load Dashboard Stats
const loadDashboardStats = async () => {
    if (!document.getElementById('total-bookings')) return;
    
    currentData.bookings = await fetchData('bookings', 'bookings');
    currentData.enquiries = await fetchData('enquiries', 'enquiries');
    currentData.products = await fetchData('products', 'products');

    document.getElementById('total-bookings').textContent = currentData.bookings.length;
    document.getElementById('pending-inquiries').textContent = currentData.enquiries.filter(i => i.status === 'Pending').length;
    document.getElementById('active-products').textContent = currentData.products.filter(p => p.status === 'Active').length;
};

// Global Table Search
const setupSearch = (tableId, inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('keyup', () => {
        const filter = input.value.toLowerCase();
        const rows = document.querySelectorAll(`#${tableId} tbody tr`);
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    });
};

// Load Products
const loadProducts = async () => {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    const products = await fetchData('products', 'products');
    tbody.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${p.id.substring(0, 8)}</td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>$${p.price}</td>
            <td><span class="badge ${p.status === 'Active' ? 'badge-active' : 'badge-pending'}">${p.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" onclick="editProduct('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" onclick="toggleProductStatus('${p.id}')" title="Toggle Status"><i class="fas fa-sync-alt"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// Load Bookings
const loadBookings = async () => {
    const tbody = document.getElementById('bookings-tbody');
    if (!tbody) return;

    const bookings = await fetchData('bookings', 'bookings');
    tbody.innerHTML = '';

    bookings.forEach(b => {
        const statusClass = b.status === 'Completed' ? 'badge-completed' : 'badge-pending';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>BK-${b.id.substring(0, 4)}</td>
            <td><strong>${b.customer_name}</strong><br><small>${b.email}</small></td>
            <td>${b.cart_items ? b.cart_items.map(i => i.name).join(', ') : 'Custom'}</td>
            <td>${b.date} at ${b.timeslot}</td>
            <td><span class="badge ${statusClass}">${b.status}</span></td>
            <td>
                <button class="btn-icon" onclick="updateBookingStatus('${b.id}', 'Completed')" title="Mark Completed"><i class="fas fa-check"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// Load Inquiries
const loadInquiries = async () => {
    const tbody = document.getElementById('inquiries-tbody');
    if (!tbody) return;

    const inquiries = await fetchData('enquiries', 'enquiries');
    tbody.innerHTML = '';

    inquiries.forEach(i => {
        const statusClass = i.status === 'Responded' ? 'badge-completed' : 'badge-pending';
        const tr = document.createElement('tr');
        const date = new Date(i.created_at).toLocaleDateString();
        tr.innerHTML = `
            <td>INQ-${i.id.substring(0, 4)}</td>
            <td><strong>${i.name}</strong><br><small style="color:var(--text-secondary)">${i.email}</small></td>
            <td>${i.subject}</td>
            <td>${date}</td>
            <td><span class="badge ${statusClass}">${i.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewInquiry('${i.id}')" title="View Message"><i class="fas fa-eye"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// Actions
window.updateBookingStatus = async (id, status) => {
    console.log(`Updating booking ${id} to ${status}`);
    // Fallback logic for mock data update in UI
    const row = document.querySelector(`tr:has(td:contains('${id.substring(0, 4)}'))`);
    if (row) {
        const badge = row.querySelector('.badge');
        badge.className = `badge badge-completed`;
        badge.textContent = status;
    }
};

window.viewInquiry = (id) => {
    const inq = window.REVIVE_MOCK_DATA.enquiries.find(i => i.id.includes(id));
    if (inq) {
        alert(`From: ${inq.name}\nSubject: ${inq.subject}\n\nMessage: ${inq.message}`);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    loadDashboardStats();
    loadProducts();
    loadBookings();
    loadInquiries();

    // Setup searches if elements exist
    setupSearch('products-tbody', 'product-search');
    setupSearch('bookings-tbody', 'booking-search');
    setupSearch('inquiries-tbody', 'inquiry-search');
});
