const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const db = require('../db');

module.exports = (db) => {
  router.get('/history/:userId', (req, res) => {
    const userId = req.params.userId;
    const { fromDate, toDate } = req.query;
    let sql = `
      SELECT 
        o.id AS order_id,
        o.created_at,
        o.total_price,
        o.status,
        p.name AS product_name,
        oi.quantity,
        oi.price AS item_price
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
        AND o.status = 'completed'
    `;

    const params = [userId];
    if (fromDate) {
      sql += ` AND o.created_at >= ?`;
      params.push(fromDate);
    }
    if (toDate) {
      sql += ` AND o.created_at <= ?`;
      params.push(toDate);
    }

    sql += ` ORDER BY o.created_at DESC`;

    db.query(sql, params, (err, results) => {
      if (err) {
        console.error('Lỗi truy vấn lịch sử:', err);
        return res.status(500).json({ error: 'Lỗi khi lấy lịch sử đơn hàng' });
      }
      const history = {};

      results.forEach(row => {
        if (!history[row.order_id]) {
          history[row.order_id] = {
            order_id: row.order_id,
            created_at: row.created_at,
            total_price: row.total_price,
            status: row.status,
            items: []
          };
        }

        history[row.order_id].items.push({
          name: row.product_name,
          quantity: row.quantity,
          price: row.item_price
        });
      });

      res.json(Object.values(history));
    });
  });

  router.get('/export/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { fromDate, toDate } = req.query;

  let sql = `
    SELECT 
      o.id AS order_id,
      o.created_at,
      o.status,
      o.total_price,
      p.name AS product_name,
      oi.quantity,
      oi.price AS item_price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ? AND o.status = 'completed'
  `;
  const params = [userId];

  if (fromDate) {
    sql += ' AND o.created_at >= ?';
    params.push(fromDate);
  }

  if (toDate) {
    sql += ' AND o.created_at <= ?';
    params.push(toDate);
  }

  sql += ' ORDER BY o.created_at DESC';

  db.query(sql, params, async (err, results) => {
    if (err) {
      console.error('Lỗi xuất Excel:', err);
      return res.status(500).json({ error: 'Không thể xuất báo cáo' });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Lịch sử đơn hàng');

    // Header
    sheet.columns = [
      { header: 'Mã đơn', key: 'order_id', width: 10 },
      { header: 'Ngày đặt', key: 'created_at', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Tổng tiền', key: 'total_price', width: 15 },
      { header: 'Sản phẩm', key: 'product_name', width: 30 },
      { header: 'Số lượng', key: 'quantity', width: 10 },
      { header: 'Đơn giá', key: 'item_price', width: 15 }
    ];

    // Dữ liệu
    results.forEach(row => {
      sheet.addRow({
        order_id: row.order_id,
        created_at: new Date(row.created_at).toLocaleString(),
        status: row.status,
        total_price: row.total_price,
        product_name: row.product_name,
        quantity: row.quantity,
        item_price: row.item_price
      });
    });

    // Header xuất file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=lich_su_don_hang.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  });
});


  return router;
};
