const pizzaMenu = [
    {
        id: 1,
        name: 'Margherita',
        description: 'Sốt cà chua, phô mai mozzarella, lá oregano',
        priceL: 120000,
        priceS: 80000,
        image: '/api/placeholder/300/200'
    },
    {
        id: 2,
        name: 'Pepperoni',
        description: 'Sốt cà chua, phô mai mozzarella, xúc xích pepperoni',
        priceL: 150000,
        priceS: 100000,
        image: '/api/placeholder/300/200'
    },
    {
        id: 3,
        name: 'Hawaiian',
        description: 'Sốt cà chua, phô mai mozzarella, thịt nguội, dứa',
        priceL: 140000,
        priceS: 90000,
        image: '/api/placeholder/300/200'
    },
    {
        id: 4,
        name: 'Vegetarian',
        description: 'Sốt cà chua, phô mai mozzarella, nấm, ớt chuông, hành tây, ô liu',
        priceL: 130000,
        priceS: 85000,
        image: '/api/placeholder/300/200'
    }
];

let cart = [];
let tableNumber = null;

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
}

function getTableFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const validTables = Array.from({ length: 16 }, (_, i) => (i + 1).toString());
    if (urlParams.has('table') && validTables.includes(urlParams.get('table'))) {
        tableNumber = parseInt(urlParams.get('table'));
        localStorage.setItem('tableNumber', tableNumber);
        document.getElementById('tableInfo').textContent = `Đặt món tại bàn ${tableNumber}`;
    } else {
        tableNumber = parseInt(localStorage.getItem('tableNumber')) || null;
        document.getElementById('tableInfo').textContent = tableNumber
            ? `Đặt món tại bàn ${tableNumber}`
            : 'Số bàn không hợp lệ. Vui lòng quét mã QR tại bàn.';
    }
}

