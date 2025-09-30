const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuthToken = require('../models/AuthToken');
const { sendMagicLink } = require('../services/emailService');

// --- Helper Functions ---
// 生成用于邮件链接的安全随机令牌
const generateToken = () => crypto.randomBytes(32).toString('hex');

// --- Controller Functions ---

/**
 * @desc    请求发送邮件魔法登录链接
 * @route   POST /api/auth/login/email
 * @access  Public
 */
exports.requestEmailLogin = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    const token = generateToken();
    
    // 将令牌保存到数据库，等待验证
    // AuthToken 模型会自动处理过期时间
    await AuthToken.create({
      email: email.toLowerCase(),
      token,
      type: 'email'
    });

    // 调用邮件服务发送魔法链接
    await sendMagicLink(email, token);

    res.json({ 
      success: true, 
      message: 'Login link sent to your email. Please check your inbox.' 
    });

  } catch (error) {
    console.error('Email login request error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process request' 
    });
  }
};

/**
 * @desc    验证邮箱魔法链接并登录或注册用户
 * @route   GET /api/auth/verify/email?token=...
 * @access  Public
 */
exports.verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ success: false, error: 'Token is required.' });
    }

    // 在数据库中查找有效、未使用、未过期的令牌
    const authToken = await AuthToken.findOne({
      token,
      type: 'email',
      used: false,
      expiresAt: { $gt: new Date() } // 确保令牌未过期
    });

    if (!authToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'This link is invalid or has expired. Please request a new one.' 
      });
    }

    // 关键步骤: 将令牌标记为已使用，防止重复攻击
    authToken.used = true;
    await authToken.save();

    // 查找或创建用户
    let user = await User.findOne({ email: authToken.email });
    const isNewUser = !user;
    
    if (isNewUser) {
      const emailUsername = authToken.email.split('@')[0];
      user = await User.create({ 
        email: authToken.email,
        // 关键：为无密码用户创建一个唯一的 firebaseUid
        firebaseUid: `email|${authToken.email}`, 
        profile: { 
          displayName: emailUsername,
          firstName: emailUsername 
        }
      });
    }

    // 更新用户的最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 为用户生成 JWT (JSON Web Token) 作为登录凭证
    const jwtToken = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回成功响应，包括 token 和用户信息
    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        isNewUser
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Verification failed due to a server error.' 
    });
  }
};

/**
 * @desc    获取当前已登录用户的信息
 * @route   GET /api/users/me
 * @access  Private (需要 auth 中间件)
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user.userId 是由 auth 中间件在验证 JWT 后附加的
    const user = await User.findById(req.user.userId)
      .select('-__v') // 排除 Mongoose 添加的 __v 字段
      .populate('friends', 'profile.displayName profile.avatar'); // 关联查询好友信息
    
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found.' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to retrieve user data.' 
    });
  }
};

