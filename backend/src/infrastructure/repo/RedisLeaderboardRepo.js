const redis = require("../redis/redisClient");

class RedisLeaderboardRepo {
  async updateScore(userId, totalScore) {
    await redis.zadd("leaderboard:score", totalScore, userId);
  }

  async updateStreak(userId, maxStreak) {
    await redis.zadd("leaderboard:streak", maxStreak, userId);
  }

  async getScoreRank(userId) {
    const rank = await redis.zrevrank("leaderboard:score", userId);
    return rank !== null ? rank + 1 : null;
  }

  async getStreakRank(userId) {
    const rank = await redis.zrevrank("leaderboard:streak", userId);
    return rank !== null ? rank + 1 : null;
  }

  async getTopScores(limit = 10) {
    return redis.zrevrange("leaderboard:score", 0, limit - 1, "WITHSCORES");
  }

  async getTopStreaks(limit = 10) {
    return redis.zrevrange("leaderboard:streak", 0, limit - 1, "WITHSCORES");
  }
}

module.exports = new RedisLeaderboardRepo();
