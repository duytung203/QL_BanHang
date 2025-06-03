const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/checkout', async (req, res) => {
  try {
    const { cart } = req.body;
    const userId = req.session.user?.id;
    // Kiểm tra xem người dùng đã đăng nhập hay chưa
    if (!userId) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để đặt hàng.' });
    }

    // Kiểm tra giỏ hàng
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng không hợp lệ.' });
    }

    // Tính tổng giá trị đơn hàng
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Tạo đơn hàng mới
    let orderId;
    try {
      const [result] = await db.promise().execute(
        'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
        [userId, total]
      );
      orderId = result.insertId;
    } catch (err) {
      return res.status(500).json({ error: 'Không thể tạo đơn hàng.', detail: err.message });
    }

    // Chèn chi tiết đơn hàng vào bảng order_items
    try {
      const insertPromises = cart.map(item => {
        return db.promise().execute(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.id, item.quantity, item.price]
        );
      });
      await Promise.all(insertPromises);
    } catch (err) {
      return res.status(500).json({ message: 'Lỗi khi lưu chi tiết đơn hàng.', detail: err.message });
    }

    return res.json({ message: 'Đặt hàng thành công!' });
  } catch (err) {
    return res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau.', detail: err.message });
  }
});


module.exports = router;
