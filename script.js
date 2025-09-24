// Product data
const products = [
    {
        id: 1,
        name: "iPhone 15 Pro Max",
        price: 15999000,
        originalPrice: 17999000,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop",
        category: "Electronics",
        rating: 4.8,
        reviews: 1247,
        inStock: true,
        description: "iPhone terbaru dengan teknologi A17 Pro chip dan kamera 48MP yang revolusioner."
    },
    {
        id: 2,
        name: "MacBook Air M3",
        price: 18999000,
        image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop",
        category: "Electronics",
        rating: 4.9,
        reviews: 892,
        inStock: true,
        description: "MacBook Air dengan chip M3 yang powerful untuk produktivitas maksimal."
    },
    {
        id: 3,
        name: "Sony WH-1000XM5",
        price: 4999000,
        originalPrice: 5999000,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop",
        category: "Electronics",
        rating: 4.7,
        reviews: 2156,
        inStock: true,
        description: "Headphone wireless premium dengan noise cancelling terdepan di industri."
    },
    {
        id: 4,
        name: "Nike Air Jordan 1",
        price: 2299000,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
        category: "Fashion",
        rating: 4.6,
        reviews: 3421,
        inStock: true,
        description: "Sepatu basket legendaris dengan desain iconic dan kenyamanan maksimal."
    },
    {
        id: 5,
        name: "Uniqlo Cotton T-Shirt",
        price: 199000,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
        category: "Fashion",
        rating: 4.4,
        reviews: 1876,
        inStock: true,
        description: "T-shirt katun premium dengan kualitas terbaik dan design minimalis."
    },
    {
        id: 6,
        name: "IKEA Minimalist Desk",
        price: 1299000,
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=300&fit=crop",
        category: "Home & Garden",
        rating: 4.5,
        reviews: 967,
        inStock: true,
        description: "Meja kerja minimalis dengan desain Skandinavia yang elegan dan fungsional."
    },
    {
        id: 7,
        name: "The Psychology of Money",
        price: 149000,
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop",
        category: "Books",
        rating: 4.8,
        reviews: 4532,
        inStock: true,
        description: "Buku bestseller tentang psikologi keuangan dan investasi yang mengubah hidup."
    },
    {
        id: 8,
        name: "Yoga Mat Premium",
        price: 399000,
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
        category: "Sports",
        rating: 4.6,
        reviews: 1234,
        inStock: true,
        description: "Matras yoga premium dengan material eco-friendly dan grip yang sempurna."
    },
    {
        id: 9,
        name: "Samsung 4K Smart TV 55\"",
        price: 8999000,
        originalPrice: 10999000,
        image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop",
        category: "Electronics",
        rating: 4.7,
        reviews: 1567,
        inStock: true,
        description: "Smart TV 4K dengan teknologi QLED dan fitur smart yang lengkap."
    },
    {
        id: 10,
        name: "Adidas Running Shoes",
        price: 1799000,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
        category: "Sports",
        rating: 4.5,
        reviews: 2890,
        inStock: false,
        description: "Sepatu lari dengan teknologi Boost untuk performa maksimal."
    }
];

let cart = [];
let currentFilter = 'All';
let currentSearch = '';
let currentUser = null;
let orderHistory = [];

// Format price to Indonesian Rupiah
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
}

// Generate stars
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= Math.floor(rating) ? '⭐' : '☆';
    }
    return stars;
}

// Render products
function renderProducts(productsToShow = products) {
    const grid = document.getElementById('productsGrid');
    const count = document.getElementById('productCount');
    
    count.textContent = productsToShow.length;
    
    grid.innerHTML = productsToShow.map(product => `
        <div class="product-card" onclick="showProduct('${product.name}')">
            <div style="position: relative;">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                ${product.originalPrice ? '<div class="product-badge">Sale</div>' : ''}
                ${!product.inStock ? '<div class="product-badge" style="background: #666;">Habis</div>' : ''}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-rating">
                    <span class="stars">${generateStars(product.rating)}</span>
                    <span>${product.rating} (${product.reviews > 1000 ? Math.floor(product.reviews/1000) + 'k' : product.reviews})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.originalPrice ? `<span class="original-price">${formatPrice(product.originalPrice)}</span>` : ''}
                </div>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})" ${!product.inStock ? 'disabled style="opacity: 0.5;"' : ''}>
                    🛒 ${product.inStock ? 'Tambah ke Keranjang' : 'Stok Habis'}
                </button>
            </div>
        </div>
    `).join('');
}

