const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 requests per minute per IP
  message: "Too many requests, please try again later.",
});

module.exports = limiter;
