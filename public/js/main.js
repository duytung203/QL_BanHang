
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

function handleCategoryClick(category) {
  window.location.href = `index.html?category=${category}`;
}
