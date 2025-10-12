/**
 * @file routes/users.routes.js
 * @description 用户相关的API路由 (API routes for users)
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// 获取好友排行榜需要登录
// Getting the friend leaderboard requires authentication.
// @route   GET /api/users/leaderboard
// @desc    获取当前用户的好友排行榜 (Get the current user's friend leaderboard)
router.get('/leaderboard', authenticateToken, userController.getFriendsLeaderboard);

// 获取任何用户的公开资料是公开的，不需要登录
// Getting a user's public profile is a public action and does not require authentication.
// @route   GET /api/users/:id/profile
// @desc    获取指定用户的公开资料 (Get a specific user's public profile)
router.get('/:id/profile', userController.getUserProfile);


module.exports = router;