// Filter products by category
function filterCategory(category) {
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update title
    const title = document.querySelector('.products-title');
    title.textContent = category === 'All' ? '⭐ Semua Produk Bintang' : `⭐ ${category}`;
    
    // Filter and render products
    const filtered = category === 'All' 
        ? products 
        : products.filter(p => p.category === category);
    
    const searchFiltered = currentSearch 
        ? filtered.filter(p => p.name.toLowerCase().includes(currentSearch.toLowerCase()))
        : filtered;
        
    renderProducts(searchFiltered);
}

// Search products
function searchProducts(query) {
    currentSearch = query;
    
    let filtered = currentFilter === 'All' 
        ? products 
        : products.filter(p => p.category === currentFilter);
        
    if (query) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    renderProducts(filtered);
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.inStock) return;
    
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartCount();
    showNotification(`${product.name} ditambahkan ke keranjang!`);
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f59e0b, #ea580c);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show product details
function showProduct(productName) {
    const product = products.find(p => p.name === productName);
    if (product) {
        alert(`📱 ${product.name}\n\n💰 Harga: ${formatPrice(product.price)}\n⭐ Rating: ${product.rating}/5 (${product.reviews} ulasan)\n📦 Stok: ${product.inStock ? 'Tersedia' : 'Habis'}\n\n📝 Deskripsi:\n${product.description}\n\nFitur detail produk segera hadir!`);
    }
}

// Show login modal
function showLogin() {
    if (currentUser) {
        logout();
    } else {
        document.getElementById('loginModal').style.display = 'block';
    }
}

// Show register modal
function showRegister() {
    closeModal('loginModal');
    document.getElementById('registerModal').style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Handle login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation (in real app, this would be server-side)
    if (email && password) {
        currentUser = { email: email, name: email.split('@')[0] };
        
        // Load sample order history for demo
        loadSampleOrderHistory();
        
        updateLoginButton();
        closeModal('loginModal');
        showNotification(`Selamat datang, ${currentUser.name}! 🎉`);
    }
});

// Handle register
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Password tidak cocok!');
        return;
    }
    
    if (name && email && password) {
        currentUser = { email: email, name: name };
        updateLoginButton();
        closeModal('registerModal');
        showNotification(`Pendaftaran berhasil! Selamat datang, ${currentUser.name}! 🎉`);
    }
});

// Update login button
function updateLoginButton() {
    const loginBtn = document.getElementById('loginBtn');
    const historyBtn = document.getElementById('historyBtn');
    
    if (currentUser) {
        loginBtn.innerHTML = `👋 ${currentUser.name}`;
        loginBtn.onclick = logout;
        historyBtn.style.display = 'block';
    } else {
        loginBtn.innerHTML = '👤 Masuk';
        loginBtn.onclick = showLogin;
        historyBtn.style.display = 'none';
    }
}

// Logout
function logout() {
    currentUser = null;
    orderHistory = [];
    updateLoginButton();
    showNotification('Anda telah logout. Sampai jumpa! 👋');
}

// Show cart
function showCart() {
    if (cart.length === 0) {
        showNotification('Keranjang belanja kosong! 🛒\nSilakan tambahkan produk terlebih dahulu.');
        return;
    }
    
    renderCartDetails();
    document.getElementById('cartModal').style.display = 'block';
}

