const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

// 初始化Express应用
const app = express();

// 连接数据库
connectDB();

// 安全中间件
app.use(helmet());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP每15分钟最多100个请求
});
app.use(limiter);

// CORS配置（针对美国用户的前端域名）
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/auth', authRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Badminton Community API is running',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use((req, res, next) => {
  res.status(404).json({
     success: false,
     error: 'Endpoint not found'
   });
});
// app.use('*', (req, res) => {
//   res.status(404).json({ 
//     success: false, 
//     error: 'Endpoint not found' 
//   });
// });

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL}`);
});