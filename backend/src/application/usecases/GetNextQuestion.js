const pool = require("../../infrastructure/db/postgres");

class GetNextQuestion {
  async execute(userId) {
    const state = await pool.query(
      "SELECT * FROM user_state WHERE user_id = $1",
      [userId]
    );

    const difficulty = state.rows[0].current_difficulty;

    const questions = await pool.query(
      `SELECT id, difficulty, prompt, choices
       FROM questions
       WHERE difficulty = $1`,
      [difficulty]
    );

    const list = questions.rows;
    const random = list[Math.floor(Math.random() * list.length)];

    return {
      questionId: random.id,
      difficulty: random.difficulty,
      prompt: random.prompt,
      choices: random.choices,
      stateVersion: state.rows[0].state_version,
      currentScore: state.rows[0].total_score,
      currentStreak: state.rows[0].streak,
    };
  }
}

module.exports = new GetNextQuestion();