// Render cart details
function renderCartDetails() {
    const cartDetails = document.getElementById('cartDetails');
    const cartTotal = document.getElementById('cartTotal');
    
    let total = 0;
    
    cartDetails.innerHTML = cart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span style="margin: 0 0.5rem; font-weight: 600;">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="background: #ef4444; margin-left: 1rem;">🗑️</button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: #ea580c;">${formatPrice(subtotal)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    cartTotal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 1.2rem; font-weight: 600;">Total Belanja:</span>
            <span class="total-amount">${formatPrice(total)}</span>
        </div>
    `;
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartCount();
            renderCartDetails();
        }
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCartDetails();
    
    if (cart.length === 0) {
        closeModal('cartModal');
        showNotification('Keranjang kosong! 🛒');
    }
}

// Show checkout
function showCheckout() {
    if (!currentUser) {
        closeModal('cartModal');
        showLogin();
        showNotification('Silakan login terlebih dahulu untuk checkout! 🔐');
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Keranjang belanja kosong! 🛒');
        return;
    }
    
    renderCheckoutDetails();
    closeModal('cartModal');
    document.getElementById('checkoutModal').style.display = 'block';
}

// Back to cart from checkout
function backToCart() {
    closeModal('checkoutModal');
    showCart();
}

// Render checkout details
function renderCheckoutDetails() {
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    let total = 0;
    let totalItems = 0;
    
    checkoutItems.innerHTML = cart.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        totalItems += item.quantity;
        
        return `
            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e5e5;">
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${item.name}</div>
                    <div style="color: #666; font-size: 0.8rem;">${item.quantity} x ${formatPrice(item.price)}</div>
                </div>
                <div style="font-weight: 600; color: #ea580c;">${formatPrice(subtotal)}</div>
            </div>
        `;
    }).join('');
    
    const shippingCost = total >= 500000 ? 0 : 25000;
    const finalTotal = total + shippingCost;
    
    checkoutTotal.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Subtotal (${totalItems} item):</span>
            <span>${formatPrice(total)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Ongkos Kirim:</span>
            <span>${shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span>
        </div>
        <hr style="margin: 1rem 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 1.2rem; font-weight: 600;">Total Pembayaran:</span>
            <span class="total-amount">${formatPrice(finalTotal)}</span>
        </div>
    `;
}

// Process order
function processOrder() {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = subtotal >= 500000 ? 0 : 25000;
    const finalTotal = subtotal + shippingCost;
    
    // Create order
    const newOrder = {
        orderId: 'BS' + Date.now(),
        date: new Date().toLocaleDateString('id-ID'),
        items: [...cart],
        shipping: Object.fromEntries(formData),
        total: finalTotal,
        status: 'pending',
        trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    
    // Add to order history
    orderHistory.unshift(newOrder);
    
    // Clear cart
    cart = [];
    updateCartCount();
    
    closeModal('checkoutModal');
    
    // Show success message
    alert(`🎉 Pesanan Berhasil Dibuat!\n\nID Pesanan: ${newOrder.orderId}\nNomor Resi: ${newOrder.trackingNumber}\nTanggal: ${newOrder.date}\nTotal: ${formatPrice(finalTotal)}\n\nTerima kasih telah berbelanja di Bintang Sell! ⭐\nAnda dapat memantau status pesanan di menu Riwayat.`);
    
    // Update order status after some time (simulation)
    setTimeout(() => updateOrderStatus(newOrder.orderId, 'processing'), 3000);
    setTimeout(() => updateOrderStatus(newOrder.orderId, 'shipped'), 8000);
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const order = orderHistory.find(o => o.orderId === orderId);
    if (order) {
        order.status = newStatus;
        if (newStatus === 'shipped') {
            showNotification(`📦 Pesanan ${orderId} sedang dalam pengiriman!`);
        } else if (newStatus === 'processing') {
            showNotification(`⚙️ Pesanan ${orderId} sedang diproses!`);
        }
    }
}

// Show order history
function showOrderHistory() {
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu! 🔐');
        return;
    }
    
    renderOrderHistory();
    document.getElementById('orderHistoryModal').style.display = 'block';
}

// Render order history
function renderOrderHistory() {
    const orderHistoryContainer = document.getElementById('orderHistory');
    
    if (orderHistory.length === 0) {
        orderHistoryContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #666;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                <h3>Belum ada riwayat pesanan</h3>
                <p>Mulai berbelanja untuk melihat riwayat pesanan Anda di sini!</p>
            </div>
        `;
        return;
    }
    
    orderHistoryContainer.innerHTML = orderHistory.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <div class="order-id">${order.orderId}</div>
                    <div class="order-date">${order.date}</div>
                </div>
                <div class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</div>
            </div>
            
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-product">
                        <img src="${item.image}" alt="${item.name}" class="order-product-image">
                        <div class="order-product-info">
                            <div class="order-product-name">${item.name}</div>
                            <div class="order-product-quantity">${item.quantity}x</div>
                        </div>
                        <div class="order-product-price">${formatPrice(item.price * item.quantity)}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-total">Total: ${formatPrice(order.total)}</div>
            
            <div class="order-actions">
                <button class="btn-track" onclick="showTracking('${order.orderId}')">📦 Lacak Paket</button>
                <button class="btn-reorder" onclick="reorder('${order.orderId}')">🔄 Pesan Lagi</button>
            </div>
        </div>
    `).join('');
}

