const pool = require("../../infrastructure/db/postgres");

class LeaderboardController {
  async score(req, res, next) {
    try {
      const result = await pool.query(`
        SELECT user_id, display_name, total_score
        FROM leaderboard_score
        ORDER BY total_score DESC
        LIMIT 50
      `);

      res.json({ top: result.rows });
    } catch (err) {
      next(err);
    }
  }

  async streak(req, res, next) {
    try {
      const result = await pool.query(`
        SELECT user_id, display_name, max_streak
        FROM leaderboard_streak
        ORDER BY max_streak DESC
        LIMIT 50
      `);

      res.json({ top: result.rows });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LeaderboardController();
