const express = require('express');
const router = express.Router();
const db = require('../db'); // kết nối MySQL

// Top sản phẩm bán chạy
router.get('/top-products', (req, res) => {
  const sql = `
    SELECT p.name, SUM(od.quantity) AS total_sold
    FROM order_items od
    JOIN products p ON od.product_id = p.id
    GROUP BY p.name
    ORDER BY total_sold DESC
    LIMIT 5
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Doanh thu 7 ngày gần nhất
router.get('/revenue-daily', (req, res) => {
  const sql = `
    SELECT DATE(created_at) AS date, SUM(total_price) AS total_revenue
    FROM orders
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Tình trạng đơn hàng
router.get('/order-status', (req, res) => {
  const sql = `
    SELECT status, COUNT(*) AS count
    FROM orders
    GROUP BY status
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;