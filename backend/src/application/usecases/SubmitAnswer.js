const pool = require("../../infrastructure/db/postgres");
const adaptiveEngine = require("../../domain/services/AdaptiveEngine");
const scoreCalculator = require("../../domain/services/ScoreCalculator");

class SubmitAnswer {
  async execute({ userId, questionId, answer, stateVersion }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const stateRes = await client.query(
        "SELECT * FROM user_state WHERE user_id=$1 FOR UPDATE",
        [userId]
      );

      const state = stateRes.rows[0];

      if (state.state_version !== stateVersion)
        throw new Error("State version mismatch");

      const qRes = await client.query(
        "SELECT * FROM questions WHERE id=$1",
        [questionId]
      );

      const question = qRes.rows[0];

      const correct = answer === question.correct_answer;

      let newStreak = correct ? state.streak + 1 : 0;
      let newMaxStreak = Math.max(state.max_streak, newStreak);

      const scoreDelta = correct
        ? scoreCalculator.calculate({
            difficulty: question.difficulty,
            streak: newStreak,
          })
        : 0;

      const { newMomentum, newDifficulty } =
        adaptiveEngine.calculate({
          momentum: state.momentum,
          correct,
          difficulty: state.current_difficulty,
        });

      await client.query(
        `
        INSERT INTO answer_log
        (user_id, question_id, difficulty, answer, correct, score_delta, streak_at_answer, idempotency_key)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (user_id, idempotency_key) DO NOTHING
        `,
        [
          userId,
          questionId,
          question.difficulty,
          answer,
          correct,
          scoreDelta,
          newStreak,
          `${userId}-${questionId}-${stateVersion}`,
        ]
      );

      const update = await client.query(
        `
        UPDATE user_state
        SET current_difficulty=$1,
            streak=$2,
            max_streak=$3,
            total_score=total_score + $4,
            total_answered=total_answered + 1,
            total_correct=total_correct + $5,
            momentum=$6,
            state_version=state_version + 1,
            last_question_id=$7,
            last_answer_at=NOW(),
            updated_at=NOW()
        WHERE user_id=$8 AND state_version=$9
        `,
        [
          newDifficulty,
          newStreak,
          newMaxStreak,
          scoreDelta,
          correct ? 1 : 0,
          newMomentum,
          questionId,
          userId,
          stateVersion,
        ]
      );

      if (update.rowCount === 0)
        throw new Error("Concurrent update detected");

      await client.query(
        `UPDATE leaderboard_score
         SET total_score = total_score + $1, updated_at=NOW()
         WHERE user_id=$2`,
        [scoreDelta, userId]
      );

      await client.query(
        `UPDATE leaderboard_streak
         SET max_streak=$1, updated_at=NOW()
         WHERE user_id=$2`,
        [newMaxStreak, userId]
      );

      await client.query("COMMIT");

      return {
        correct,
        scoreDelta,
        newStreak,
        newDifficulty,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = new SubmitAnswer();
