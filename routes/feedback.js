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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  // Đếm tổng số feedbacks
  db.query('SELECT COUNT(*) AS total FROM feedbacks', (err, countResult) => {
    if (err) {
      console.error('Lỗi đếm feedback:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ.' });
    }
    const total = countResult[0].total;
    // Lấy feedback phân trang
    db.query(
      'SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset],
      (err, results) => {
        if (err) {
          console.error('Lỗi khi lấy danh sách feedback:', err);
          return res.status(500).json({ message: 'Lỗi máy chủ.' });
        }
        res.json({
          feedbacks: results,
          total: total
        });
      }
    );
  });
});
module.exports = router;
