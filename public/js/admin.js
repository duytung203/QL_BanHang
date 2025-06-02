
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

const createProduct = async () => {
  const data = {
    name: document.querySelector('[name="name"]').value,
    price: document.querySelector('[name="price"]').value,
    image: document.querySelector('[name="image"]').value,
    category: document.querySelector('[name="category"]').value,
    mota: document.querySelector('[name="mota"]').value,
  };

  try {
    const response = await fetch('http://localhost:3000/api/products/add', {
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

let currentEditingId = null;

function openEditModal(product) {
  currentEditingId = product.id;
  document.getElementById('editName').value = product.name;
  document.getElementById('editPrice').value = product.price;
  document.getElementById('editCategory').value = product.category;
  document.getElementById('editImage').value = product.image;
  document.getElementById('editMota').value = product.mota;
  document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function UpdateProduct(id) {
  try {
    const res = await fetch('/api/products');
    const products = await res.json();
    const product = products.find(p => p.id === id);

    if (!product) return alert('Không tìm thấy sản phẩm');

    openEditModal(product);

  } catch (err) {
    console.error('Lỗi khi lấy thông tin sản phẩm:', err);
  }
}
async function submitUpdate() {
  const name = document.getElementById('editName').value;
  const price = document.getElementById('editPrice').value;
  const category = document.getElementById('editCategory').value;
  const image = document.getElementById('editImage').value;
  const mota = document.getElementById('editMota').value;

  try {
    const updateRes = await fetch(`/api/products/${currentEditingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, category, image, mota })
    });

    if (!updateRes.ok) {
      const error = await updateRes.json();
      throw new Error(error.message || 'Cập nhật thất bại');
    }

    const result = await updateRes.json();
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






