let products = [];
let currentProductList = [];
let currentPage = 1;
const productsPerPage = 15;

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

  setTimeout(() => {
    if (oldPage && container.contains(oldPage)) {
      container.removeChild(oldPage);
    }
    newPage.classList.remove(`slide-in-${direction}`, "slide-in");
  }, 500);

  currentPage = page;
  renderPagination();
}


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

  function goToCart() {
    window.location.href = 'giohang.html';
  }

let selectedProduct = null;

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

function closeQuantityModal() {
  document.getElementById("quantityModal").style.display = "none";
  selectedProduct = null;
}
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cart-count").textContent = total;
}

function saveCart(cart) {
  const userId = localStorage.getItem("userId");
  if (!userId) return;
  let allCarts = JSON.parse(localStorage.getItem("carts")) || {};
  allCarts[userId] = cart;
  localStorage.setItem("carts", JSON.stringify(allCarts));
}
function loadCart() {
  const userId = localStorage.getItem("userId");
  if (!userId) return [];
  const allCarts = JSON.parse(localStorage.getItem("carts")) || {};
  return allCarts[userId] || [];
}
let cart = loadCart();


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
function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('show');
}

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


function initBanner() {
  showSlides();
  startSlideShow();
  
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide(index);
      resetInterval();
    });
  });
}

function showSlides() {
  let i;
  const slides = document.getElementsByClassName("banner-slide");
  const dots = document.getElementsByClassName("dot");
  
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}

  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  

  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
}

function plusSlides(n) {
  const slides = document.getElementsByClassName("banner-slide");
  slideIndex += n;
  
  if (slideIndex > slides.length) {slideIndex = 1}
  if (slideIndex < 1) {slideIndex = slides.length}
  
  showSlides();
}

function currentSlide(n) {
  slideIndex = n + 1;
  showSlides();
}


function startSlideShow() {
  slideInterval = setInterval(() => {
    showSlides();
  }, 3500);
}


function resetInterval() {
  clearInterval(slideInterval);
  startSlideShow();
}
document.addEventListener('DOMContentLoaded', initBanner);

function filterCategory(category) {
  currentProductList = products.filter(p => p.category === category);
  renderProducts(1);
}


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







