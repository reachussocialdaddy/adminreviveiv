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
        const response = await fetch(`${API_URL}/api/${endpoint}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // If the database is empty (0 rows), fallback to mock data so the user sees something
        if (Array.isArray(data) && data.length === 0) {
            console.log(`Database table ${endpoint} is empty, showing mock data instead.`);
            return window.REVIVE_MOCK_DATA[mockKey];
        }
        
        return data;
    } catch (error) {
        console.warn(`Failed to fetch ${endpoint}, using mock data:`, error);
        return window.REVIVE_MOCK_DATA[mockKey];
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
        const status = b.status || 'Pending';
        let statusClass = 'badge-pending';
        if (status === 'Confirmed') statusClass = 'badge-active';
        if (status === 'Completed') statusClass = 'badge-completed';
        if (status === 'Pending Payment') statusClass = 'badge-pending';

        const total = parseFloat(b.total_amount) || 0;
        const paid = parseFloat(b.amount_paid) || 0;
        const balance = total - paid;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>BK-${b.id.substring(0, 4)}</td>
            <td>
                <strong>${b.customer_name}</strong><br>
                <small>${b.email}</small><br>
                <small style="color:var(--accent-primary)">${b.phone || 'N/A'}</small>
            </td>
            <td>${b.cart_items ? b.cart_items.map(i => i.name).join(', ') : 'Custom'}</td>
            <td>${b.date} at ${b.timeslot}</td>
            <td>$${total.toFixed(2)}</td>
            <td>$${paid.toFixed(2)}</td>
            <td style="color: ${balance > 0 ? '#ff4444' : 'inherit'}; font-weight: ${balance > 0 ? '700' : 'normal'}">$${balance.toFixed(2)}</td>
            <td><span class="badge ${statusClass}" onclick="updateStatus('bookings', '${b.id}', 'Completed')" style="cursor:pointer" title="Click to complete">${status}</span></td>
            <td>
                <button class="btn-icon" onclick="updateStatus('bookings', '${b.id}', 'Completed')" title="Mark Completed"><i class="fas fa-check"></i></button>
                <button class="btn-icon" onclick="viewBookingDetails('${b.id}')" title="View Details"><i class="fas fa-eye"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.viewBookingDetails = (id) => {
    const booking = currentData.bookings.find(b => b.id === id);
    if (booking) {
        showDetailsModal('Booking Details', booking);
    }
};

// Load Inquiries
const loadInquiries = async () => {
    const tbody = document.getElementById('inquiries-tbody');
    if (!tbody) return;

    currentData.enquiries = await fetchData('enquiries', 'enquiries');
    tbody.innerHTML = '';

    currentData.enquiries.forEach(i => {
        const isCompleted = i.status === 'Completed' || i.status === 'Responded';
        const statusClass = isCompleted ? 'badge-completed' : 'badge-pending';
        const tr = document.createElement('tr');
        const date = new Date(i.created_at).toLocaleDateString();
        
        // Try to find phone number in message
        const phoneMatch = i.message.match(/Phone:\s*([^\n\r]+)/i);
        const phone = phoneMatch ? phoneMatch[1] : '';

        tr.innerHTML = `
            <td>INQ-${i.id.substring(0, 4)}</td>
            <td>
                <strong>${i.name}</strong><br>
                <small style="color:var(--text-secondary)">${i.email}</small>
                ${phone ? `<br><small style="color:var(--accent-primary)"><i class="fas fa-phone-alt" style="font-size:0.7rem"></i> ${phone}</small>` : ''}
            </td>
            <td>${i.subject}</td>
            <td>${date}</td>
            <td><span class="badge ${statusClass}" onclick="updateStatus('enquiries', '${i.id}', '${isCompleted ? 'Pending' : 'Completed'}')" style="cursor:pointer" title="Click to change status">${i.status}</span></td>
            <td>
                <button class="btn-icon" onclick="viewInInquiry('${i.id}')" title="View Message"><i class="fas fa-eye"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// Actions
window.updateStatus = async (type, id, newStatus) => {
    console.log(`Updating ${type} ${id} to ${newStatus}`);
    
    try {
        const response = await fetch(`${API_URL}/api/${type}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update status');
        
        // Refresh the list to show new status
        if (type === 'bookings') loadBookings();
        else loadInquiries();
        
    } catch (error) {
        console.error("Update error:", error);
        alert("Failed to update status in database. Try again.");
    }
};

window.viewInInquiry = (id) => {
    // Look in currentData first, then fallback to mock
    const inq = currentData.enquiries.find(i => i.id === id) || 
                window.REVIVE_MOCK_DATA.enquiries.find(i => i.id.includes(id));
                
    if (inq) {
        showDetailsModal('Inquiry Details', inq);
    } else {
        console.error("Inquiry details not found.");
    }
};

// Custom Modal System
const showDetailsModal = (title, data) => {
    // Remove existing modal if any
    const existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    // Format date
    const date = new Date(data.created_at).toLocaleString();
    const isBooking = !!data.customer_name;
    
    let extraDetails = '';
    if (isBooking) {
        const total = parseFloat(data.total_amount) || 0;
        const paid = parseFloat(data.amount_paid) || 0;
        const balance = total - paid;
        extraDetails = `
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed var(--glass-border);">
                <div class="detail-row">
                    <div class="detail-label">Total Cost</div>
                    <div class="detail-value">$${total.toFixed(2)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Advance Paid</div>
                    <div class="detail-value" style="color: var(--accent-primary)">$${paid.toFixed(2)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Balance Due</div>
                    <div class="detail-value" style="color: #ff4444; font-weight: bold;">$${balance.toFixed(2)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">${data.location}</div>
                </div>
                <div class="detail-label">Items Ordered</div>
                <div class="message-box" style="font-size: 0.85rem;">
                    ${data.cart_items ? data.cart_items.map(i => `• ${i.name} ($${i.price})`).join('<br>') : 'N/A'}
                </div>
            </div>
        `;
    }

    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="detail-row">
                    <div class="detail-label">Customer</div>
                    <div class="detail-value"><strong>${data.name || data.customer_name}</strong></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${data.email}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${data.phone || 'N/A'}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">${date}</div>
                </div>
                ${!isBooking ? `
                <div class="detail-row">
                    <div class="detail-label">Subject</div>
                    <div class="detail-value">${data.subject || 'N/A'}</div>
                </div>
                <div class="detail-label">Message Content</div>
                <div class="message-box">${data.message}</div>
                ` : ''}
                ${extraDetails}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    
    // Trigger animation
    setTimeout(() => overlay.classList.add('active'), 10);

    // Close logic
    const close = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('.close-modal').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });
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
