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
  const amount = window.finalAmount || parseFloat(params.get('amount'));
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id ? parseInt(user.id) : null;

  // Kiểm tra dữ liệu đầu vào
  if (!fullname || !email || !phone || !address || !orderId || !amount || !method) {
    Swal.fire({
    icon: 'warning',
    title: '⚠️ Thiếu thông tin',
    text: 'Vui lòng nhập đầy đủ họ tên, email, số điện thoại, địa chỉ và phương thức thanh toán.',
    confirmButtonColor: '#f57c00'
  });
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
  Swal.fire({
    icon: 'error',
    title: '❌ Lỗi khi lưu thông tin người nhận',
    text: recipientData.message || 'Không thể lưu thông tin người nhận. Vui lòng thử lại.',
    confirmButtonColor: '#d33'
  });
  return; // Dừng tiến trình thanh toán
}

Swal.fire({
  icon: 'info',
  title: '✅ Đã lưu thông tin người nhận',
  text: 'Tiến hành thanh toán...',
  timer: 1500,
  showConfirmButton: false
});


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
  Swal.fire({
    icon: 'error',
    title: '❌ Thanh toán thất bại',
    text: paymentData.message || 'Đã xảy ra lỗi khi thanh toán. Vui lòng thử lại.',
    confirmButtonColor: '#e53935'
  });
  return; // Dừng tiến trình nếu thất bại
}

Swal.fire({
  icon: 'success',
  title: '✅ Thanh toán thành công!',
  text: 'Cảm ơn bạn đã đặt hàng!',
  timer: 2000,
  showConfirmButton: false
}).then(() => {
  window.location.href = "/giohang.html";
});


  } catch (err) {
    console.error("❌ Lỗi:", err);
    alert("Đã xảy ra lỗi: " + err.message);
  }
}
// voucher
function applyVoucher() {
  const code = document.getElementById('voucherCode').value.trim();
  const params = new URLSearchParams(window.location.search);
  const totalPrice = parseFloat(params.get('amount'));

  if (!code || isNaN(totalPrice)) {
    Swal.fire('⚠️ Thiếu dữ liệu', 'Vui lòng nhập mã voucher hoặc thiếu giá trị thanh toán.', 'warning');
    return;
  }

  fetch('/api/coin/apply-voucher', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, totalPrice })
  })
    .then(res => res.json())
    .then(data => {
      const result = document.getElementById('voucherResult');
      const orderSummary = document.querySelector('.order-summary');

      if (data.error) {
        result.innerHTML = `<span style="color:red">${data.error}</span>`;
      } else {
        result.innerHTML = `
          <span style="color:green">${data.message}</span><br>
          <strong>Tổng còn lại: ${data.finalTotal.toLocaleString()}đ</strong>
        `;

        // ❌ Xoá phần hiển thị cũ nếu đã có
        const existingDiscount = document.getElementById('voucherApplied');
        if (existingDiscount) existingDiscount.remove();

        // ✅ Thêm phần hiển thị mới
        const discountInfo = document.createElement('div');
        discountInfo.id = 'voucherApplied';
        discountInfo.innerHTML = `
          <p style="color:green">Đã áp dụng voucher giảm ${data.discount.toLocaleString()}đ</p>
          <p><strong>Tổng thanh toán: ${data.finalTotal.toLocaleString()} VND</strong></p>
        `;
        orderSummary.appendChild(discountInfo);

        // Cập nhật biến toàn cục
        window.finalAmount = data.finalTotal;
      }
    })
    .catch(err => {
      console.error('Lỗi khi áp dụng voucher:', err);
      Swal.fire('❌ Lỗi', 'Không thể áp dụng voucher, hãy thử lại.', 'error');
    });
}





