// Quản lý người dùng
async function loadUsers() {
  const res = await fetch('/api/user');
  const users = await res.json();
  const tbody = document.querySelector('#userTable tbody');
  tbody.innerHTML = '';

  const currentUser = JSON.parse(localStorage.getItem('user'));
  const currentUserId = parseInt(currentUser?.id);

  users.forEach(u => {
    const isLocked = parseInt(u.is_locked) === 1;

    tbody.innerHTML += `
      <tr>
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>
          <span style="color: ${isLocked ? 'red' : 'green'};">
            ${isLocked ? 'Đã khóa' : 'Hoạt động'}
          </span>
        </td>
        <td>${
        u.role === 'admin'
          ? '<i>Không thể hành động</i>'
          : (u.id === currentUserId
              ? '<i>Không thể tự khóa</i>'
              : `<button onclick="toggleLock(${u.id}, ${isLocked})">
                  ${isLocked ? 'Mở khóa' : 'Khóa'}
                </button>`)}
        </td>
        <td>${u.role === 'admin'
          ? '<i>Không thể hành động</i>'
          : `<button onclick="resetPassword(${u.id})">Reset Mật khẩu</button>
          <button onclick="deleteUser(${u.id})">Xoá</button>`}
        </td>
      </tr>
    `;
  });
}


function toggleLock(userId, isLocked) {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  if (userId === currentUser?.id) {
    alert("Bạn không thể tự khóa tài khoản của chính mình.");
    return;
  }
const confirmMsg = isLocked ? "Bạn có chắc muốn <b>mở khóa</b> tài khoản này?" : "Bạn có chắc muốn <b>khóa</b> tài khoản này?";
Swal.fire({
  title: 'Xác nhận',
  html: confirmMsg,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonText: isLocked ? 'Mở khóa' : 'Khóa',
  cancelButtonText: 'Hủy',
  reverseButtons: true
}).then(result => {
  if (!result.isConfirmed) return;

  // Gửi request nếu xác nhận
  fetch('/api/user/lock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      lock: !isLocked,
      currentAdminId: parseInt(JSON.parse(localStorage.getItem('user'))?.id)
    })
  })
    .then(res => {
      if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
      return res.json();
    })
    .then(result => {
      if (result.success) {
        Swal.fire('Thành công', 'Trạng thái tài khoản đã được cập nhật.', 'success');
        loadUsers();
      } else {
        Swal.fire('Lỗi', result.error || 'Có lỗi xảy ra khi cập nhật.', 'error');
      }
    })
    .catch(err => {
      console.error(err);
      Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ.', 'error');
    });
});
}
// Tạo người dùng mới
async function createUser() {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  const res = await fetch('/api/user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, role })
  });

  const data = await res.json();
  alert(data.message);
  loadUsers();
}
// Xoá người dùng
async function deleteUser(id) {
  if (!confirm('Bạn chắc chắn muốn xoá?')) return;
  const res = await fetch(`/api/user/${id}`, { method: 'DELETE' });
  const data = await res.json();
  alert(data.message);
  loadUsers();
}
// Reset mật khẩu người dùng
async function resetPassword(id) {
  const res = await fetch(`/api/user/${id}/reset`, { method: 'PUT' });
  const data = await res.json();
  alert(data.message);
  loadUsers();
}
loadUsers();

function searchUser() {
  const keyword = document.getElementById('searchUserInput').value.trim();
  if (!keyword) return;

  fetch(`/api/user/search?keyword=${encodeURIComponent(keyword)}`)
    .then(res => res.json())
    .then(data => {
      renderUsers(data); // Hàm render lại danh sách
    })
    .catch(err => console.error('Lỗi tìm user:', err));
}
function renderUsers(users) {
  const tbody = document.querySelector('#userTable tbody');
  tbody.innerHTML = '';
  users.forEach(u => {
    const status = u.is_locked ? 'Đang bị khóa' : 'Hoạt động';
    const statusColor = u.is_locked ? 'red' : 'green';

    tbody.innerHTML += `
      <tr>
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td style="color:${statusColor}">${status}</td>
        <td>
          <button onclick="toggleLock(${u.id}, ${u.is_locked})">${u.is_locked ? 'Mở khóa' : 'Khóa'}</button>
        </td>
        <td>
          <button onclick="resetPassword(${u.id})">Reset Mật khẩu</button>
          <button onclick="deleteUser(${u.id})">Xoá</button>
        </td>
      </tr>
    `;
  });
}


