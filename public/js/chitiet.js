
fetch('/api/products')
  .then(res => res.json())
  .then(products => {
    const list = document.getElementById('productList');
    list.innerHTML = products.map(p => `
      <div class="product-item" onclick="location.href='chitiet.html?id=${p.id}'">
        <img src="${p.image}" width="100%">
        <h3>${p.name}</h3>
        <p>${p.price.toLocaleString()}đ</p>
      </div>
    `).join('');
  });

