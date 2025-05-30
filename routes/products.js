const express = require('express');
const router = express.Router();
const db = require('../db');
const app = express(); 

router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    res.json(results);
  });
});



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
module.exports = router;

