const mysql = require('mysql2');
require('dotenv').config();

// Kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,       
  database: process.env.DB_NAME   
});

// Danh sách sản phẩm
const products = [
  {name: "Trà Chanh", price: 15000000, image: "images/tra/tra_chanh.jpg",category: "tea"},
];

// Hàm thêm sản phẩm
products.forEach(p => {
  const sql = 'INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)';
  db.query(sql, [p.name, p.price, p.image, p.category], (err, result) => {
    if (err) console.error('❌ Lỗi:', err);
    else console.log('✅ Đã thêm:', p.name);
  });
});
