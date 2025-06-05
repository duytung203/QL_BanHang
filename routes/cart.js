const express = require('express');
const router = express.Router();
const db = require('../db');

const authenticate = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Bạn cần đăng nhập để thực hiện hành động này' });
  }
  req.user = req.session.user;
  next();
};

router.post('/checkout', async (req, res) => {
  try {
    const { cart } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Bạn cần đăng nhập để đặt hàng.' });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng không hợp lệ.' });
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
    const [orders] = await db.promise().query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', 
      [userId]
    );

    for (let order of orders) {
      const [items] = await db.promise().query(`
        SELECT oi.*, p.name, p.image 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?`, [order.id]);
      order.items = items;
    }

    res.json({ success: true, orders });
  } catch (err) {
    console.error('Lỗi khi lấy đơn hàng:', err);
    res.status(500).json({ error: 'Lỗi khi lấy đơn hàng', detail: err.message });
  }
});

// quan ly don hang admin
router.get('/admin/orders', authenticate, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Bạn không có quyền truy cập vào trang này.' });
  }

  try {
    const [orders] = await db.promise().query(`
      SELECT o.*, u.username 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);

    for (let order of orders) {
      const [items] = await db.promise().query(`
        SELECT oi.*, p.name, p.image 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?`, [order.id]);
      order.items = items;
    }

    res.json({ success: true, orders });
  } catch (err) {
    console.error('Lỗi khi lấy đơn hàng:', err);
    res.status(500).json({ error: 'Lỗi khi lấy đơn hàng', detail: err.message });
  }
});

router.put('/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Trạng thái đơn hàng không hợp lệ' });
  }
  db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Không thể cập nhật trạng thái đơn hàng' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }
    res.json({ id: orderId, status });
  });
});

router.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query('DELETE FROM order_items WHERE order_id = ?', [id]);
    await db.promise().query('DELETE FROM orders WHERE id = ?', [id]);

    res.status(200).json({ message: 'Đã hủy đơn hàng thành công' });
  } catch (error) {
    console.error('Lỗi xoá đơn hàng:', error);
    res.status(500).json({ error: 'Lỗi khi hủy đơn hàng' });
  }
});

module.exports = router;
