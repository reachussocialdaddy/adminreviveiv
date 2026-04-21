// Mock Data Initialization
const initMockData = () => {
    if (!localStorage.getItem('admin_products')) {
        const mockProducts = [
            { id: 1, name: 'Liquid Gold', price: 299, category: 'IV Drip', status: 'Active' },
            { id: 2, name: 'Immunity Shield', price: 249, category: 'IV Drip', status: 'Active' },
            { id: 3, name: 'Vitamin B12 Shot', price: 49, category: 'Shot', status: 'Active' }
        ];
        localStorage.setItem('admin_products', JSON.stringify(mockProducts));
    }

    if (!localStorage.getItem('admin_bookings')) {
        const mockBookings = [
            { id: 'BK-1001', customer: 'Sarah Jenkins', service: 'Liquid Gold', date: '2026-04-22', time: '10:00 AM', status: 'Pending' },
            { id: 'BK-1002', customer: 'Michael Chen', service: 'Immunity Shield', date: '2026-04-21', time: '02:30 PM', status: 'Completed' }
        ];
        localStorage.setItem('admin_bookings', JSON.stringify(mockBookings));
    }

    if (!localStorage.getItem('admin_inquiries')) {
        const mockInquiries = [
            { id: 'INQ-001', name: 'Emma Watson', email: 'emma.w@example.com', subject: 'Group Booking Inquiry', date: '2026-04-20', status: 'Pending' },
            { id: 'INQ-002', name: 'David Smith', email: 'david.s@example.com', subject: 'Pricing Question', date: '2026-04-19', status: 'Responded' }
        ];
        localStorage.setItem('admin_inquiries', JSON.stringify(mockInquiries));
    }
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
const loadDashboardStats = () => {
    if (!document.getElementById('total-bookings')) return;
    
    const bookings = JSON.parse(localStorage.getItem('admin_bookings') || '[]');
    const inquiries = JSON.parse(localStorage.getItem('admin_inquiries') || '[]');
    const products = JSON.parse(localStorage.getItem('admin_products') || '[]');

    document.getElementById('total-bookings').textContent = bookings.length;
    document.getElementById('pending-inquiries').textContent = inquiries.filter(i => i.status === 'Pending').length;
    document.getElementById('active-products').textContent = products.filter(p => p.status === 'Active').length;
};

// Load Products
const loadProducts = () => {
    const tbody = document.getElementById('products-tbody');
    if (!tbody) return;

    const products = JSON.parse(localStorage.getItem('admin_products') || '[]');
    tbody.innerHTML = '';

    products.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${p.id}</td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>$${p.price}</td>
            <td><span class="badge badge-active">${p.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon" onclick="editProduct(${p.id})" title="Edit Price">✎</button>
                    <button class="btn-icon" onclick="deleteProduct(${p.id})" title="Delete">×</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// Add/Edit Product handling
const setupProductModal = () => {
    const modal = document.getElementById('product-modal');
    if (!modal) return;

    const addBtn = document.getElementById('add-product-btn');
    const closeBtn = document.getElementById('close-modal');
    const form = document.getElementById('product-form');

    addBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Add New Product';
        document.getElementById('prod-id').value = '';
        form.reset();
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('prod-id').value;
        const name = document.getElementById('prod-name').value;
        const price = document.getElementById('prod-price').value;
        const category = document.getElementById('prod-category').value;

        let products = JSON.parse(localStorage.getItem('admin_products') || '[]');

        if (id) {
            // Edit
            const index = products.findIndex(p => p.id == id);
            if(index > -1) {
                products[index].name = name;
                products[index].price = price;
                products[index].category = category;
            }
        } else {
            // Add
            const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
            products.push({ id: newId, name, price, category, status: 'Active' });
        }

        localStorage.setItem('admin_products', JSON.stringify(products));
        modal.classList.remove('active');
        loadProducts();
    });
};

window.editProduct = (id) => {
    const products = JSON.parse(localStorage.getItem('admin_products') || '[]');
    const product = products.find(p => p.id == id);
    if(product) {
        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('prod-id').value = product.id;
        document.getElementById('prod-name').value = product.name;
        document.getElementById('prod-price').value = product.price;
        document.getElementById('prod-category').value = product.category;
        document.getElementById('product-modal').classList.add('active');
    }
}

window.deleteProduct = (id) => {
    if(confirm('Are you sure you want to delete this product?')) {
        let products = JSON.parse(localStorage.getItem('admin_products') || '[]');
        products = products.filter(p => p.id != id);
        localStorage.setItem('admin_products', JSON.stringify(products));
        loadProducts();
    }
}

// Load Bookings
const loadBookings = () => {
    const tbody = document.getElementById('bookings-tbody');
    if (!tbody) return;

    const bookings = JSON.parse(localStorage.getItem('admin_bookings') || '[]');
    tbody.innerHTML = '';

    bookings.forEach(b => {
        const statusClass = b.status === 'Completed' ? 'badge-completed' : 'badge-pending';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${b.id}</td>
            <td><strong>${b.customer}</strong></td>
            <td>${b.service}</td>
            <td>${b.date} at ${b.time}</td>
            <td><span class="badge ${statusClass}">${b.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
};

// Load Inquiries
const loadInquiries = () => {
    const tbody = document.getElementById('inquiries-tbody');
    if (!tbody) return;

    const inquiries = JSON.parse(localStorage.getItem('admin_inquiries') || '[]');
    tbody.innerHTML = '';

    inquiries.forEach(i => {
        const statusClass = i.status === 'Responded' ? 'badge-completed' : 'badge-pending';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i.id}</td>
            <td><strong>${i.name}</strong><br><small style="color:var(--text-secondary)">${i.email}</small></td>
            <td>${i.subject}</td>
            <td>${i.date}</td>
            <td><span class="badge ${statusClass}">${i.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initMockData();
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
