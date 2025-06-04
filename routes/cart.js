const express = require('express');
const router = express.Router();
const db = require('../db');

const authenticate = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện hành động này' });
  }
  next();
};

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
// dơn hang cua toi
router.get('/my-orders', authenticate, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Không có thông tin người dùng, vui lòng đăng nhập lại.' });
  }
  const userId = req.user.id;
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    for (let order of orders) {
      const [items] = await db.query(`
        SELECT oi.*, p.name, p.image 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?`, [order.id]);
      order.items = items;
    }
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy đơn hàng' });
  }
});
// quan ly don hang admin



module.exports = router;
