let products = [];
let currentProductList = [];
let currentPage = 1;
const productsPerPage = 15;
// Lấy danh sách sản phẩm từ API và hiển thị
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    currentProductList = data;
    renderProducts();
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm:", error);
  }
});
// Hàm hiển thị danh sách sản phẩm và phân trang
function renderProducts(page = 1) {
  const container = document.getElementById("product-list");
  const direction = page > currentPage ? 'left' : 'right';
  const oldPage = container.querySelector(".product-page");
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const pageProducts = currentProductList.slice(start, end);
  container.innerHTML = "";

  const newPage = document.createElement("div");
  newPage.className = `product-page slide-in-${direction}`;

  pageProducts.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.className = "product-image";
    image.onclick = () => location.href = `chitietsanpham.html?id=${product.id}`;

    const title = document.createElement("h3");
    title.textContent = product.name;
    title.style.cursor = "pointer";
    title.onclick = () => location.href = `chitietsanpham.html?id=${product.id}`;

    const price = document.createElement("p");
    price.textContent = `Giá: ${product.price.toLocaleString()}đ`;

    const button = document.createElement("button");
    button.textContent = "Thêm vào giỏ";
    button.addEventListener("click", () => showQuantityModal(product));

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(button);

    newPage.appendChild(card);
  });

  container.appendChild(newPage);
  requestAnimationFrame(() => {
    newPage.classList.add("slide-in", "active1");
    if (oldPage) {
      oldPage.classList.add(`slide-out-${direction}`);
      oldPage.classList.remove("active1");
    }
  });
// Xóa trang cũ sau khi hiệu ứng hoàn tất
  setTimeout(() => {
    if (oldPage && container.contains(oldPage)) {
      container.removeChild(oldPage);
    }
    newPage.classList.remove(`slide-in-${direction}`, "slide-in");
  }, 500);

  currentPage = page;
  renderPagination();
}

// Hàm hiển thị phân trang
function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(currentProductList.length / productsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = (i === currentPage) ? "active1" : "";
    btn.onclick = () => renderProducts(i);
    pagination.appendChild(btn);
  }
}
// Hàm chuyển hướng đến giỏ hàng
 function goToCart() {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Bạn cần đăng nhập để truy cập giỏ hàng!');

    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
      loginModal.style.display = "flex";
    } else {
      alert("Không tìm thấy modal đăng nhập.");
    }
    return;
  }

  window.location.href = 'giohang.html';
}

let selectedProduct = null;
// Hàm hiển thị modal để chọn số lượng sản phẩm
function showQuantityModal(product) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert("Bạn vui lòng đăng nhập");
    return;
  }
  selectedProduct = product;
  document.getElementById("quantityInput").value = 1;
  document.getElementById("quantityModal").style.display = "flex";
}


// Hàm xác nhận thêm sản phẩm vào giỏ hàng
function confirmAddToCart() {
  const quantity = parseInt(document.getElementById("quantityInput").value);
  if (!selectedProduct || isNaN(quantity) || quantity <= 0) {
    alert("Số lượng không hợp lệ");
    return;
  }
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const index = cart.findIndex(item => item.id === selectedProduct.id);
  if (index !== -1) {
    cart[index].quantity += quantity;
  } else {
    cart.push({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      image: selectedProduct.image,
      quantity: quantity,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  closeQuantityModal();
  alert("Đã thêm vào giỏ hàng!");
}
// Hàm đóng modal chọn số lượng
function closeQuantityModal() {
  document.getElementById("quantityModal").style.display = "none";
  selectedProduct = null;
}
// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").textContent = total;
}
// Lưu giỏ hàng vào localStorage
function saveCart(cart) {
  const userId = localStorage.getItem("userId");
  if (!userId) return;
  let allCarts = JSON.parse(localStorage.getItem("carts")) || {};
  allCarts[userId] = cart;
  localStorage.setItem("carts", JSON.stringify(allCarts));
}
// Tải giỏ hàng từ localStorage
function loadCart() {
  const userId = localStorage.getItem("userId");
  if (!userId) return [];
  const allCarts = JSON.parse(localStorage.getItem("carts")) || {};
  return allCarts[userId] || [];
}
let cart = loadCart();

// Cập nhật số lượng sản phẩm trong giỏ hàng khi trang được tải
function toggleModal(show) {
  document.getElementById('loginModal').style.display = show ? 'flex' : 'none';
}

fetch('index.html')
  .then(response => response.text())
  .then(htmlString => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const modal = doc.querySelector('.modal'); 
    document.getElementById('modal-container').appendChild(modal);
  });         

// Xử lý sự kiện click bên ngoài modal để đóng modal
window.onclick = function(event) {
  const loginModal = document.getElementById("loginModal");
  const cartModal = document.getElementById("cartModal");
  const quantityModal = document.getElementById("quantityModal");
  if (event.target === loginModal) toggleModal(false);
  if (event.target === cartModal) cartModal.style.display = "none";
  if (event.target === quantityModal) closeQuantityModal();
}
renderProducts();
  document.querySelectorAll('.toggle-submenu').forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault(); // ngan k cho chuyen trang
      const parent = this.parentElement;
      parent.classList.toggle('open');
    });
  });
