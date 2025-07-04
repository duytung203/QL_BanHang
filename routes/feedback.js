const express = require('express');
const router = express.Router();
const db = require('../db');

// Thêm feedback
router.post('/add', (req, res) => {
  const { name, content } = req.body;
  const displayName = name && name.trim() ? name : 'Khách giấu tên';

  db.query(
    'INSERT INTO feedbacks (name, content, created_at) VALUES (?, ?, NOW())',
    [displayName, content],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Lỗi lưu phản hồi' });
      }
      res.json({ message: 'Phản hồi đã được lưu!' });
    }
  );
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
