const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    res.json(results);
  });
});


app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM products WHERE id = ?';

  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn CSDL:', err);
      return res.status(500).json({ error: 'Lỗi máy chủ' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    }
    res.json(results[0]);
  });
});

module.exports = router;


