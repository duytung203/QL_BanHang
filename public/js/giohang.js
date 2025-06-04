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
  .then(res => res.json())
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
        
        const orderHeader = document.createElement('div');
        orderHeader.classList.add('order-header');
        orderHeader.textContent = `Đơn hàng #${order.id} - Ngày: ${new Date(order.created_at).toLocaleDateString()}`;
        orderElement.appendChild(orderHeader);
        
        const itemsList = document.createElement('div');
        itemsList.classList.add('items-list');
        
        order.items.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.classList.add('item');
          
          const itemImage = document.createElement('img');
          itemImage.src = item.image;
          
          const itemName = document.createElement('div');
          itemName.classList.add('item-name');
          itemName.textContent = item.name;
          
          const itemPrice = document.createElement('div');
          itemPrice.classList.add('item-price');
          itemPrice.textContent = `${item.price} VND`; 

          itemElement.appendChild(itemImage);
          itemElement.appendChild(itemName);
          itemElement.appendChild(itemPrice);
          itemsList.appendChild(itemElement);
        });

        orderElement.appendChild(itemsList);
        ordersList.appendChild(orderElement);
      });
    } else {
      alert('Không thể lấy thông tin đơn hàng.');
    }
  })
  .catch(error => {
    console.error('Lỗi:', error);
    alert('Có lỗi xảy ra khi tải dữ liệu.');
  });
});

window.onload = renderCart;