// Get status class
function getStatusClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'processing': 'status-processing',
        'shipped': 'status-shipped',
        'delivered': 'status-delivered'
    };
    return statusClasses[status] || 'status-pending';
}

// Get status text
function getStatusText(status) {
    const statusTexts = {
        'pending': '⏳ Menunggu Konfirmasi',
        'processing': '⚙️ Sedang Diproses',
        'shipped': '🚚 Dalam Pengiriman',
        'delivered': '✅ Terkirim'
    };
    return statusTexts[status] || 'Tidak Diketahui';
}

// Show tracking
function showTracking(orderId) {
    const order = orderHistory.find(o => o.orderId === orderId);
    if (!order) return;
    
    renderTracking(order);
    closeModal('orderHistoryModal');
    document.getElementById('trackingModal').style.display = 'block';
}

// Render tracking
function renderTracking(order) {
    const trackingContent = document.getElementById('trackingContent');
    
    const trackingSteps = getTrackingSteps(order.status);
    
    trackingContent.innerHTML = `
        <div class="tracking-info">
            <div class="tracking-header">
                <div>
                    <div><strong>Pesanan:</strong> ${order.orderId}</div>
                    <div class="tracking-number"><strong>No. Resi:</strong> ${order.trackingNumber}</div>
                </div>
                <div class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</div>
            </div>
            
            <div class="tracking-timeline">
                ${trackingSteps.map(step => `
                    <div class="tracking-step ${step.status}">
                        <div class="tracking-step-title">${step.title}</div>
                        <div class="tracking-step-desc">${step.description}</div>
                        <div class="tracking-step-time">${step.time}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="margin-top: 2rem; text-align: center;">
            <button class="btn-secondary" onclick="closeModal('trackingModal'); showOrderHistory();">
                ← Kembali ke Riwayat
            </button>
        </div>
    `;
}

// Get tracking steps
function getTrackingSteps(currentStatus) {
    const now = new Date();
    const steps = [
        {
            title: '📋 Pesanan Dikonfirmasi',
            description: 'Pesanan Anda telah dikonfirmasi dan akan segera diproses',
            time: new Date(now.getTime() - 3600000).toLocaleString('id-ID'),
            status: 'completed'
        },
        {
            title: '📦 Pesanan Dikemas',
            description: 'Pesanan sedang dikemas di gudang',
            time: currentStatus !== 'pending' ? new Date(now.getTime() - 1800000).toLocaleString('id-ID') : '',
            status: currentStatus !== 'pending' ? 'completed' : ''
        },
        {
            title: '🚚 Dalam Pengiriman',
            description: 'Paket sedang dalam perjalanan ke alamat tujuan',
            time: currentStatus === 'shipped' || currentStatus === 'delivered' ? new Date(now.getTime() - 900000).toLocaleString('id-ID') : '',
            status: currentStatus === 'shipped' ? 'current' : (currentStatus === 'delivered' ? 'completed' : '')
        },
        {
            title: '✅ Paket Terkirim',
            description: 'Paket telah sampai di alamat tujuan',
            time: currentStatus === 'delivered' ? new Date().toLocaleString('id-ID') : '',
            status: currentStatus === 'delivered' ? 'completed' : ''
        }
    ];
    
    return steps;
}

// Reorder
function reorder(orderId) {
    const order = orderHistory.find(o => o.orderId === orderId);
    if (!order) return;
    
    // Add items to cart
    order.items.forEach(item => {
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            existingItem.quantity += item.quantity;
        } else {
            cart.push({ ...item });
        }
    });
    
    updateCartCount();
    closeModal('orderHistoryModal');
    showNotification(`🛒 ${order.items.length} produk ditambahkan ke keranjang!`);
}

// Load sample order history for demo
function loadSampleOrderHistory() {
    const sampleOrder = {
        orderId: 'BS' + (Date.now() - 86400000),
        date: new Date(Date.now() - 86400000).toLocaleDateString('id-ID'),
        items: [
            {
                id: 1,
                name: "iPhone 15 Pro Max",
                price: 15999000,
                image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop",
                quantity: 1
            }
        ],
        shipping: {
            fullName: "John Doe",
            phone: "08123456789",
            address: "Jl. Sudirman No. 123",
            paymentMethod: "transfer"
        },
        total: 16024000,
        status: 'delivered',
        trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };
    
    orderHistory = [sampleOrder];
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    updateCartCount();
});