// hàm xử lý sự kiện click vào nút đăng nhập
  async function login() {
  const email = document.querySelector('#loginForm input[type="text"]').value;
  const password = document.querySelector('#loginForm input[type="password"]').value;
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: "include",
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('userId', data.userId);
     localStorage.removeItem("cart"); 
    updateUserMenu();      
    toggleModal(false);    
    alert(data.message);   
    if (data.role === 'admin') {
      localStorage.setItem('role', 'admin');
      alert("Đăng nhập với quyền quản trị viên");
      window.location.href = '/admin.html';
    } else {
      window.location.href = '/index.html';
    }
  } else {
    alert(data.message || 'Đăng nhập thất bại');
  }
}


// Xử lý sự kiện click vào nút đăng ký
document.getElementById('registerBtn')?.addEventListener('click', register);
async function register() {
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();
  alert(data.message);
  if (res.ok) {
    switchTab('login');
  }
}


// chuyen tab dangnhap/dangky
function switchTab(tab) {
  document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
  const buttons = document.querySelectorAll('.tabs button');
  buttons.forEach(btn => btn.classList.remove('active'));
  buttons[tab === 'login' ? 0 : 1].classList.add('active');
}

document.addEventListener("DOMContentLoaded", () => {
  updateUserMenu();
});
// Cập nhật menu người dùng khi trang được tải
function updateUserMenu() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const userMenu = document.getElementById('userMenu');
  if (token && username && userMenu) {
    userMenu.innerHTML = `
      <div class="dropdown">
        <button class="dropbtn" onclick="toggleUserMenu()">Xin chào ${username}</button>
        <div class="dropdown-content" id="userDropdown">
          <a href="nguoidung.html" target="_blank">Thông tin người dùng</a>
          <a href="#">Lịch sử giao dịch</a>
          <a href="#" onclick="logout()">Đăng xuất</a>
          </div>
      </div>
        <button class="cart-btn" onclick="goToCart()">Giỏ hàng (<span id="cart-count">0</span>)</button></div> 
      </div>
    `;
    const modal = document.getElementById('loginModal');
    if (modal) toggleModal(false);
  }
}
// Hàm hiển thị menu người dùng
function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('show');
}
// hàm xử lý sự kiện đăng xuất
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem("cart"); 
  const userMenu = document.getElementById('userMenu');
  userMenu.innerHTML = `
    <button class="login-btn" onclick="toggleModal(true)">Đăng nhập</button>
    <button class="cart-btn" onclick="goToCart()">Giỏ hàng (<span id="cart-count">0</span>)</button>
  `;
}

let slideIndex = 0;
let slideInterval;
// Hàm khởi tạo banner
function initBanner() {
  showSlides(slideIndex);
  startSlideShow();

  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide(index);
      resetInterval();
    });
  });
}
// Hàm hiển thị slide hiện tại
function showSlides(index) {
  const slides = document.querySelectorAll(".banner-slide");
  const dots = document.querySelectorAll(".dot");
  const total = slides.length;

  slideIndex = index % total;
  if (slideIndex < 0) slideIndex = total - 1;

  slides.forEach((slide, i) => {
    slide.classList.remove("active");
    dots[i].classList.remove("active");
  });

  slides[slideIndex].classList.add("active");
  dots[slideIndex].classList.add("active");
}
// Hàm chuyển đến slide hiện tại hoặc tiếp theo
function currentSlide(n) {
  showSlides(n);
}
// Hàm chuyển đến slide tiếp theo hoặc trước đó
function plusSlides(n) {
  showSlides(slideIndex + n);
}
// Hàm bắt đầu slideshow tự động
function startSlideShow() {
  slideInterval = setInterval(() => {
    plusSlides(1);
  }, 3000);
}
// Hàm đặt lại khoảng thời gian slideshow
function resetInterval() {
  clearInterval(slideInterval);
  startSlideShow();
}

