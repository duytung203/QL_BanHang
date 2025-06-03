const express = require('express');
const router = express.Router();
const db = require('../db');

// Thêm feedback
router.post('/add', (req, res) => {
  const { name, content } = req.body;
  if (!name || !content) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
  }
  const sql = 'INSERT INTO feedbacks (name, content) VALUES (?, ?)';
  db.query(sql, [name, content], (err, result) => {
    if (err) {
      console.error('Lỗi khi thêm feedback:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
    res.status(201).json({ message: 'Đánh giá đã được gửi thành công!' });
  });
});



// Lấy danh sách feedback
router.get('/list', (req, res) => {
  db.query('SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT 5', (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy danh sách feedback:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
    res.json(results);
  });
});


module.exports = router;
