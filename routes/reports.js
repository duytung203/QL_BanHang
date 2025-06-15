const express = require('express');
const router = express.Router();
const db = require('../config/db'); 


router.get('/top-products', (req, res) => {
  const sql = `
    SELECT p.name, SUM(oi.quantity) AS total_sold
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    GROUP BY p.id
    ORDER BY total_sold DESC
    LIMIT 5;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

module.exports = router;