document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  window.location.href = 'index.html';
});
// Quản lý sản phẩm
// Tạo sản phẩm mới
const createProduct = async () => {
  const data = {
    name: document.querySelector('[name="name"]').value,
    price: document.querySelector('[name="price"]').value,
    image: document.querySelector('[name="image"]').value,
    category: document.querySelector('[name="category"]').value,
    mota: document.querySelector('[name="mota"]').value,
  };

  try {
    const response = await fetch('/api/products/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message);
      window.location.reload();
    } else {
      const error = await response.json();
      alert(error.message);
    }
  } catch (error) {
    console.error('Lỗi khi gửi dữ liệu:', error);
  }
};




// Load danh sách sản phẩm
function loadProducts() {
  fetch('/api/products')  
    .then(res => res.json())
    .then(products => {
      const tbody = document.querySelector('#productTable tbody');
      tbody.innerHTML = '';
      products.forEach((p, index) => {
        tbody.innerHTML += `
          <tr>
            <td>${p.id}</td>
            <td><img src="${p.image}" style="width:50px;"></td>
            <td>${p.name}</td>
            <td>${p.price}</td>
            <td>${p.category}</td>
            <td>${p.mota}</td>
            <td><button onclick="deleteProduct(${p.id})">Xoá</button></td>
            <td><button onclick="UpdateProduct(${p.id})">Sửa</button></td>
          </tr>
        `;
      });
    });
}
function searchProducts() {
  const keyword = document.getElementById('searchInput').value.trim();

  if (!keyword) {
    loadProducts();
    return;
  }

  fetch(`/api/products/search?keyword=${encodeURIComponent(keyword)}`)
    .then(res => res.json())
    .then(products => {
      const tbody = document.querySelector('#productTable tbody');
      tbody.innerHTML = '';

      if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Không tìm thấy sản phẩm.</td></tr>';
        return;
      }

      products.forEach((p, index) => {
        tbody.innerHTML += `
          <tr>
            <td>${p.id}</td>
            <td><img src="${p.image}" style="width:50px;"></td>
            <td>${p.name}</td>
            <td>${p.price}</td>
            <td>${p.category}</td>
            <td>${p.mota}</td>
            <td><button onclick="deleteProduct(${p.id})">Xoá</button></td>
            <td><button onclick="UpdateProduct(${p.id})">Sửa</button></td>
          </tr>
        `;
      });
    })
    .catch(error => {
      console.error('Lỗi tìm kiếm:', error);
    });
}

let currentEditingId = null;

// Mở modal chỉnh sửa sản phẩm
function openEditModal(product) {
  currentEditingId = product.id;

  // Fill thông tin sản phẩm
  document.getElementById('editName').value = product.name;
  document.getElementById('editPrice').value = product.price;
  document.getElementById('editCategory').value = product.category;
  document.getElementById('editImage').value = product.image;
  document.getElementById('editMota').value = product.mota;

  // Nếu có khuyến mãi thì fill luôn
  if (product.promotion) {
    document.getElementById('editDiscount').value = product.promotion.discount_percent || '';
    document.getElementById('editStartDate').value = product.promotion.start_date || '';
    document.getElementById('editEndDate').value = product.promotion.end_date || '';
  } else {
    document.getElementById('editDiscount').value = '';
    document.getElementById('editStartDate').value = '';
    document.getElementById('editEndDate').value = '';
  }

  document.getElementById('editModal').style.display = 'block';
}

// Đóng modal chỉnh sửa sản phẩm
function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

