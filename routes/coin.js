const express = require('express');
const router = express.Router();
const db = require('../db');
const moment = require('moment');


router.get('/balance', (req, res) => {
  const userId = req.user.id;

  db.query('SELECT balance FROM user_coins WHERE user_id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const balance = results[0]?.balance || 0;
    res.json({ balance });
  });
});


router.post('/buy-voucher', (req, res) => {
  const userId = req.user.id;
  const { coinAmount } = req.body;
  const discount = coinAmount * 1000;
  const code = 'VC' + Math.random().toString(36).substring(2, 10).toUpperCase();
  const expiresAt = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');

  // Trừ coin
  db.query('UPDATE user_coins SET balance = balance - ? WHERE user_id = ?', [coinAmount, userId], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // Lấy balance mới
    db.query('SELECT balance FROM user_coins WHERE user_id = ?', [userId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const newBalance = rows[0]?.balance || 0;

      // Đồng bộ users.coin
      db.query('UPDATE users SET coin = ? WHERE id = ?', [newBalance, userId], (err) => {
        if (err) console.error('Lỗi update users.coin:', err);
      });

      // Tạo voucher trước để lấy ID
      db.query(`
        INSERT INTO vouchers (user_id, code, discount_value, expires_at)
        VALUES (?, ?, ?, ?)`,
        [userId, code, discount, expiresAt],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });

          const voucherId = result.insertId;

          // Ghi log kèm voucher_id
          db.query(`
            INSERT INTO coin_transactions (user_id, amount, type, description, voucher_id)
            VALUES (?, ?, 'buy_voucher', ?, ?)`,
            [userId, -coinAmount, `Mua voucher ${discount}đ`, voucherId],
            (err) => {
              if (err) return res.status(500).json({ error: err.message });

              res.json({
                message: 'Tạo voucher thành công',
                voucher: { code, discount, expiresAt }
              });
            });
        });
    });
  });
});


router.post('/admin/add', (req, res) => {
  const { userId, amount, description } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Bạn không có quyền admin!' });
  }

  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Vui lòng cung cấp userId và số coin hợp lệ.' });
  }

  db.query(`
    INSERT INTO user_coins (user_id, balance)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE balance = balance + ?`,
    [userId, amount, amount],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      // Lấy lại số dư mới nhất
      db.query('SELECT balance FROM user_coins WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const newBalance = rows[0]?.balance || 0;

        // Cập nhật vào bảng users
        db.query('UPDATE users SET coin = ? WHERE id = ?', [newBalance, userId], (err) => {
          if (err) console.error('Lỗi update users.coin:', err);
        });

        // Ghi log
        db.query(`
          INSERT INTO coin_transactions (user_id, amount, type, description)
          VALUES (?, ?, 'admin_add', ?)`,
          [userId, amount, description || 'Admin tặng coin'],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: `Tặng ${amount} TeaCoin thành công cho user ${userId}` });
          });
      });
    });
});

router.post('/daily-login', (req, res) => {
  const userId = req.user.id;
  const today = moment().startOf('day').format('YYYY-MM-DD');
  const dailyAmount = 5;

  db.query(`
    SELECT id FROM coin_transactions 
    WHERE user_id = ? AND type = 'daily_login' AND DATE(created_at) = ?
  `, [userId, today], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length > 0) {
      return res.status(400).json({ message: 'Bạn đã nhận coin hôm nay rồi nha!' });
    }

    db.query(`
      INSERT INTO user_coins (user_id, balance)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE balance = balance + ?
    `, [userId, dailyAmount, dailyAmount], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.query('SELECT balance FROM user_coins WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const newBalance = rows[0]?.balance || 0;

        db.query('UPDATE users SET coin = ? WHERE id = ?', [newBalance, userId], (err) => {
          if (err) console.error('Lỗi update users.coin:', err);
        });

        db.query(`
          INSERT INTO coin_transactions (user_id, amount, type, description)
          VALUES (?, ?, 'daily_login', ?)
        `, [userId, dailyAmount, 'Đăng nhập nhận coin mỗi ngày'], (err) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({ message: ` Nhận ${dailyAmount} TeaCoin thành công!` });
        });
      });
    });
  });
});


// Xem lịch sử giao dịch
router.get('/history', (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Bạn chưa đăng nhập!' });

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const countQuery = `SELECT COUNT(*) AS total FROM coin_transactions WHERE user_id = ?`;
  const dataQuery = `
    SELECT 
      t.amount, t.type, t.description, t.created_at, 
      v.code, v.expires_at, v.used_at
    FROM coin_transactions t
    LEFT JOIN vouchers v ON t.voucher_id = v.id
    WHERE t.user_id = ?
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `;

  // 1. Đếm tổng số dòng
  db.query(countQuery, [userId], (err, countRows) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // 2. Lấy dữ liệu trang hiện tại
    db.query(dataQuery, [userId, limit, offset], (err2, rows) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const now = new Date();

      const history = rows.map(tx => {
        let status = null;
        if (tx.code) {
          const isUsed = tx.used_at !== null;
          const isExpired = tx.expires_at && new Date(tx.expires_at) < now;
          if (isUsed) status = 'Đã dùng';
          else if (isExpired) status = 'Đã hết hạn';
          else status = 'Chưa dùng';
        }

        return {
          amount: tx.amount,
          type: tx.type,
          description: tx.description,
          code: tx.code || null,
          status,
          created_at: new Date(tx.created_at).toLocaleString('vi-VN'),
          isAdd: tx.amount > 0
        };
      });

      res.json({
        currentPage: page,
        totalPages,
        history
      });
    });
  });
});


router.post('/apply-voucher', (req, res) => {
  const userId = req.user?.id;
  const { code, totalPrice } = req.body;

  if (!userId) return res.status(401).json({ error: 'Chưa đăng nhập' });
  if (!code || !totalPrice) return res.status(400).json({ error: 'Thiếu dữ liệu' });

  const sql = `
    SELECT * FROM vouchers 
    WHERE code = ? AND user_id = ? AND is_used = 0 AND expires_at > NOW()
  `;

  db.query(sql, [code, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Voucher không hợp lệ hoặc đã hết hạn' });
    }

    const foundVoucher = rows[0];
    const finalTotal = Math.max(totalPrice - foundVoucher.discount_value, 0);

    // Đánh dấu voucher đã dùng
    db.query('UPDATE vouchers SET is_used = 1, used_at = NOW() WHERE id = ?', [foundVoucher.id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Lỗi cập nhật voucher' });

      res.json({
        message: `Áp dụng voucher thành công! Giảm ${foundVoucher.discount_value}đ`,
        discount: foundVoucher.discount_value,
        finalTotal
      });
    });
  });
});


module.exports = router;
