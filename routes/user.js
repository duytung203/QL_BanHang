const express = require('express');
const db = require('../db');
const bcrypt = require('bcrypt');

module.exports = (db) => {
  const router = express.Router();


// Lấy danh sách người dùng
router.get('/', (req, res) => {
  db.query('SELECT id, username, email, role FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Thêm người dùng
router.post('/', async (req, res) => {
  const { username, email, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users SET ?', { username, email, password: hashed, role }, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Thêm người dùng thành công' });
  });
});

// Cập nhật người dùng
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;
  db.query('UPDATE users SET ? WHERE id = ?', [{ username, email, role }, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Cập nhật thành công' });
  });
});

// Xoá người dùng
router.delete('/:id', (req, res) => {
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Xoá thành công' });
  });
});

// Reset mật khẩu
router.put('/:id/reset', async (req, res) => {
  const { id } = req.params;
  const newPassword = await bcrypt.hash('123456', 10);
  db.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Đặt lại mật khẩu thành công (123456)' });
  });
});

 // load người dùng
router.get('/info', (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  const sql = 'SELECT username, email FROM users WHERE id = ?';
  db.query(sql, [req.session.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi máy chủ" });
    if (results.length === 0) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json(results[0]);
  });
});


// Cập nhật username hoặc email

router.post('/update', (req, res) => {
  const { username, email } = req.body;
  const userId = req.session.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  const updates = [];
  const values = [];

  if (username) {
    if (username.trim() === '') {
      return res.status(400).json({ message: "Tên người dùng không hợp lệ" });
    }
    updates.push('username = ?');
    values.push(username.trim());
  }

  if (email) {
    if (email.trim() === '') {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }
    updates.push('email = ?');
    values.push(email.trim());
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
  }

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  values.push(userId);

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Email đã tồn tại vui lòng nhập email khác.", error: err });
    }
    res.json({ message: "Cập nhật thành công" });
  });
});




// Đổi mật khẩu
router.post('/password', (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.session.user?.id;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  const sqlGet = 'SELECT password FROM users WHERE id = ?';
  db.query(sqlGet, [userId], async (err, results) => {
  if (err) return res.status(500).json({ message: "Lỗi máy chủ" });
  if (results.length === 0) return res.status(404).json({ message: "Không tìm thấy người dùng" });

  const match = await bcrypt.compare(oldPassword, results[0].password);
  if (!match) return res.status(403).json({ message: "Mật khẩu cũ không đúng" });

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const sqlUpdate = 'UPDATE users SET password = ? WHERE id = ?';
  db.query(sqlUpdate, [hashedPassword, userId], (err) => {
    if (err) return res.status(500).json({ message: "Lỗi khi cập nhật mật khẩu" });
    res.json({ message: "Đổi mật khẩu thành công" });
  });
});
})
return router;
};
