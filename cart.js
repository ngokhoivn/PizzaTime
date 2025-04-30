function openCartModal() {
    const modal = document.getElementById('cartModal');
    renderCart();
    modal.style.display = 'flex';
}

function closeCartModal() {
    const modal = document.getElementById('cartModal');
    modal.style.display = 'none';
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

        showModal(`Đơn hàng của bạn đã được gửi đến nhà bếp!
<br>Bàn số: ${tableNumber}`);
        resetCart();
        closeCartModal();

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
    const url = 'https://script.google.com/macros/s/AKfycbyP_Q1u_cI85pDUCYubGikyYxlRV2VZouSCvIulzPFL9FieOArNmb42N4hwBvkesRhc/exec';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...orderData,
                token: "ngokhoivn123!@#" // Phải giống với token trong Apps Script
            }),
        });
        const result = await response.json();
        if (result.status === 'error') {
            throw new Error(result.message);
        }
        return result;
    } catch (error) {
        console.error('Lỗi khi gửi đến Google Sheets:', error);
        throw error;
    }
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

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.includes('QuetMaQr.html')) {
        document.querySelector('.submit-order').addEventListener('click', submitOrder);
    }
});