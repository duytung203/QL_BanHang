let cart = JSON.parse(localStorage.getItem('cart')) || [];
// Hàm hiển thị giỏ hàng
function renderCart() {
  const tbody = document.getElementById('cart-body');
  tbody.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const row = document.createElement('tr');
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)">
      </td>
      <td>${item.price}</td>
      <td>${itemTotal}</td>
      <td><button onclick="removeItem(${index})">Xoá</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('total-price').textContent = total;
}
function updateQuantity(index, quantity) {
  cart[index].quantity = parseInt(quantity);
  saveCart();
}
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
}
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}
function checkout() {
  const rawCart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!Array.isArray(rawCart) || rawCart.length === 0) {
    alert("Giỏ hàng đang trống!");
    return;
  }

  // Chỉ gửi id + quantity
  const simplifiedCart = rawCart.map(item => ({
    id: item.id,
    quantity: item.quantity
  }));

  fetch('/api/cart/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Gửi cookie session
    body: JSON.stringify({ cart: simplifiedCart })
  })
    .then(res => res.json())
.then(data => {
  if (data.error || data.message?.includes('Lỗi')) {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: data.message || "Đã có lỗi xảy ra!",
      confirmButtonText: 'OK'
    });
    return;
  }

  Swal.fire({
    icon: 'success',
    title: 'Thành công!',
    text: data.message || "Đặt hàng thành công!",
    confirmButtonText: 'OK'
  }).then(() => {
    localStorage.removeItem("cart");
    cart = [];
    renderCart();
    location.reload();
  });
})
.catch(err => {
  console.error("Lỗi hệ thống:", err);
  Swal.fire({
    icon: 'error',
    title: 'Lỗi hệ thống!',
    text: "Đặt hàng thất bại. Vui lòng thử lại sau.",
    confirmButtonText: 'OK'
  });
});
}


// Hiển thị giỏ hàng khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
  fetch('/api/cart/my-orders', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      const ordersList = document.getElementById('orders-list');
      data.orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order');
        // Tạo header đơn hàng
        const orderHeader = document.createElement('div');
        orderHeader.classList.add('order-header');
        orderHeader.innerHTML = `
          <span>Đơn hàng #${order.id}</span>
          <span class="order-status status-${order.status ? order.status.toLowerCase() : 'pending'}">
            ${order.status || 'Đang xử lý'}
          </span>
          <span class="order-date">Ngày: ${new Date(order.created_at).toLocaleDateString()}</span>
        `;
        orderElement.appendChild(orderHeader);
        
        // Tạo danh sách sản phẩm và tính tổng
        const itemsList = document.createElement('div');
        itemsList.classList.add('items-list');
        
        let orderTotal = 0;
        order.items.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.classList.add('item');
          const itemPrice = item.price || 0;
          const itemQuantity = item.quantity || 1;
          const itemTotal = itemPrice * itemQuantity;
          orderTotal += itemTotal;
        
          itemElement.innerHTML = `
            <img src="${item.image || '/images/placeholder-product.png'}" alt="${item.name || 'Sản phẩm'}">
            <div class="item-name">${item.name || 'Không có tên'}</div>
            <div class="item-quantity">Số lượng: ${itemQuantity}</div>
            <div class="item-price">${itemPrice.toLocaleString('vi-VN')} VND</div>
            <div class="item-total">Thành tiền: ${itemTotal.toLocaleString('vi-VN')} VND</div>
          `;
          //
          itemsList.appendChild(itemElement);
        });

        orderElement.appendChild(itemsList);
        
        const orderFooter = document.createElement('div');
        orderFooter.classList.add('order-footer');
        // Tạo nút thanh toán
        const payButton = document.createElement('button');
        payButton.classList.add('pay-button');
        payButton.textContent = 'Thanh toán ngay';
        payButton.addEventListener('click', () => handlePayment(order.id, orderTotal));

        
        // Kiểm tra trạng thái để ẩn nút thanh toán nếu cần
        if (order.status === 'completed' || order.status === 'cancelled') {
          payButton.disabled = true;
          payButton.textContent = order.status === 'completed' ? 'Đã thanh toán' : 'Đã hủy';
          payButton.classList.add('disabled-button');
        }

        orderFooter.innerHTML = `
          <div class="total-section">
            Tổng cộng: 
            <span class="total-price">${orderTotal.toLocaleString('vi-VN')} VND</span>
          </div>
        `;
        orderFooter.appendChild(payButton);
        orderElement.appendChild(orderFooter);
        
        ordersList.appendChild(orderElement);
      });
    } else {
      alert('Không thể lấy thông tin đơn hàng: ' + (data.message || 'Bạn cần đăng nhập để xem đơn hàng.'));
    }
  })
  .catch(error => {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra khi tải dữ liệu: ' + error.message);
  });
});
// Hàm xử lý thanh toán
  function handlePayment(orderId, amount) {
  // Chuyển sang trang thanhtoan.html và truyền tham số qua URL
  const query = `thanhtoan.html?orderId=${orderId}&amount=${amount}`;
  window.location.href = query;
}

  function toggleHamburger() {
  const nav = document.getElementById('mainNav');
  const icon = document.querySelector('.hamburger');
  nav.classList.toggle('active');
  icon.textContent = nav.classList.contains('active') ? '✖' : '☰';
}

window.onload = renderCart;