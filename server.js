const express = require('express'); // Thư viện Express để xây dựng ứng dụng web
const cors = require('cors'); // Thư viện để xử lý CORS (Cross-Origin Resource Sharing)
const path = require('path'); // Thư viện để xử lý đường dẫn và tệp tin
const db = require('./db'); // Kết nối đến cơ sở dữ liệu
const session = require('express-session'); // Thư viện để quản lý phiên làm việc của người dùng
const authRoutes = require('./routes/auth'); // routes cho việc xác thực người dùng
const userRoutes = require('./routes/user'); // routes cho việc quản lý người dùng
const productRoutes = require('./routes/products'); // routes cho việc quản lý sản phẩm
const feedbackRoutes = require('./routes/feedback'); // routes cho việc quản lý phản hồi
const cartRouter = require('./routes/cart'); // routes cho việc quản lý giỏ hàng
const ReportRoutes = require('./routes/reports'); // routes cho việc báo cáo thống kê
const paymentRoute = require('./routes/payment')(db);
const chatbotRoutes = require('./routes/chatbot');

require('dotenv').config();

const app = express();
// Cấu hình CORS để cho phép truy cập từ client
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
// Cấu hình session để lưu trữ thông tin người dùng
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 3600000
  }
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Thư mục chứa các tệp tĩnh như HTML, CSS, JS
app.use('/api/payment', paymentRoute);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reports', ReportRoutes); // đường dẫn API cho báo cáo thống kê
app.use('/api/products', productRoutes); // Đường dẫn API cho sản phẩm
app.use('/api/feedback', feedbackRoutes); // Đường dẫn API cho phản hồi
app.use('/api/cart', cartRouter); // Đường dẫn API cho giỏ hàng
app.use('/api/auth', authRoutes(db)); // Đường dẫn API cho xác thực người dùng
app.use('/api/user', userRoutes(db)); // Đường dẫn API cho quản lý người dùng
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); 
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
