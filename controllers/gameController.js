/**
 * @file controllers/gameController.js
 * @description 比赛相关的业务逻辑控制器 (Controller for game-related business logic)
 */
const Game = require('../models/Game');
const User = require('../models/User');
const { updateRatings } = require('../services/ratingService');

/**
 * 创建一场新的快速比赛
 * Create a new quick game
 */
exports.createGame = async (req, res) => {
  try {
    // 从请求体和认证信息中获取数据
    // Get data from request body and authentication info
    const { opponentId, scores, winnerId } = req.body;
    const createdBy = req.user.userId; // 从认证中间件获取当前用户ID (Get current user ID from auth middleware)

    // 基础数据验证
    // Basic data validation
    if (!opponentId || !scores || !winnerId) {
      return res.status(400).json({ success: false, error: 'Opponent, scores, and winner are required.' });
    }

    // 创建新的比赛实例
    // Create a new game instance
    const newGame = new Game({
      players: [createdBy, opponentId],
      scores,
      winner: winnerId,
      createdBy: createdBy,
      pendingConfirmationFrom: opponentId
    });

    // 保存到数据库
    // Save to the database
    await newGame.save();

    res.status(201).json({ success: true, message: 'Game created. Waiting for opponent confirmation.', game: newGame });

  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({ success: false, error: 'Failed to create game.' });
  }
};

/**
 * 确认一场比赛的结果
 * Confirm a game result
 */
exports.confirmGame = async (req, res) => {
  try {
    // 从请求参数和认证信息中获取数据
    // Get data from request parameters and authentication info
    const gameId = req.params.id;
    const userId = req.user.userId;

    // 查找比赛
    // Find the game
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ success: false, error: 'Game not found.' });
    }

    // 检查当前用户是否有权限确认这场比赛
    // Check if the current user is authorized to confirm this game
    if (game.pendingConfirmationFrom.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'You are not authorized to confirm this game.' });
    }

    // 检查比赛状态是否为“待确认”
    // Check if the game status is 'pending'
    if (game.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'This game has already been resolved.' });
    }

    // --- 核心逻辑：更新积分 (Core Logic: Update Ratings) ---
    // 获取两位玩家的完整信息
    // Get full documents for both players
    const playerA = await User.findById(game.players[0]);
    const playerB = await User.findById(game.players[1]);

    const didPlayerAWin = game.winner.toString() === playerA._id.toString();

    // 调用积分服务计算新积分
    // Call the rating service to calculate new ratings
    const { newRatingA, newRatingB } = updateRatings(playerA.profile.points, playerB.profile.points, didPlayerAWin);

    const ratingChangeA = newRatingA - playerA.profile.points;
    const ratingChangeB = newRatingB - playerB.profile.points;

    // 更新玩家A的积分和统计数据
    // Update Player A's rating and stats
    playerA.profile.points = newRatingA;
    playerA.stats.gamesPlayed += 1;
    if (didPlayerAWin) playerA.stats.gamesWon += 1;
    await playerA.updateStats(); // 调用模型方法更新胜率 (Call model method to update win rate)

    // 更新玩家B的积分和统计数据
    // Update Player B's rating and stats
    playerB.profile.points = newRatingB;
    playerB.stats.gamesPlayed += 1;
    if (!didPlayerAWin) playerB.stats.gamesWon += 1;
    await playerB.updateStats(); // 调用模型方法更新胜率 (Call model method to update win rate)
    
    // 更新比赛状态和信息
    // Update the game status and information
    game.status = 'confirmed';
    game.confirmedAt = new Date();
    game.ratingChange = {
      playerA: { user: playerA._id, change: ratingChangeA },
      playerB: { user: playerB._id, change: ratingChangeB }
    };
    await game.save();

    res.status(200).json({ success: true, message: 'Game confirmed and ratings updated!', game });

  } catch (error) {
    console.error('Confirm game error:', error);
    res.status(500).json({ success: false, error: 'Failed to confirm game.' });
  }
};

