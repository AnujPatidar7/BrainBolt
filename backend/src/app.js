const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const quizRoutes = require("./presentation/routes/quizRoutes");
const leaderboardRoutes = require("./presentation/routes/leaderBoardRoutes");
const errorHandler = require("./presentation/middlewares/errorHandler");

const rateLimiter = require("./presentation/middlewares/rateLimiter");
const authRoutes = require("./presentation/routes/authRoutes");





const app = express();

app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.use(errorHandler);
app.use(rateLimiter);


module.exports = app;
