const express = require('express');
const router = express.Router();
const db = require('../db');
const app = express(); 

// Route lấy sản phẩm nổi bật (featured)
router.get('/featured', (req, res) => {
     const sql = `
    SELECT 
  p.name, 
  p.image, 
  p.price,
  SUM(od.quantity) AS total_sold
FROM order_items od
JOIN products p ON od.product_id = p.id
GROUP BY p.id, p.name, p.image, p.price
ORDER BY total_sold DESC
LIMIT 5;
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Route lấy tất cả khuyến mãi (promotions)
router.get('/promotions', (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const query = `
    SELECT p.*, 
      ROUND(p.price * (1 - pr.discount_percent / 100)) AS discounted_price,
      pr.discount_percent, pr.start_date, pr.end_date
    FROM products p
    JOIN promotions pr ON p.id = pr.product_id
    WHERE ? BETWEEN pr.start_date AND pr.end_date
  `;

  db.query(query, [today], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn khuyến mãi:', err);
      return res.status(400).json({ error: err.message });
    }
    res.json({ data: results });
  });
});


// Lấy danh sách khuyến mãi 
router.get('/khuyenmai', (req, res) => {
  const sql = `
    SELECT p.product_id, p.discount_percent, p.start_date, p.end_date, pr.name 
    FROM promotions p 
    JOIN products pr ON p.product_id = pr.id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    res.json(results);
  });
});