function loadCart() {
    const storedCart = localStorage.getItem('cart');
    cart = storedCart ? JSON.parse(storedCart) : [];
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function renderMenu() {
    const menuContainer = document.createElement('div');
    menuContainer.id = 'menu-container';
    menuContainer.style.display = 'grid';
    menuContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    menuContainer.style.gap = '20px';

    pizzaMenu.forEach(pizza => {
        const pizzaCard = document.createElement('div');
        pizzaCard.className = 'pizza-card';
        pizzaCard.style.backgroundColor = '#fff';
        pizzaCard.style.borderRadius = '8px';
        pizzaCard.style.padding = '15px';
        pizzaCard.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

        const qtyL = cart.find(item => item.pizzaId === pizza.id && item.size === 'L')?.quantity || 0;
        const qtyS = cart.find(item => item.pizzaId === pizza.id && item.size === 'S')?.quantity || 0;

        pizzaCard.innerHTML = `
            <div class="pizza-image" style="margin-bottom: 10px;">
                <img src="${pizza.image}" alt="${pizza.name}" style="width: 100%; border-radius: 8px;">
            </div>
            <div class="pizza-info">
                <div class="pizza-name" style="font-weight: bold; font-size: 1.2rem; margin-bottom: 5px;">${pizza.name}</div>
                <div class="pizza-description" style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">${pizza.description}</div>
                <div class="size-controls">
                    <div class="size-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div class="size-label">Size L <span class="size-price">${formatPrice(pizza.priceL)}</span></div>
                        <div class="quantity-control" style="display: flex; align-items: center;">
                            <button class="quantity-btn" data-pizza-id="${pizza.id}" data-size="L" data-action="decrease" style="width: 30px; height: 30px; border-radius: 50%; border: none; background-color: #ddd; cursor: pointer;">-</button>
                            <span class="quantity-value" id="qty-${pizza.id}-L" style="margin: 0 10px; font-weight: bold;">${qtyL}</span>
                            <button class="quantity-btn" data-pizza-id="${pizza.id}" data-size="L" data-action="increase" style="width: 30px; height: 30px; border-radius: 50%; border: none; background-color: #ddd; cursor: pointer;">+</button>
                        </div>
                    </div>
                    <div class="size-row" style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="size-label">Size S <span class="size-price">${formatPrice(pizza.priceS)}</span></div>
                        <div class="quantity-control" style="display: flex; align-items: center;">
                            <button class="quantity-btn" data-pizza-id="${pizza.id}" data-size="S" data-action="decrease" style="width: 30px; height: 30px; border-radius: 50%; border: none; background-color: #ddd; cursor: pointer;">-</button>
                            <span class="quantity-value" id="qty-${pizza.id}-S" style="margin: 0 10px; font-weight: bold;">${qtyS}</span>
                            <button class="quantity-btn" data-pizza-id="${pizza.id}" data-size="S" data-action="increase" style="width: 30px; height: 30px; border-radius: 50%; border: none; background-color: #ddd; cursor: pointer;">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        menuContainer.appendChild(pizzaCard);
    });

    const existingContainer = document.getElementById('menu-container');
    if (existingContainer) {
        existingContainer.replaceWith(menuContainer);
    } else {
        document.querySelector('.container').appendChild(menuContainer);
    }

    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function () {
            const pizzaId = parseInt(this.getAttribute('data-pizza-id'));
            const size = this.getAttribute('data-size');
            const action = this.getAttribute('data-action');
            updateQuantity(pizzaId, size, action);
        });
    });
}

function updateQuantity(pizzaId, size, action) {
    const pizza = pizzaMenu.find(p => p.id === pizzaId);
    const quantityElement = document.getElementById(`qty-${pizzaId}-${size}`);
    let currentQty = parseInt(quantityElement.textContent);

    if (action === 'increase') {
        currentQty += 1;
        addToCart(pizza, size);
    } else if (action === 'decrease' && currentQty > 0) {
        currentQty -= 1;
        removeFromCart(pizzaId, size);
    }

    quantityElement.textContent = currentQty;
}

function addToCart(pizza, size) {
    const existingItem = cart.find(item => item.pizzaId === pizza.id && item.size === size);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        const cartItem = {
            id: Date.now(),
            pizzaId: pizza.id,
            name: pizza.name,
            size: size,
            price: size === 'L' ? pizza.priceL : pizza.priceS,
            quantity: 1
        };
        cart.push(cartItem);
    }

    saveCart();
    updateCartBadge();
}

function removeFromCart(pizzaId, size) {
    const itemIndex = cart.findIndex(item => item.pizzaId === pizzaId && item.size === size);

    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }

        saveCart();
        updateCartBadge();
    }
}

function updateCartBadge() {
    const badgeElement = document.getElementById('cart-badge');
    if (badgeElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badgeElement.textContent = totalItems;
        badgeElement.style.display = totalItems > 0 ? 'inline' : 'none';
    }
}

function renderCart() {
    const orderItemsContainer = document.getElementById('orderItems');
    const totalElement = document.getElementById('totalAmount');
    const orderBtn = document.querySelector('.submit-order');

    if (!orderItemsContainer || !totalElement || !orderBtn) return;

    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<div class="empty-order">Giỏ hàng trống. Vui lòng chọn pizza!</div>';
        totalElement.textContent = formatPrice(0);
        orderBtn.disabled = true;
        return;
    }

    let cartHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        cartHTML += `
            <div class="order-item">
                <span>${item.name} (Size ${item.size}) x ${item.quantity}</span>
                <span>${formatPrice(itemTotal)}</span>
            </div>
        `;
    });

    orderItemsContainer.innerHTML = cartHTML;
    totalElement.textContent = formatPrice(total);
    orderBtn.disabled = !tableNumber;
}

async function submitOrder() {
    const orderBtn = document.querySelector('.submit-order');
    orderBtn.disabled = true;
    orderBtn.textContent = 'Đang xử lý...';

    try {
        if (!tableNumber) {
            showModal('Vui lòng quét mã QR tại bàn để đặt món.');
            return;
        }

        if (cart.length === 0) {
            showModal('Vui lòng chọn ít nhất một món trước khi đặt.');
            return;
        }

        const formattedOrder = cart.map(item =>
            `- ${item.name} (Size ${item.size}) x ${item.quantity}: ${formatPrice(item.price * item.quantity)}`
        ).join('\n');

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const orderData = {
            tableNumber: tableNumber,
            orderItems: cart.map(item => ({
                name: item.name,
                size: item.size,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity
            })),
            total,
            orderTime: new Date().toLocaleString('vi-VN')
        };

        // Send to Telegram
        const telegramMessage =
            `<b>🍕 ĐƠN HÀNG MỚI 🍕</b>\n` +
            `<b>Bàn số:</b> ${tableNumber}\n` +
            `<b>📋 CHI TIẾT ĐƠN HÀNG:</b>\n` +
            `<pre>${formattedOrder}</pre>\n` +
            `<b>💰 TỔNG CỘNG:</b> <u>${formatPrice(total)}</u>\n` +
            `<b>⏰ Thời gian:</b> ${orderData.orderTime}`;
        await sendTelegramMessage(telegramMessage);

        // Send to Google Sheets
        await sendToGoogleSheets(orderData);

        showModal(`Đơn hàng của bạn đã được gửi đến nhà bếp!<br>Bàn số: ${tableNumber}`);
        resetCart();

    } catch (error) {
        console.error('Lỗi khi đặt hàng:', error);
        showModal('Có lỗi xảy ra. Vui lòng thử lại sau!');
    } finally {
        orderBtn.disabled = false;
        orderBtn.textContent = 'Đặt món';
    }
}

async function sendTelegramMessage(text) {
    // TODO: Move to backend for security
    const token = "7945639869:AAFHxGQiBZVEGp2LCHUdCy82ffsJaLfRkNA";
    const chatId = "-1002560521024";
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        })
    });

    const data = await response.json();
    if (!data.ok) {
        throw new Error(data.description || 'Lỗi không xác định từ Telegram');
    }
    return data;
}

async function sendToGoogleSheets(orderData) {
    const url = 'YOUR_APPS_SCRIPT_URL'; // Replace with your Google Apps Script web app URL
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    });

    if (!response.ok) {
        throw new Error('Failed to send to Google Sheets');
    }
    return await response.text();
}

function resetCart() {
    cart = [];
    saveCart();
    updateCartBadge();
    renderCart();

    document.querySelectorAll('.quantity-value').forEach(el => {
        el.textContent = '0';
    });
}

function openCart() {
    window.open(`cart.html?table=${tableNumber}`, '_blank');
}

function showModal(message) {
    const modal = document.getElementById('confirmationModal');
    document.getElementById('modalMessage').innerHTML = message;
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    loadCart();
    getTableFromURL();

    if (window.location.pathname.includes('QuetMaQr.html')) {
        renderMenu();
        updateCartBadge();
        document.getElementById('cart-icon').addEventListener('click', openCart);
    } else if (window.location.pathname.includes('cart.html')) {
        renderCart();
        updateCartBadge();
        document.querySelector('.submit-order').addEventListener('click', submitOrder);
    }
});