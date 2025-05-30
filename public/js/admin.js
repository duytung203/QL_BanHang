
async function loadUsers() {
  const res = await fetch('/api/user');
  const users = await res.json();
  const tbody = document.querySelector('#userTable tbody');
  tbody.innerHTML = '';
  users.forEach(u => {
    tbody.innerHTML += `
      <tr>
        <td>${u.username}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>
          <button onclick="resetPassword(${u.id})">Reset Mật khẩu</button>
          <button onclick="deleteUser(${u.id})">Xoá</button>
        </td>
      </tr>`;
  });
}

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

async function deleteUser(id) {
  if (!confirm('Bạn chắc chắn muốn xoá?')) return;
  const res = await fetch(`/api/user/${id}`, { method: 'DELETE' });
  const data = await res.json();
  alert(data.message);
  loadUsers();
}

async function resetPassword(id) {
  const res = await fetch(`/api/user/${id}/reset`, { method: 'PUT' });
  const data = await res.json();
  alert(data.message);
  loadUsers();
}
loadUsers();

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  window.location.href = 'index.html';
});


let imageBase64 = ''; // Lưu ảnh dạng base64 hoặc upload lên server

function previewImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      imageBase64 = e.target.result;
      const preview = document.getElementById('preview');
      preview.src = imageBase64;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}
 function createProduct() {
  const name = document.getElementById('productName').value;
  const price = document.getElementById('productPrice').value;
  const mota = document.getElementById('productDescription').value;
  const category = document.getElementById('productCategory').value;
  const imageFile = document.getElementById('productImage').files[0];
    if (!name || !price ||!mota||!category||!imageFile) {
      alert("Vui lòng điền đầy đủ thông tin sản phẩm và chọn ảnh!");
      return;
    }}

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

// delete san pham
async function deleteProduct(id) {
  if (!confirm('Bạn chắc chắn muốn xoá?')) return;
  const res = await fetch(`/api/products${id}`, { method: 'DELETE' });
  const data = await res.json();
  alert(data.message);
  loadProducts();
}
// Gọi khi trang tải
loadProducts();






