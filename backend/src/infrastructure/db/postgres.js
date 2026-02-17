const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in .env");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Required for Supabase SSL
  ssl: {
    rejectUnauthorized: false,
  },

  // Pool tuning for Supabase free tier
  max: 10,              // max concurrent connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection once at startup
pool.connect()
  .then(client => {
    console.log("✅ Connected to Supabase PostgreSQL");
    client.release();
  })
  .catch(err => {
    console.error("❌ Failed to connect to Supabase:", err.message);
    process.exit(1);
  });

module.exports = pool;
