const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// 假设您的认证中间件位于 middleware/auth.js 并导出了 authenticateToken 函数
// 如果该文件尚不存在，可以暂时注释掉下面这行
// const { authenticateToken } = require('../middleware/auth'); 

// --- 公开的认证路由 ---

// @route   POST /api/auth/login/email
// @desc    请求发送邮件登录链接
router.post('/login/email', authController.requestEmailLogin);

// @route   GET /api/auth/verify/email
// @desc    验证邮件链接令牌并登录
router.get('/verify/email', authController.verifyEmailToken);


// --- 需要认证的私有路由 ---

// @route   GET /api/users/me
// @desc    获取当前登录用户的信息
// 注意：这个路由通常放在 users.js 文件中，但放在这里用于演示也可以工作
// 当您创建好 auth 中间件后，可以取消这行的注释
// router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;