const express = require("express");
const router = express.Router();
const quizController = require("../controllers/QuizController");

router.get("/next", quizController.next);
router.post("/answer", quizController.answer);

module.exports = router;
