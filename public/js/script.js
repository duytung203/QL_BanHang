let products = [];
let currentProductList = [];
let currentPage = 1;
const productsPerPage = 15;

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

    const price = document.createElement("div");

    if (product.discount_percent) {
    price.innerHTML = `
    <p><del>Giá gốc: ${product.price.toLocaleString()}đ</del></p>
    <p>Giảm giá: ${product.discount_percent}%</p>
    <p><strong>Giá KM: ${product.discounted_price.toLocaleString()}đ</strong></p>`;
    } 
    else {
    price.innerHTML = `<p><strong>Giá: ${product.price.toLocaleString()}đ</strong></p>`;
    }

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

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(currentProductList.length / productsPerPage);

  // Nút Previous
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "<";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => renderProducts(currentPage - 1);
  pagination.appendChild(prevBtn);

  // Các nút số trang
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = (i === currentPage) ? "active1" : "";
    btn.onclick = () => renderProducts(i);
    pagination.appendChild(btn);
  }

  // Nút Next
  const nextBtn = document.createElement("button");
  nextBtn.textContent = ">";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => renderProducts(currentPage + 1);
  pagination.appendChild(nextBtn);
}

// Hàm chuyển hướng đến giỏ hàng
 function goToCart() {
  const token = localStorage.getItem('token');
  if (!token) {
  Swal.fire({
    icon: 'warning',
    title: '🔐 Bạn chưa đăng nhập!',
    text: 'Bạn cần đăng nhập để truy cập giỏ hàng.',
    confirmButtonText: 'Đăng nhập',
    confirmButtonColor: '#43a047'
  }).then(() => {
    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
      loginModal.style.display = "flex";
    } else {
      Swal.fire({
        icon: 'error',
        title: '❌ Không tìm thấy modal đăng nhập!',
        text: 'Vui lòng kiểm tra lại HTML hoặc đường dẫn.'
      });
    }
  });

  return;
}


  window.location.href = 'giohang.html';
}

let selectedProduct = null;
// Hàm hiển thị modal để chọn số lượng sản phẩm
function showQuantityModal(product) {
 const token = localStorage.getItem('token');
if (!token) {
  Swal.fire({
    icon: 'warning',
    title: '🔐 Bạn chưa đăng nhập!',
    text: 'Vui lòng đăng nhập để tiếp tục.',
    confirmButtonText: 'Đăng nhập ngay',
    confirmButtonColor: '#43a047'})
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
  Swal.fire({
    icon: 'warning',
    title: '⚠️ Số lượng không hợp lệ',
    text: 'Vui lòng nhập số lượng lớn hơn 0 và là dạng số.',
    confirmButtonColor: '#f57c00'
  });
  return;
}


  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const index = cart.findIndex(item => item.id === selectedProduct.id);
  const finalPrice = selectedProduct.discounted_price || selectedProduct.price;

  if (index !== -1) {
   cart[index].quantity = parseInt(cart[index].quantity) + quantity;
  } else {
  cart.push({
  id: selectedProduct.id,
  name: selectedProduct.name,
  price: Number(finalPrice), 
  image: selectedProduct.image,
  quantity: quantity,       
  });
}

  localStorage.setItem("cart", JSON.stringify(cart));
updateCartCount();
closeQuantityModal();

Swal.fire({
  icon: 'success',
  title: '🎉 Đã thêm vào giỏ hàng!',
  showConfirmButton: false,
  timer: 1500,
  toast: true,
  position: 'top-end'
});
}

// Hàm đóng modal chọn số lượng
function closeQuantityModal() {
  document.getElementById("quantityModal").style.display = "none";
  selectedProduct = null;
}
// Cập nhật số lượng sản phẩm trong giỏ hàng
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

  const cartCountSpans = document.querySelectorAll("#cart-count");

  if (cartCountSpans.length === 0) {
    console.warn("Không tìm thấy phần tử #cart-count trong DOM.");
    return;
  }
  cartCountSpans.forEach(span => span.textContent = totalItems);
}

