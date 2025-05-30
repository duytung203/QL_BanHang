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


//san pham goi yy
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
      LIMIT 8
    `;
    db.query(getRelatedQuery, [category, productId], (err, relatedResult) => {
      if (err) return res.status(500).json({ error: 'Lỗi truy vấn sản phẩm liên quan' });
      res.json(relatedResult);
    });
  });
});
//chi tiet san phampham
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
router.post('/products', (req, res) => {
  const { name, price, image, category, mota } = req.body;
  db.query(
    'INSERT INTO products (name, price, image, category, mota) VALUES (?, ?, ?, ?, ?)',
    [name, price, image, category, mota],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'Đã thêm sản phẩm!', id: result.insertId });
    }
  );
});

// xoa san pham
router.delete('/api/products/:id', async (req, res) => {
  db.query('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Xoá thành công' });
  });
});
module.exports = router;

