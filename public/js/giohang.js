let cart = JSON.parse(localStorage.getItem('cart')) || [];

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
        <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)" />
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
  if (!cart || cart.length === 0) {
    alert("Giỏ hàng đang trống!");
    return;
  }

  fetch('/api/cart/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ cart })
  })
  .then(data => {
    alert(data.message || "Đặt hàng thành công!");
    localStorage.removeItem("cart");
    cart = [];
    renderCart();
  })
  .catch(err => {
    console.error("Lỗi:", err);
    alert("Bạn cần đăng nhập để đặt hàng.");
  });
}

window.onload = renderCart;
