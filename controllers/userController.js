/**
 * @file controllers/userController.js
 * @description 用户相关的业务逻辑控制器 (Controller for user-related business logic)
 */
const User = require('../models/User');
const Game = require('../models/Game');

/**
 * 获取指定用户的公开资料
 * Get a specific user's public profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    // 查找用户，但不返回敏感信息或不必要的数据
    // Find the user, excluding sensitive or unnecessary data
    const userProfile = await User.findById(userId).select('-__v -friends -preferences');

    if (!userProfile) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // 查找该用户最近的5场已确认比赛
    // Find the 5 most recent confirmed games for this user
    const recentGames = await Game.find({
      players: userId,
      status: 'confirmed'
    })
    .sort({ confirmedAt: -1 }) // 按确认时间降序排序 (Sort by confirmation date descending)
    .limit(5)
    .populate('players', 'profile.displayName') // 填充玩家的昵称 (Populate players' display names)
    .populate('winner', 'profile.displayName'); // 填充胜者的昵称 (Populate winner's display name)

    res.status(200).json({
      success: true,
      user: userProfile,
      recentGames
    });

  } catch (error)
    {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
};

/**
 * 获取当前用户的好友排行榜
 * Get the current user's friend leaderboard
 */
exports.getFriendsLeaderboard = async (req, res) => {
  try {
    // 查找当前用户并填充其好友的必要信息
    // Find the current user and populate necessary info for their friends
    const currentUser = await User.findById(req.user.userId).populate('friends', 'profile.displayName profile.points');

    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'Current user not found.' });
    }

    // 将自己也加入排行榜进行比较
    // Add the current user to the leaderboard for comparison
    const leaderboard = [...currentUser.friends, {
      _id: currentUser._id,
      profile: currentUser.profile
    }];

    // 按积分 (points) 降序排序
    // Sort the leaderboard by points in descending order
    leaderboard.sort((a, b) => b.profile.points - a.profile.points);

    res.status(200).json({ success: true, leaderboard });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard.' });
  }
};