window.addEventListener("DOMContentLoaded", () => {
  updateUserMenu(); // tự động hiển thị menu nếu đã đăng nhập
});


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
  const email = document.querySelector('#loginForm input[type="text"]').value.trim();
  const password = document.querySelector('#loginForm input[type="password"]').value;

  if (!email || !password) {
    Swal.fire({
      icon: 'warning',
      title: '⚠️ Thiếu thông tin',
      text: 'Vui lòng nhập email và mật khẩu.'
    });
    return;
  }
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.userId) {
      const user = {
        id: data.userId,
        username: data.username,
        role: data.role
      };

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', data.token);
      localStorage.removeItem("cart");

      updateUserMenu();
      toggleModal(false);

      if (user.role === 'admin') {
        Swal.fire({
          icon: 'success',
          title: '✅ Đăng nhập thành công',
          text: 'Chào quản trị viên!',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          window.location.href = '/admin.html';
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: '🎉 Đăng nhập thành công',
          text: 'Chào mừng bạn quay trở lại!',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          window.location.href = '/index.html';
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: '❌ Đăng nhập thất bại',
        text: data.message || 'Sai thông tin đăng nhập'
      });
    }

  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    Swal.fire({
      icon: 'error',
      title: '🚫 Lỗi máy chủ',
      text: 'Không thể kết nối đến server. Vui lòng thử lại sau.'
    });
  }
}




// Xử lý sự kiện click vào nút đăng ký
document.getElementById('registerBtn')?.addEventListener('click', register);