// Gọi khi nhấn nút "Sửa"
async function UpdateProduct(id) {
  try {
    const res = await fetch('/api/products'); // Giả định route trả về danh sách sản phẩm cùng khuyến mãi
    const products = await res.json();
    const product = products.find(p => p.id === id);

    if (!product) return alert('Không tìm thấy sản phẩm');
    openEditModal(product);

  } catch (err) {
    console.error('Lỗi khi lấy thông tin sản phẩm:', err);
  }
}

// Gửi request PUT để cập nhật
async function submitUpdate() {
  const name = document.getElementById('editName').value;
  const price = document.getElementById('editPrice').value;
  const category = document.getElementById('editCategory').value;
  const image = document.getElementById('editImage').value;
  const mota = document.getElementById('editMota').value;

  // Lấy thông tin khuyến mãi
  const discount_percent = parseInt(document.getElementById('editDiscount').value) || null;
  const start_date = document.getElementById('editStartDate').value || null;
  const end_date = document.getElementById('editEndDate').value || null;
// Kiểm tra tính hợp lệ của ngày
 if (start_date && end_date) {
  const start = new Date(start_date);
  const end = new Date(end_date);
  if (start >= end) {
    Swal.fire({
      icon: 'error',
      title: 'Ngày không hợp lệ',
      text: 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc.',
      confirmButtonText: 'OK'
    });
    return;
  }
}


  const body = {
    name,
    price,
    category,
    image,
    mota,
    promotion: {
      discount_percent,
      start_date,
      end_date
    }
  };

  try {
    const updateRes = await fetch(`/api/products/${currentEditingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await updateRes.json();

    if (!updateRes.ok) throw new Error(result.message || 'Cập nhật thất bại');

    alert(result.message);
    closeEditModal();
    loadProducts();
  } catch (err) {
    console.error('Lỗi cập nhật sản phẩm:', err);
    alert('Đã xảy ra lỗi khi cập nhật sản phẩm');
  }
}



// delete san pham
async function deleteProduct(id) {
  if (!confirm('Bạn chắc chắn muốn xoá?')) return;
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });

    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      const errMsg = contentType?.includes('application/json')
        ? (await res.json()).error
        : await res.text();
      throw new Error(errMsg || 'Xoá thất bại');
    }

    const data = await res.json();
    alert(data.message);
    loadProducts();
  } catch (err) {
    console.error('Lỗi xoá sản phẩm:', err);
    alert('Có lỗi xảy ra khi xoá sản phẩm.');
  }
}

loadProducts();
// menu 
function showSection(sectionId) {
  const sections = ['userSection', 'productSection', 'orderSection', 'promotionSection', 'reportSection', 'coinSection'];

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = 'block';
    if (sectionId === 'reportSection') {
      setTimeout(() => {
        loadCharts(); 
      }, 100); 
    }
  }
}
window.onload = () => {
  showSection('reportSection');
};

  // Hàm load danh sách đơn hàng
async function loadOrders() {
  const res = await fetch('/api/cart/admin/orders');
  const data = await res.json();

  const tbody = document.querySelector('#order-list');
  tbody.innerHTML = '';

  if (data.orders && data.orders.length > 0) {
    data.orders.forEach(order => {
       let statusButtons = `
        <select onchange="updateOrderStatus(${order.id}, this.value)">
          <option value="">Trạng thái đơn</option>
          <option value="processing">Đang xử lý</option>  
          <option value="completed">Hoàn thành</option>
        </select>`;
        let deleteButton = `
          <button onclick="deleteOrder(${order.id})">Xóa</button>`;
      tbody.innerHTML += `
        <tr>
          <tr data-order-id="${order.id}">
          <td>${order.id}</td>
          <td>${order.username}</td>
          <td>${order.total_price}</td>
          <td>${order.status}</td>
          <td>${new Date(order.created_at).toLocaleString()}</td>
          <td>${statusButtons} ${deleteButton}</td>
        </tr>`;
    });
  } else {
    tbody.innerHTML = '<tr><td colspan="5">Không có đơn hàng nào.</td></tr>';
  }
}
// Hàm cập nhật trạng thái đơn hàng
async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`/api/cart/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Không thể cập nhật trạng thái đơn hàng');
    }
    const updatedOrder = await response.json();
    const row = document.querySelector(`tr[data-order-id="${orderId}"]`);
    const statusCell = row.querySelector('td:nth-child(4)');
    statusCell.textContent = updatedOrder.status;
    alert('Trạng thái đơn hàng đã được cập nhật');
  } catch (error) {
    console.error(error);
    alert('Có lỗi xảy ra khi cập nhật trạng thái');
  }
}
// Hàm xóa đơn hàng
async function deleteOrder(orderId) {
  if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;

  try {
    const response = await fetch(`/api/cart/orders/${orderId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Không thể xóa đơn hàng');
    }
    const row = document.querySelector(`tr[data-order-id="${orderId}"]`);
    if (row) row.remove();
    alert('Đã xóa đơn hàng thành công');
  } catch (error) {
    console.error(error);
    alert('Có lỗi xảy ra khi xóa đơn hàng');
  }
}


// Gọi loadOrders sau khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', function() {
  loadOrders();
});
// Hàm thêm hoặc cập nhật khuyến mãi cho sản phẩm
function updateOrInsertPromotion(productId, promotion, callback) {
  if (
    promotion.discount_percent === undefined || promotion.discount_percent === null ||
    !promotion.start_date ||
    !promotion.end_date
  ) {
    return callback(null, 'Không có thông tin khuyến mãi hợp lệ');
  }

  const checkSql = 'SELECT * FROM promotions WHERE product_id = ?';
  db.query(checkSql, [productId], (err, rows) => {
    if (err) return callback(err);

    const promoValues = [
      promotion.discount_percent,
      promotion.start_date,
      promotion.end_date,
      productId
    ];

    if (rows.length > 0) {
      // Đã có khuyến mãi, update
      const updateSql = `
        UPDATE promotions
        SET discount_percent = ?, start_date = ?, end_date = ?
        WHERE product_id = ?
      `;
      db.query(updateSql, promoValues, (err2) => {
        if (err2) return callback(err2);
        return callback(null, 'Cập nhật khuyến mãi thành công');
      });
    } else {
      // Chưa có, thêm mới
      const insertSql = `
        INSERT INTO promotions (discount_percent, start_date, end_date, product_id)
        VALUES (?, ?, ?, ?)
      `;
      db.query(insertSql, promoValues, (err3) => {
        if (err3) return callback(err3);
        return callback(null, 'Thêm khuyến mãi thành công');
      });
    }
  });
}


//load danh sách khuyến mãi
async function loadPromotions() {
  try {
    const res = await fetch('/api/products/khuyenmai');
    const promotions = await res.json();
    const tbody = document.querySelector('#promotionTableBody');
    tbody.innerHTML = '';
    promotions.forEach(p => {
      tbody.innerHTML += `
        <tr>
          <td>${p.product_id}</td>
          <td>${p.discount_percent}%</td>
          <td>${new Date(p.start_date).toLocaleDateString()}</td>
          <td>${new Date(p.end_date).toLocaleDateString()}</td>
          <td><button onclick="updatePromotion(${p.product_id})">Cập nhật</button></td>
          <td><button onclick="deletePromotion(${p.product_id})">Xoá</button></td>
        </tr>`;
    });
  } catch (err) {
    console.error('Lỗi loadPromotions:', err);
  }
}
// Gọi loadPromotions sau khi DOM đã tải xong
document.addEventListener('DOMContentLoaded', function() {
  loadPromotions();
});

// Hàm xóa khuyến mãi
async function deletePromotion(productId) {
  if (!confirm(`Bạn có chắc chắn muốn xoá khuyến mãi cho sản phẩm ID ${productId}?`)) return;

  try {
    const res = await fetch(`/api/products/promotions/${productId}`, {
      method: 'DELETE'
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message || 'Đã xoá khuyến mãi thành công');
      loadPromotions(); // Refresh danh sách sau khi xoá
    } else {
      alert(data.error || 'Xoá thất bại');
    }
  } catch (err) {
    console.error('Lỗi khi xoá khuyến mãi:', err);
    alert('Lỗi kết nối tới server khi xoá khuyến mãi');
  }
}
// Hàm mở modal chỉnh sửa khuyến mãi  
function updatePromotion(productId, discount, startDate, endDate) {
  document.getElementById('editPromotionProductId').value = productId;
  document.getElementById('editPromotionDiscount').value = discount || '';
  document.getElementById('editPromotionStartDate').value = startDate || '';
  document.getElementById('editPromotionEndDate').value = endDate || '';
  document.getElementById('promotionEditModal').style.display = 'block';
}
// Hàm cập nhật khuyến mãi
function submitPromotionUpdate() {
  const productId = document.getElementById('editPromotionProductId').value;
  const discount = document.getElementById('editPromotionDiscount').value;
  const startDate = document.getElementById('editPromotionStartDate').value;
  const endDate = document.getElementById('editPromotionEndDate').value;

  fetch(`/api/products/promotions/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      discount,
      startDate,
      endDate,
    }),
  })
    .then(res => res.json())
    .then(data => {
      alert("Cập nhật khuyến mãi thành công!");
      closePromotionEditModal();
      loadPromotions();
    })
    .catch(err => {
      console.error(err);
      alert("Lỗi khi cập nhật khuyến mãi!");
    });
}
// Hàm đóng modal chỉnh sửa khuyến mãi
function closePromotionEditModal() {
  document.getElementById('promotionEditModal').style.display = 'none';
}



