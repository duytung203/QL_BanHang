// Lấy tham số từ URL
const params = new URLSearchParams(window.location.search);
const orderId = params.get('orderId');
const amount = params.get('amount');

if (orderId && amount) {
  document.querySelector('.order-summary').innerHTML = `
    <h3>3. Tóm tắt đơn hàng</h3>
    <p>Mã đơn hàng: <strong>#${orderId}</strong></p>
    <p>Tổng cộng: <strong>${parseInt(amount).toLocaleString('vi-VN')} VND</strong></p>
  `;
}

async function xacNhanThanhToan() {
  const fullname = document.querySelector('input[name="fullname"]').value.trim();
  const email = document.querySelector('input[name="email"]').value.trim();
  const phone = document.querySelector('input[name="phone"]').value.trim();
  const address = document.querySelector('textarea[name="address"]').value.trim();
  const method = document.querySelector('select').value;

  const params = new URLSearchParams(window.location.search);
  const orderId = parseInt(params.get('orderId'));
  const amount = parseFloat(params.get('amount'));
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id ? parseInt(user.id) : null;

  // Kiểm tra dữ liệu đầu vào
  if (!fullname || !email || !phone || !address || !orderId || !amount || !method) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  try {
    // 1. Gửi thông tin người nhận
    const recipientRes = await fetch('/api/payment/recipients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, phone, address, user_id: userId })
    });

    const recipientData = await recipientRes.json();

    if (!recipientRes.ok) {
      throw new Error(recipientData.message || 'Không thể lưu thông tin người nhận.');
    }

    console.log("✅ Đã lưu người nhận, tiến hành thanh toán...");

    // 2. Gửi thông tin thanh toán
    const paymentRes = await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: orderId,
        user_id: userId,
        amount: amount,
        method
      })
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok) {
      throw new Error(paymentData.message || 'Thanh toán thất bại');
    }

    alert("✅ Thanh toán thành công!");
    window.location.href = "/giohang.html";

  } catch (err) {
    console.error("❌ Lỗi:", err);
    alert("Đã xảy ra lỗi: " + err.message);
  }
}





