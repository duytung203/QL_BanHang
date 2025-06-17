const express = require('express');
const router = express.Router();
const axios = require('axios');


// Route: POST /api/chat
router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Vui lòng nhập nội dung.' });
  }

  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: message }] }]
    });

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ AI.';
    res.json({ reply });
  } catch (error) {
    console.error('Lỗi gọi Gemini:', error.message);
    res.status(500).json({ error: 'Lỗi khi gọi API Gemini.' });
  }
});

module.exports = router;