async function fetchReportData(endpoint) {
  try {
    const response = await fetch(`/api/reports/${endpoint}`);
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error loading ${endpoint}:`, error);
    return [];
  }
}

async function renderTopProductsChart() {
  const canvas = document.getElementById('topProductsChart');
  const ctx = canvas.getContext('2d');
  Chart.getChart(canvas)?.destroy();

  const data = await fetchReportData('top-products');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item.name),
      datasets: [{
        label: 'Số lượng đã bán',
        data: data.map(item => parseInt(item.total_sold)),
        backgroundColor: 'rgba(21, 199, 80, 0.81)'
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Top 5 sản phẩm bán chạy' } }
    }
  });
}

async function renderRevenueChart() {
  const canvas = document.getElementById('revenueChart');
  const ctx = canvas.getContext('2d');
  Chart.getChart(canvas)?.destroy();

  const data = await fetchReportData('revenue-daily');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(item => item.date),
      datasets: [{
        label: 'Doanh thu',
        data: data.map(item => parseFloat(item.total_revenue)),
        borderColor: 'rgb(97, 94, 102)',
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Doanh thu 7 ngày gần nhất' } }
    }
  });
}

async function renderOrderStatusChart() {
  const canvas = document.getElementById('orderStatusChart');
  const ctx = canvas.getContext('2d');
  Chart.getChart(canvas)?.destroy();

  const data = await fetchReportData('order-status');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.map(item => item.status),
      datasets: [{
        label: 'Số đơn',
        data: data.map(item => parseInt(item.count)),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: 'Tình trạng đơn hàng' } }
    }
  });
}

function loadCharts() {
  renderTopProductsChart();
  renderRevenueChart();
  renderOrderStatusChart();
  
}
// coin
  function openCoinModal() {
    document.getElementById("coinModal").style.display = "block";
  }

  function closeCoinModal() {
    document.getElementById("coinModal").style.display = "none";
    document.getElementById("coinResult").innerText = "";
  }

  async function sendCoin() {
    const userId = document.getElementById("coinUserId").value;
    const amount = document.getElementById("coinAmount").value;
    const desc = document.getElementById("coinDesc").value;

    const res = await fetch('/api/coin/admin/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: parseInt(userId), amount: parseInt(amount), description: desc })
    });

    const data = await res.json();
    document.getElementById("coinResult").innerText = data.message || data.error;

    if (data.message) {
      document.getElementById("coinUserId").value = '';
      document.getElementById("coinAmount").value = '';
      document.getElementById("coinDesc").value = '';
    }
  }

  // Close modal nếu click bên ngoài modal content
  window.onclick = function(event) {
    const modal = document.getElementById("coinModal");
    if (event.target === modal) closeCoinModal();
  }





