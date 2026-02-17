const getNextQuestion = require("../../application/usecases/GetNextQuestion");
const submitAnswer = require("../../application/usecases/SubmitAnswer");

class QuizController {
  async next(req, res, next) {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }

      const response = await getNextQuestion.execute({ userId });

      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  async answer(req, res, next) {
    try {
      const {
        userId,
        questionId,
        answer,
        stateVersion,
        idempotencyKey,
      } = req.body;

      if (!userId || !questionId || !answer || !idempotencyKey) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const response = await submitAnswer.execute({
        userId,
        questionId,
        answer,
        stateVersion,
        idempotencyKey,
      });

      res.json(response);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new QuizController();
