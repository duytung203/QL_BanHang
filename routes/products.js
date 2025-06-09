const express = require('express');
const router = express.Router();
const db = require('../db');
const app = express(); 

//lay tat ca san pham
router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    res.json(results);
  });
});
// tim kiem san pham
router.get('/search', (req, res) => {
  const keyword = req.query.keyword || '';
  const sql = "SELECT * FROM products WHERE name LIKE ?";
  db.query(sql, [`%${keyword}%`], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    res.json(results);
  });
});
// sap xep san pham
router.get('/sort', (req, res) => {
  const sort = req.query.sort;
  let query = 'SELECT * FROM products';
  let orderBy = '';

  switch (sort) {
    case 'price_asc':
      orderBy = ' ORDER BY price ASC';
      break;
    case 'price_desc':
      orderBy = ' ORDER BY price DESC';
      break;
    case 'name_asc':
      orderBy = ' ORDER BY name ASC';
      break;
    case 'name_desc':
      orderBy = ' ORDER BY name DESC';
      break;
    default:
      return res.status(400).json({ error: 'Tham số sort không hợp lệ' });
  }

  db.query(query + orderBy, (err, results) => {
    if (err) {
      console.error('Lỗi SQL:', err);
      return res.status(500).json({ error: 'Lỗi truy vấn sản phẩm' });
    }
    res.json(results);
  });
});

//san pham goi y
router.get('/:id/related', (req, res) => {
  const productId = req.params.id;
  const getCategoryQuery = 'SELECT category FROM products WHERE id = ?';

  db.query(getCategoryQuery, [productId], (err, categoryResult) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn category' });
    if (categoryResult.length === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

    const category = categoryResult[0].category;
    const getRelatedQuery = `
      SELECT * FROM products
      WHERE category = ? AND id != ?
      ORDER BY RAND()
      LIMIT 6
    `;
    db.query(getRelatedQuery, [category, productId], (err, relatedResult) => {
      if (err) return res.status(500).json({ error: 'Lỗi truy vấn sản phẩm liên quan' });
      res.json(relatedResult);
    });
  });
});
//chi tiet san pham
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    return res.status(400).json({ 
      success: false,
      error: 'ID sản phẩm phải là số nguyên dương' 
    });
  }
  const sql = 'SELECT * FROM products WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Database error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    } 
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: `Không tìm thấy sản phẩm với ID ${id}` 
      });
    }   
    const product = {
      ...results[0],
      price: parseFloat(results[0].price)
    };
    res.json({
      success: true,
      data: product
    });
  });
});

//them san pham
router.post('/add', (req, res) => {
  const { name, price, image, category, mota } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
  }
  const query = 'INSERT INTO products (name, price, image, category, mota) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, price, image, category, mota], (err, result) => {
    if (err) {
      console.error('Lỗi khi thêm sản phẩm:', err);
      return res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm sản phẩm' });
    }
    res.status(200).json({ message: 'Sản phẩm đã được thêm thành công!', productId: result.insertId });
  });
});

// xoa san pham
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Xoá thành công' });
  });
});

// update san pham
router.put('/:id', (req, res) => {
  const { name, price, category, image, mota } = req.body;
  const id = req.params.id;
  const sql = 'UPDATE products SET name = ?, price = ?, category = ?, image = ?, mota = ? WHERE id = ?';
  const values = [name, price, category, image, mota, id];
  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Cập nhật sản phẩm thành công' });
  });
});


module.exports = router;