// Xoá khuyến mãi theo product_id
router.delete('/promotions/:productId', (req, res) => {
  const { productId } = req.params;
  db.query('DELETE FROM promotions WHERE product_id = ?', [productId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Xoá khuyến mãi thành công' });
  });
});
//update khuyến mãi theo product_id
router.put('/promotions/:productId', (req, res) => {
  const { productId } = req.params;
  const { discount_percent, start_date, end_date } = req.body;

  if (!discount_percent || !start_date || !end_date) {
    return res.status(400).json({ message: 'Thiếu thông tin khuyến mãi' });
  }

  const updatePromoSql = `
    UPDATE promotions
    SET discount_percent = ?, start_date = ?, end_date = ?
    WHERE product_id = ?
  `;
  
  db.query(updatePromoSql, [discount_percent, start_date, end_date, productId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Cập nhật khuyến mãi thành công' });
  });
});
//lay tat ca san pham
router.get('/', (req, res) => {
  const sql = `
    SELECT 
      p.*, 
      pr.discount_percent, 
      pr.start_date, 
      pr.end_date,
      ROUND(p.price * (1 - IFNULL(pr.discount_percent, 0)/100)) AS discounted_price
    FROM products p
    LEFT JOIN promotions pr 
      ON p.id = pr.product_id 
      AND CURDATE() BETWEEN pr.start_date AND pr.end_date
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    res.json(results);
  });
});


// tim kiem san pham
router.get('/search', (req, res) => {
  const keyword = req.query.keyword || '';
  const sql = `
    SELECT 
      p.*, 
      pr.discount_percent,
      ROUND(p.price * (1 - pr.discount_percent / 100)) AS discounted_price
    FROM products p
    LEFT JOIN promotions pr 
      ON p.id = pr.product_id 
      AND pr.start_date <= CURDATE() 
      AND pr.end_date >= CURDATE()
    WHERE p.name LIKE ?
  `;
  db.query(sql, [`%${keyword}%`], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json({ error: 'Lỗi server' });
    }
    res.json(results);
  });
});

// sap xep san pham
router.get('/sort', (req, res) => {
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const offset = (page - 1) * limit;

  let orderBy = '';
  switch (sort) {
    case 'price_asc':
      orderBy = ' ORDER BY price ASC';
      break;
    case 'price_desc':
      orderBy = ' ORDER BY price DESC';
      break;
    case 'name_asc':
      orderBy = ' ORDER BY name ASC';
      break;
    case 'name_desc':
      orderBy = ' ORDER BY name DESC';
      break;
    default:
      return res.status(400).json({ error: 'Tham số sort không hợp lệ' });
  }

  // Lấy sản phẩm theo trang
  const productQuery = `SELECT * FROM products${orderBy} LIMIT ? OFFSET ?`;
  db.query(productQuery, [limit, offset], (err, products) => {
    if (err) {
      console.error('Lỗi SQL:', err);
      return res.status(500).json({ error: 'Lỗi truy vấn sản phẩm' });
    }

    // Đếm tổng số sản phẩm
    db.query('SELECT COUNT(*) AS total FROM products', (err2, result) => {
      if (err2) {
        console.error('Lỗi đếm sản phẩm:', err2);
        return res.status(500).json({ error: 'Lỗi đếm số lượng sản phẩm' });
      }

      const total = result[0].total;
      const totalPages = Math.ceil(total / limit);
      res.json({ products, totalPages });
    });
  });
});

//san pham goi y
router.get('/:id/related', (req, res) => {
  const productId = req.params.id;
  const getCategoryQuery = 'SELECT category FROM products WHERE id = ?';

  db.query(getCategoryQuery, [productId], (err, categoryResult) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn category' });
    if (categoryResult.length === 0) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

    const category = categoryResult[0].category;
    const getRelatedQuery = `
      SELECT * FROM products
      WHERE category = ? AND id != ?
      ORDER BY RAND()
      LIMIT 6
    `;
    db.query(getRelatedQuery, [category, productId], (err, relatedResult) => {
      if (err) return res.status(500).json({ error: 'Lỗi truy vấn sản phẩm liên quan' });
      res.json(relatedResult);
    });
  });
});
//chi tiet san pham
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    return res.status(400).json({ 
      success: false,
      error: 'ID sản phẩm phải là số nguyên dương' 
    });
  }
  const sql = 'SELECT * FROM products WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Database error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    } 
    if (results.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: `Không tìm thấy sản phẩm với ID ${id}` 
      });
    }   
    const product = {
      ...results[0],
      price: parseFloat(results[0].price)
    };
    res.json({
      success: true,
      data: product
    });
  });
});

//them san pham
router.post('/add', (req, res) => {
  const { name, price, image, category, mota } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Thiếu thông tin sản phẩm' });
  }
  const query = 'INSERT INTO products (name, price, image, category, mota) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, price, image, category, mota], (err, result) => {
    if (err) {
      console.error('Lỗi khi thêm sản phẩm:', err);
      return res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm sản phẩm' });
    }
    res.status(200).json({ message: 'Sản phẩm đã được thêm thành công!', productId: result.insertId });
  });
});

// xoa san pham
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Xoá thành công' });
  });
});

// update san pham
router.put('/:id', (req, res) => {
  const { name, price, category, image, mota, promotion } = req.body;
  const id = req.params.id;

  const updateProductSql = 'UPDATE products SET name = ?, price = ?, category = ?, image = ?, mota = ? WHERE id = ?';
  const productValues = [name, price, category, image, mota, id];

  db.query(updateProductSql, productValues, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (!promotion || !promotion.discount_percent || !promotion.start_date || !promotion.end_date) {
      return res.json({ message: 'Cập nhật sản phẩm thành công (không có khuyến mãi)' });
    }

    const checkSql = 'SELECT * FROM promotions WHERE product_id = ?';
    db.query(checkSql, [id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const promoValues = [
        promotion.discount_percent,
        promotion.start_date,
        promotion.end_date,
        id
      ];

      if (rows.length > 0) {
        const updatePromoSql = `
          UPDATE promotions
          SET discount_percent = ?, start_date = ?, end_date = ?
          WHERE product_id = ?
        `;
        db.query(updatePromoSql, promoValues, (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          return res.json({ message: 'Cập nhật sản phẩm và khuyến mãi thành công' });
        });
      } else {
        const insertPromoSql = `
          INSERT INTO promotions (discount_percent, start_date, end_date, product_id)
          VALUES (?, ?, ?, ?)
        `;
        db.query(insertPromoSql, promoValues, (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          return res.json({ message: 'Cập nhật sản phẩm và thêm khuyến mãi thành công' });
        });
      }
    });
  });
});

router.get('/history/${user.id}', (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT 
      o.id AS order_id,
      o.created_at,
      o.total_price,
      o.status,
      p.name AS product_name,
      p.image,
      oi.quantity,
      oi.price AS item_price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
    return res.status(500).json({ error: 'Lỗi truy vấn lịch sử đơn hàng' });
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
    image: row.image,
    quantity: row.quantity,
    price: row.item_price
    });
  });

  res.json(Object.values(history));
  });
});

module.exports = router;

