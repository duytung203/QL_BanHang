const params = new URLSearchParams(window.location.search);
const id = params.get('id');

fetch('/api/products/' + id)
  .then(response => {
    if (!response.ok) {
      throw new Error("Không tìm thấy sản phẩm");
    }
    return response.json();
  })
  .then(data => {
    document.getElementById("product-detail").innerHTML = `
      <h2>${data.name}</h2>
      <img src="${data.image}" alt="${data.name}" />
      <p>Giá: ${data.price.toLocaleString()}đ</p>
      <p>${data.description || "Không có mô tả."}</p>
    `;
  })
  .catch(error => {
    document.getElementById("product-detail").innerHTML = `
      <p style="color: red;">Lỗi: ${error.message}</p>
    `;
    console.error("Lỗi khi tải chi tiết sản phẩm:", error);
  });




