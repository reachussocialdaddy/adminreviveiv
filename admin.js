// admin.js - Integrated with Backend

const API_URL = window.REVIVE_CONFIG ? window.REVIVE_CONFIG.API_URL : '';

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

// Login handler
const handleLogin = (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    // Hardcoded for now as per original request, but can be moved to backend
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
    
    try {
        const [bookingsRes, inquiriesRes, productsRes] = await Promise.all([
            fetch(`${API_URL}/api/bookings`),
            fetch(`${API_URL}/api/enquiries`),
            fetch(`${API_URL}/api/products`)
        ]);

        const bookings = await bookingsRes.json();
        const inquiries = await inquiriesRes.json();
        const products = await productsRes.json();

        document.getElementById('total-bookings').textContent = bookings.length;
        document.getElementById('pending-inquiries').textContent = inquiries.filter(i => i.status === 'Pending').length;
        document.getElementById('active-products').textContent = products.filter(p => p.status === 'Active').length;
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
};

// Load Products
const loadProducts = async () => {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/api/products`);
        const products = await res.json();
        tbody.innerHTML = '';

        products.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${p.id.substring(0, 8)}</td>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td>$${p.price}</td>
                <td><span class="badge badge-active">${p.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon" onclick="editProduct('${p.id}')" title="Edit Price">✎</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Failed to load products:', error);
    }
};

// Add/Edit Product handling
const setupProductModal = () => {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    const addBtn = document.getElementById('add-product-btn');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('product-form');

    if(addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('modal-title').textContent = 'Add New Product';
            document.getElementById('prod-id').value = '';
            form.reset();
            modal.classList.add('active');
        });
    }

    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('prod-id').value;
            const name = document.getElementById('prod-name').value;
            const price = document.getElementById('prod-price').value;
            const category = document.getElementById('prod-category').value;

            const productData = { name, price, category, status: 'Active' };

            try {
                let response;
                if (id) {
                    // Edit
                    response = await fetch(`${API_URL}/api/products/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(productData)
                    });
                } else {
                    // Add
                    response = await fetch(`${API_URL}/api/products`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(productData)
                    });
                }

                if (response.ok) {
                    modal.classList.remove('active');
                    loadProducts();
                }
            } catch (error) {
                console.error('Failed to save product:', error);
            }
        });
    }
};

window.editProduct = async (id) => {
    try {
        const res = await fetch(`${API_URL}/api/products`);
        const products = await res.json();
        const product = products.find(p => p.id == id);
        if(product) {
            document.getElementById('modal-title').textContent = 'Edit Product';
            document.getElementById('prod-id').value = product.id;
            document.getElementById('prod-name').value = product.name;
            document.getElementById('prod-price').value = product.price;
            document.getElementById('prod-category').value = product.category;
            document.getElementById('product-modal').classList.add('active');
        }
    } catch (error) {
        console.error('Failed to load product for editing:', error);
    }
}

// Load Bookings
const loadBookings = async () => {
    const tbody = document.getElementById('bookings-tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/api/bookings`);
        const bookings = await res.json();
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
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Failed to load bookings:', error);
    }
};

// Load Inquiries
const loadInquiries = async () => {
    const tbody = document.getElementById('inquiries-tbody');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_URL}/api/enquiries`);
        const inquiries = await res.json();
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
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Failed to load inquiries:', error);
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
    setupProductModal();
    loadBookings();
    loadInquiries();
});
