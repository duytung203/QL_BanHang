document.addEventListener('DOMContentLoaded', function () {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  const productId = parseInt(idParam);

  if (!idParam || isNaN(productId) || productId <= 0) {
    showError('ID sản phẩm không hợp lệ');
    return;
  }

  fetchProductDetail(productId);
});
// Hàm lấy chi tiết sản phẩm từ API
async function fetchProductDetail(id) {
  try {
    const response = await fetch(`/api/products/${id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Lỗi khi tải sản phẩm (Mã lỗi: ${response.status})`);
    }

    if (!data.success || !data.data) {
      throw new Error('Dữ liệu sản phẩm không hợp lệ');
    }

    renderProduct(data.data);
  } catch (error) {
    console.error("Lỗi:", error);
    showError(error.message);
  }
}
// Hàm hiển thị chi tiết sản phẩm
function renderProduct(product) {
  const productContainer = document.getElementById("product-detail");

  const formattedProduct = {
    name: product.name || 'Tên sản phẩm không có',
    price: product.price ? formatPrice(product.price) : 'Liên hệ',
    originalPrice: product.originalPrice ? formatPrice(product.originalPrice) : null,
    image: product.image || '/images/default-drink.jpg',
    description: product.mota || "Không có mô tả chi tiết.",
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 1234,
    promotions: product.promotions || [],
    deliveryTime: product.deliveryTime || '15-20 phút',
    includes: product.includes || ['Ống hút', 'Túi giữ nhiệt']
  };

  const promotionsHTML = formattedProduct.promotions.length > 0
    ? `
      <div class="promotion-section">
        <h3 class="section-title">KHUYẾN MÃI</h3>
        <ul class="promotion-list">
          ${formattedProduct.promotions.map(promo => `<li>${promo}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  productContainer.innerHTML = `
    <div class="product-detail-container">
      <div class="back-container">
        <a href="/" class="back-button">← Quay lại trang chủ</a>
      </div>
      
      <h1 class="product-title">${formattedProduct.name}</h1>
      
      <div class="rating">
        ${'★'.repeat(Math.round(formattedProduct.rating))} 
        (${formattedProduct.reviewCount} đánh giá)
      </div>
      
      <div class="product-image-container">
        <img src="${formattedProduct.image}" 
             alt="${formattedProduct.name}" 
             class="product-image"
             onerror="this.onerror=null;this.src='/images/default-drink.jpg'">
      </div>
      
      <div class="price-container">
        <span class="current-price">${formattedProduct.price}</span>
        ${formattedProduct.originalPrice ? `<span class="original-price">${formattedProduct.originalPrice}</span>` : ''}
        <div class="delivery-badge">GIAO TRONG ${formattedProduct.deliveryTime}</div>
      </div>
      
      ${promotionsHTML}
      
      <div class="product-info">
        <div class="description">${formattedProduct.description}</div>
        
        <div class="accessories">
          <p>Kèm theo: ${formattedProduct.includes.join(', ')}</p>
          <p>Bảo hành chất lượng 100%</p>
          <p>Đổi trả trong vòng 2 giờ nếu không hài lòng</p>
        </div>

        <div id="quantityModal" class="modal" style="display:none;">
          <div class="modal-content">
            <h3>Nhập số lượng</h3>
            <input type="number" id="quantityInput" value="1" min="1" />
            <div class="modal-buttons">
              <button id="confirmAdd">Xác nhận</button>
              <button id="cancelAdd">Hủy</button>
            </div>
          </div>
        </div>

        <button class="add-to-cart-btn">Thêm vào giỏ hàng</button>
        <p class="delivery-info">Giao nhanh hoặc nhận tại quán</p>
      </div>
    </div>
  `;

  let selectedProduct = null;
  // Kiểm tra xem người dùng đã đăng nhập hay chưa
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-to-cart-btn")) {
   const token = localStorage.getItem("token");
if (!token) {
  Swal.fire({
    icon: 'info',
    title: '🛒 Cần đăng nhập',
    text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!',
    confirmButtonText: 'Đăng nhập ngay',
    showCancelButton: true,
    cancelButtonText: 'Hủy',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#aaa'
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "index.html";
    }
  });
  return;
}}
    if (e.target.classList.contains("add-to-cart-btn")) {
      selectedProduct = {
        id: product.id,
        name: formattedProduct.name,
        price: product.price,
        image: formattedProduct.image
      };
      document.getElementById("quantityModal").style.display = "flex";
    }
  });
// Xử lý sự kiện khi người dùng nhấn nút "Thêm vào giỏ hàng"
document.getElementById("confirmAdd").addEventListener("click", () => {
  const quantity = parseInt(document.getElementById("quantityInput").value);

  if (isNaN(quantity) || quantity <= 0) {
    Swal.fire({
      icon: 'warning',
      title: '⚠️ Số lượng không hợp lệ',
      text: 'Số lượng phải lớn hơn 0',
    });
    return;
  }

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existingIndex = cart.findIndex(item => item.id === selectedProduct.id);
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    selectedProduct.quantity = quantity;
    cart.push(selectedProduct);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  Swal.fire({
    icon: 'success',
    title: '🛒 Đã thêm vào giỏ hàng!',
    html: `Sản phẩm: <b>${selectedProduct.name}</b><br>Số lượng: <b>${quantity}</b>`,
    confirmButtonText: 'Xem giỏ hàng',
    showCancelButton: true,
    cancelButtonText: 'Tiếp tục mua sắm'
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = "giohang.html";
    } else {
      window.location.href = "index.html";
    }
  });
});
document.getElementById("cancelAdd").addEventListener("click", () => {
  document.getElementById("quantityModal").style.display = "none";
});
}
// Hiển thị thông báo lỗi
function showError(message) {
  document.getElementById("product-detail").innerHTML = `
    <div class="error-message">
      <i class="fa fa-exclamation-circle"></i>
      <p>${message}</p>
      <a href="/" class="back-link">Quay lại trang chủ</a>
    </div>
  `;
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}
// san phẩm liên quan
async function loadRelatedProducts(id) {
  try {
    const response = await fetch(`/api/products/${id}/related`);
    if (!response.ok) throw new Error('Không lấy được dữ liệu');
    const related = await response.json();

    const container = document.getElementById("related-products");
    container.innerHTML = '';
    related.forEach(product => {
      container.innerHTML += `
        <div class="product-card">
          <img src="${product.image}" alt="${product.name}" onclick="location.href='chitietsanpham.html?id=${product.id}'" />
          <h4>${product.name}</h4>
          <p>${product.price.toLocaleString()}đ</p>
        </div>
      `;
    });
  } catch (error) {
    console.error('Lỗi tải sản phẩm liên quan:', error);
  }
}

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
if (productId) loadRelatedProducts(productId);