async function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!username || !email || !password) {
    Swal.fire({
      icon: 'warning',
      title: '⚠️ Thiếu thông tin',
      text: 'Vui lòng nhập đầy đủ tên, email và mật khẩu.'
    });
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      Swal.fire({
        icon: 'success',
        title: '🎉 Đăng ký thành công!',
        text: data.message || 'Bạn có thể đăng nhập ngay bây giờ.',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        switchTab('login');
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: '❌ Đăng ký thất bại',
        text: data.message || 'Vui lòng kiểm tra lại thông tin đăng ký.'
      });
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    Swal.fire({
      icon: 'error',
      title: 'Lỗi máy chủ',
      text: 'Không thể kết nối đến server. Vui lòng thử lại sau.'
    });
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
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  const userMenu = document.getElementById('userMenu');
  const mobileLogin = document.querySelector('.mobile-login');

  if (!token || !userStr) return;

  let username = 'Người dùng';
  try {
    const user = JSON.parse(userStr);
    username = user.username || username;
  } catch (e) {
    console.error('Lỗi parse user:', e);
  }

  // Render user menu desktop
  if (userMenu) {
    userMenu.innerHTML = `
      <div class="dropdown">
        <button class="dropbtn" onclick="toggleUserMenu()">👋 Xin chào ${username}</button>
        <div class="dropdown-content" id="userDropdown">
          <a href="nguoidung.html" target="_blank">👤 Thông tin người dùng</a>
          <a href="history.html">📄 Lịch sử giao dịch</a>
          <a href="#" onclick="logout()">🚪 Đăng xuất</a>
        </div>
      </div>
      <button class="cart-btn" onclick="goToCart()">🛒 Giỏ hàng (<span id="cart-count">0</span>)</button>
    `;
  }

  // Render user menu mobile
  if (mobileLogin) {
    mobileLogin.innerHTML = `
      <p style="font-weight:bold;">👋 Xin chào <strong>${username}</strong></p>
      <ul style="list-style:none; padding:0;">
        <li><a href="nguoidung.html">👤 Thông tin người dùng</a></li>
        <li><a href="history.html">📄 Lịch sử giao dịch</a></li>
        <li><a href="#" onclick="logout()">🚪 Đăng xuất</a></li>
      </ul>
    `;
  }

  updateCartCount(); // Sau khi render xong thì cập nhật luôn số lượng giỏ hàng
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
  localStorage.removeItem('user');
  location.reload();  
  const userMenu = document.getElementById('userMenu');
  userMenu.innerHTML = `
    <button class="login-btn" onclick="toggleModal(true)">Đăng nhập</button>
    <button class="cart-btn" onclick="goToCart()">🛒Giỏ hàng (<span id="cart-count">0</span>)</button>
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
    showLoading();
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
  finally {
    hideLoading();
  }
});

//loc sp
function filterProducts() {
  showLoading();
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
    hideLoading();
}

//feedback
document.addEventListener('DOMContentLoaded', () => {
  updateUserDisplay();
  loadFeedbacks();
});

function updateUserDisplay() {
  const userStr = localStorage.getItem("user");
  let username = "Chưa đăng nhập";

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      username = user.username || username;
    } catch (e) {
      console.error("Lỗi parse user:", e);
    }
  }

  const userDisplay = document.getElementById("userDisplay");
  if (userDisplay) {
    userDisplay.innerHTML = `👤 <strong>${username}</strong>`;
  }
}

document.getElementById('feedbackForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const contentInput = this.querySelector('[name="content"]');
  const content = contentInput.value.trim();
  const messageDiv = document.getElementById('feedbackMessage');
  if (!content) {
    messageDiv.textContent = '⚠️ Hãy thêm ý kiến của bạn trước khi gửi!';
    messageDiv.className = 'error';
    return;
  }
  let name = "Khách giấu tên";
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      name = user.username || name;
    } catch (e) {
      console.error("Không thể parse user từ localStorage:", e);
    }
  }
  messageDiv.textContent = 'Đang gửi phản hồi...';
  messageDiv.className = 'info';
  try {
    const response = await fetch('/api/feedback/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content })
    });
    const data = await response.json();
    if (response.ok) {
      messageDiv.textContent = `🎉 Cảm ơn ${name} đã gửi đánh giá nha!`;
      messageDiv.className = 'success';
      this.reset();
      loadFeedbacks();
    } else {
      messageDiv.textContent = data.message || 'Gửi thất bại.';
      messageDiv.className = 'error';
    }
  } catch (err) {
    console.error("Lỗi khi gửi feedback:", err);
    messageDiv.textContent = 'Lỗi kết nối.';
    messageDiv.className = 'error';
  }
});


// Load feedbacks
async function loadFeedbacks() {
  showLoading();
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
  hideLoading();
}

window.addEventListener('DOMContentLoaded', loadFeedbacks);
window.addEventListener("DOMContentLoaded", updateCartCount);

 // lọc sản phẩm theo giá
function searchProducts(page = 1) {
  const sort = document.getElementById('sort').value;
  const limit = 15;

  fetch(`/api/products/sort?sort=${sort}&page=${page}&limit=${limit}`)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data.products)) {
        throw new Error(data.error || 'Dữ liệu không hợp lệ');
      }

      const container = document.getElementById('product-list');
      container.innerHTML = '';

      data.products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const image = document.createElement('img');
        image.src = product.image;
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
        button.onclick = () => showQuantityModal(product);

        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(button);

        container.appendChild(card);
      });

      renderPagination(data.totalPages, page);
    })
    .catch(err => {
      console.error('Lỗi tìm kiếm:', err.message);
    });
}


// Lấy sản phẩm nổi bật và hiển thị
fetch('/api/products/featured')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('featured-list');
    if (!Array.isArray(data)) {
      console.error('Dữ liệu không hợp lệ:', data);
      container.innerHTML = 'Không thể tải sản phẩm nổi bật.';
      return;
    }

   data.forEach((p, index) => {
  const div = document.createElement("div");
  div.className = "product-featured";
  div.innerHTML = `
    <img src="${p.image}" />
    <h3>${p.name}</h3>
    <p>Giá: ${p.price} VND</p>
  `;
  container.appendChild(div);

  // Thêm animation sau mỗi 200ms
  setTimeout(() => {
    div.classList.add("show");
  }, index * 150);
});
  })
  .catch(err => {
    console.error("Lỗi khi fetch featured products:", err);
  });

  // Lấy sản phẩm khuyến mãi và hiển thị
fetch('/api/products/promotions')
  .then(res => res.json())
  .then(result => {
    const data = result.data || result; 
    const promotionsEl = document.getElementById('promotion-list');

    // Nếu không có sản phẩm khuyến mãi
    if (!Array.isArray(data) || data.length === 0) {
      promotionsEl.innerHTML = '<p>Hiện tại không có sản phẩm khuyến mãi.</p>';
      return;
    }
    promotionsEl.innerHTML = '';

    data.forEach(product => {
  const item = document.createElement('div');
  item.className = 'product-card';

  const image = document.createElement('img');
  image.src = product.image;
  image.alt = product.name;
  image.className = 'product-image';
  image.style.cursor = 'pointer';
  image.onclick = () => location.href = `chitietsanpham.html?id=${product.id}`;

  const title = document.createElement('h3');
  title.textContent = product.name;
  title.style.cursor = 'pointer';
  title.onclick = () => location.href = `chitietsanpham.html?id=${product.id}`;

  const originalPrice = document.createElement('p');
  originalPrice.innerHTML = `<del>Giá gốc: ${formatCurrency(product.price)}</del>`;

  const discountPercent = document.createElement('p');
  discountPercent.textContent = `Giảm giá: ${product.discount_percent}%`;

  const discountedPrice = document.createElement('p');
  discountedPrice.innerHTML = `<strong>Giá KM: ${formatCurrency(product.discounted_price)}</strong>`;

  const button = document.createElement('button');
  button.textContent = 'Thêm vào giỏ';
  button.className = 'add-to-cart-btn';
  button.addEventListener('click', () => showQuantityModal(product));

  item.appendChild(image);
  item.appendChild(title);
  item.appendChild(originalPrice);
  item.appendChild(discountPercent);
  item.appendChild(discountedPrice);
  item.appendChild(button);
  promotionsEl.appendChild(item);

});
  })
  function formatCurrency(amount, locale = 'vi-VN', currency = 'VND') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

// bot chat
function toggleChat() {
  const chatBox = document.getElementById('chatContainer');
  chatBox.style.display = chatBox.style.display === 'none' ? 'flex' : 'none';
}

function handleKey(e) {
  if (e.key === 'Enter') sendMessage();
}
function showTypingIndicator() {
  const chatMessages = document.getElementById('chatMessages');
  const typing = document.createElement('div');
  typing.className = 'message bot typing';
  typing.id = 'typingIndicator';
  typing.innerHTML = `
    <img src="/images/chatbot.png" class="avatar">
    <div class="bubble"><span class="dot1">.</span><span class="dot1">.</span><span class="dot1">.</span></div>
  `;
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

function appendMessage(text, sender) {
  const chatMessages = document.getElementById('chatMessages');
  const msg = document.createElement('div');
  msg.className = `message ${sender}`;

  if (sender === 'bot') {
    msg.innerHTML = `
      <img src="/images/chatbot.png" class="avatar">
      <div class="bubble">${text}</div>
    `;
    } else {
    msg.innerHTML = `
      <div class="bubble">${text}</div>
      <img src="/images/user.png" class="avatar">
    `;
  }

  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  input.value = '';

  showTypingIndicator();

  try {
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    hideTypingIndicator();

    appendMessage(data.reply, 'bot');

    if (Array.isArray(data.promotions) && data.promotions.length > 0) {
      data.promotions.forEach(promo => {
        const promoText = `
        🎉 <b>${promo.name}</b><br>
        Giá gốc: <s>${promo.price.toLocaleString()}đ</s><br>
        Giảm: ${promo.discount_percent}%<br>
        👉 <b>Còn lại: ${promo.discounted_price.toLocaleString()}đ</b>
        `;
        appendMessage(promoText, 'bot');
      });
    }

  } catch (err) {
    console.error('Lỗi gọi chatbot:', err);
    hideTypingIndicator();
    appendMessage('❌ Lỗi hệ thống!', 'bot');
  }
}


  function toggleHamburger() {
  const nav = document.getElementById('mainNav');
  const icon = document.querySelector('.hamburger');
  nav.classList.toggle('active');
  icon.textContent = nav.classList.contains('active') ? '✖' : '☰';
}
document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mainNav').classList.remove('active');
    document.querySelector('.hamburger').textContent = '☰';
  });
});

function showLoading() {
  document.getElementById('loadingOverlay')?.classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loadingOverlay')?.classList.add('hidden');
}

// Hiệu ứng click
document.addEventListener("click", function (e) {
  const effect = document.createElement("div");
  effect.className = "click-effect";
  effect.style.left = `${e.pageX - 10}px`;
  effect.style.top = `${e.pageY - 10}px`;

  document.body.appendChild(effect);

  setTimeout(() => {
    effect.remove();
  }, 500);
});












