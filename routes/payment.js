const express = require('express');
const router = express.Router();

module.exports = (db) => {
  router.post('/', (req, res) => {
    const { order_id, user_id, amount, method } = req.body;

    if (!order_id || !amount || !method) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
    }

    const sql = `
      INSERT INTO payments (order_id, user_id, amount, method, status)
      VALUES (?, ?, ?, ?, 'completed')
    `;

    db.query(sql, [order_id, user_id || null, amount, method], (err, result) => {
      if (err) {
        console.error('Lỗi khi thêm thanh toán:', err);
        return res.status(500).json({ message: 'Lỗi máy chủ khi lưu thanh toán.' });
      }

      // Cập nhật trạng thái đơn hàng thành 'completed'
      const updateOrder = `UPDATE orders SET status = 'completed' WHERE id = ?`;
      db.query(updateOrder, [order_id]);

      res.json({ message: 'Thanh toán thành công', payment_id: result.insertId });
    });
  });

  router.post('/recipients', (req, res) => {
    const { fullname, email, phone, address } = req.body;
    const user_id = req.body.user_id ? parseInt(req.body.user_id) : null;

  if (!fullname || !email || !phone || !address) {
    return res.status(400).json({ message: 'Thiếu thông tin người nhận.' });
  }

  const sql = `INSERT INTO recipients (fullname, email, phone, address, user_id) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [fullname, email, phone, address, user_id || null], (err, result) => {
    if (err) {
      console.error('Lỗi lưu người nhận:', err);
      return res.status(500).json({ message: 'Lỗi khi lưu người nhận.' });
    }
    res.json({ message: 'Lưu thông tin người nhận thành công.' });
  });
});


  return router;
};

