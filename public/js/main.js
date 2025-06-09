// xử lý các tương tác menu
document.addEventListener('DOMContentLoaded', function () {
  const coffeeBtn = document.getElementById('menu-coffee');
  if (coffeeBtn) {
    coffeeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      handleCategoryClick('coffee');
    });
  }

  const teaBtn = document.getElementById('menu-tea');
  if (teaBtn) {
    teaBtn.addEventListener('click', function (e) {
      e.preventDefault();
      handleCategoryClick('tea');
    });
  }
 const allBtn = document.getElementById('menu-all');
if (allBtn) {
  allBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = 'index.html';
  });
}

  const banhBtn = document.getElementById('menu-banh');
  if (banhBtn) {
    banhBtn.addEventListener('click', function (e) {
      e.preventDefault();
      handleCategoryClick('banh');
    });
  }

  const anvatBtn = document.getElementById('menu-anvat');
  if (anvatBtn) {
    anvatBtn.addEventListener('click', function (e) {
      e.preventDefault();
      handleCategoryClick('anvat');
    });
  }
});
// Hàm xử lý khi người dùng click vào một danh mục
function handleCategoryClick(category) {
  window.location.href = `index.html?category=${category}`;
}
