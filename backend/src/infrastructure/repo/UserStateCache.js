const redis = require("../redis/redisClient");

class UserStateCache {
  async get(userId) {
    const data = await redis.get(`user_state:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async set(userId, state, ttl = 600) {
    await redis.set(
      `user_state:${userId}`,
      JSON.stringify(state),
      "EX",
      ttl
    );
  }

  async invalidate(userId) {
    await redis.del(`user_state:${userId}`);
  }
}

module.exports = new UserStateCache();