document.addEventListener("DOMContentLoaded", initBanner);

// Hàm lọc sản phẩm theo danh mục
function filterCategory(category) {
  currentProductList = products.filter(p => p.category === category);
  renderProducts(1);
}

//load danh muc
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    products = data;

    const urlParams = new URLSearchParams(window.location.search);
    const selectedCategory = urlParams.get('category');

    if (selectedCategory) {
      filterCategory(selectedCategory);
    } else {
      currentProductList = products;
      renderProducts(1);
    }

  } catch (error) {
    console.error("Lỗi khi tải sản phẩm:", error);
  }
});

//loc sp
function filterProducts() {
  const searchQuery = document.getElementById('searchInput').value.trim();
  if (searchQuery.length === 0) {
    document.getElementById('noProductsMessage').style.display = 'none';
    return;
  }

  fetch(`/api/products/search?keyword=${encodeURIComponent(searchQuery)}`)
    .then(response => response.json())
    .then(products => {
      if (Array.isArray(products) && products.length > 0) {
        currentProductList = products;
        currentPage = 1;
        renderProducts(currentPage);
        renderPagination();
        document.getElementById('noProductsMessage').style.display = 'none';
      } else {
        document.getElementById('product-list').innerHTML = '';
        document.getElementById('pagination').innerHTML = '';
        document.getElementById('noProductsMessage').style.display = 'block';
      }
    })
    .catch(error => {
      console.error("Có lỗi khi gọi API:", error);
    });
}

//feedback
document.getElementById('feedbackForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const name = formData.get('name');
  const content = formData.get('content');
  const messageDiv = document.getElementById('feedbackMessage');
  messageDiv.textContent = 'Đang gửi phản hồi...';
  messageDiv.className = 'info';
  messageDiv.style.opacity = '1';

  try {
    const response = await fetch('/api/feedback/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content })
    });

    const data = await response.json();

    if (response.ok) {
      messageDiv.textContent = data.message;
      messageDiv.className = 'success';
      this.reset();

      setTimeout(() => {
        messageDiv.style.opacity = '0';
      }, 3000);
    } else {
      messageDiv.textContent = data.message || 'Gửi thất bại.';
      messageDiv.className = 'error';
    }
  } catch (error) {
    console.error('Lỗi gửi phản hồi:', error);
    messageDiv.textContent = 'Lỗi kết nối đến máy chủ.';
    messageDiv.className = 'error';
  }
});

// Load feedbacks
async function loadFeedbacks() {
  const response = await fetch('/api/feedback/list');
  const feedbacks = await response.json();

  const listDiv = document.getElementById('feedbackList');
  listDiv.innerHTML = ''; 

  if (feedbacks.length === 0) {
    listDiv.innerHTML = '<p>Chưa có đánh giá nào.</p>';
    return;
  }

  feedbacks.forEach(feedback => {
    const item = document.createElement('div');
    item.classList.add('feedback-item');
    item.innerHTML = `
      <p><strong>${feedback.name}</strong> (${new Date(feedback.created_at).toLocaleString()}):</p>
      <p>${feedback.content}</p>
      <hr />
    `;
    listDiv.appendChild(item);
  });
}

window.addEventListener('DOMContentLoaded', loadFeedbacks);

 // lọc sản phẩm theo giá
function searchProducts() {
  const sort = document.getElementById('sort').value;

  fetch(`/api/products/sort?sort=${sort}`)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        throw new Error(data.error || 'Lỗi không xác định từ server');
      }

      const container = document.getElementById('product-list');
      container.innerHTML = '';

      data.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const image = document.createElement('img');
        image.src = `${product.image}`;
        image.alt = product.name;
        image.className = 'product-image';
        image.onclick = () => location.href = `chitietsanpham.html?id=${product.id}`;

        const title = document.createElement('h3');
        title.textContent = product.name;
        title.style.cursor = 'pointer';
        title.onclick = () => location.href = `chitietsanpham.html?id=${product.id}`;

        const price = document.createElement('p');
        price.textContent = `Giá: ${product.price.toLocaleString()}đ`;

        const button = document.createElement('button');
        button.textContent = 'Thêm vào giỏ';
        button.addEventListener('click', () => showQuantityModal(product));

        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(button);

        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Lỗi tìm kiếm:', err.message);
    });
}









