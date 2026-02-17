const { Redis } = require("@upstash/redis");
require("dotenv").config();

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error("REDIS_URL not defined in .env");
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// const redis = new Redis(process.env.UPSTASH_REDIS_REST_URL, {
//   tls: {}, // REQUIRED for Upstash (TLS)
//   maxRetriesPerRequest: 2,
//   enableReadyCheck: false, // Upstash works better with this disabled
//   retryStrategy(times) {
//     if (times > 5) {
//       return null; // stop retrying
//     }
//     return Math.min(times * 100, 2000);
//   },
// });

(async () => {
  try {
    const data = await redis.get("key");
    console.log("Data:",data);
  } catch (error) {
    console.error("Error:", error);
  }
})();

module.exports = redis;
