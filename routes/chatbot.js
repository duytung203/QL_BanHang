const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');

const suggestionKeywords = ['mát', 'trà', 'đá', 'chanh', 'sữa', 'ngọt', 'tươi'];

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Vui lòng nhập nội dung.' });
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Prompt tiếng Việt
    const prompt = `
Bạn là trợ lý thân thiện của cửa hàng ThanhTraTea. Luôn trả lời bằng tiếng Việt, vui vẻ, dễ hiểu.

Một số quy tắc:
- Nếu người dùng hỏi về đồ uống mát, hãy đề xuất sản phẩm có đá hoặc trà.
- Nếu người dùng chào, hãy đáp lại một cách dễ thương.
- Nếu người dùng hỏi khuyến mãi, cung cấp thông tin ngắn gọn.
- Nếu người dùng nhầm lẫn chatbot với người thật, hãy xác nhận bạn là AI nhưng rất thân thiện.
- Nếu người dùng hỏi về thanh toán, hướng dẫn rõ ràng.

Người dùng hỏi: ${message}
`;
    // Gọi Gemini
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }]
    });

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '🤖 Không có phản hồi từ AI.';

    // Kiểm tra từ khóa và tìm sản phẩm nếu có liên quan
    const matchedKeyword = suggestionKeywords.find(kw => message.toLowerCase().includes(kw));
    let suggestions = [];

    if (matchedKeyword) {
      const sql = `
        SELECT p.*, pr.discount_percent,
               ROUND(p.price * (1 - IFNULL(pr.discount_percent, 0) / 100)) AS discounted_price
        FROM products p
        LEFT JOIN promotions pr 
          ON p.id = pr.product_id 
          AND pr.start_date <= CURDATE() 
          AND pr.end_date >= CURDATE()
        WHERE p.name LIKE ? OR p.mota LIKE ?
        LIMIT 3
      `;

      const keywordLike = `%${matchedKeyword}%`;
      const [rows] = await db.promise().query(sql, [keywordLike, keywordLike]);
      suggestions = rows;
    }

    // Trả về kết quả
    res.json({ reply, suggestions });

  } catch (error) {
    console.error('Lỗi khi xử lý chatbot:', error.message);
    res.status(500).json({ error: 'Lỗi máy chủ khi gọi chatbot.' });
  }
});
module.exports = router;
