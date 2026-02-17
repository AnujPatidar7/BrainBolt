const express = require("express");
const router = express.Router();
const leaderboardController = require("../controllers/LeaderboardController");

router.get("/score", leaderboardController.score);
router.get("/streak", leaderboardController.streak);

module.exports = router;
