/**
 * @file routes/games.routes.js
 * @description 比赛相关的API路由 (API routes for games)
 */
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authenticateToken } = require('../middleware/auth');

// 对此文件中的所有路由应用认证中间件
// Apply the authentication middleware to all routes in this file.
router.use(authenticateToken);

// @route   POST /api/games
// @desc    创建一场新的快速比赛 (Create a new quick game)
router.post('/', gameController.createGame);

// @route   POST /api/games/:id/confirm
// @desc    确认一场比赛的结果 (Confirm a game result)
router.post('/:id/confirm', gameController.confirmGame);

module.exports = router;

