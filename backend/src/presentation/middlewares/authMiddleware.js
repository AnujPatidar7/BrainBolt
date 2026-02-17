const supabaseAdmin = require("../../infrastructure/supabase/adminClient");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error("Missing token");

    const token = authHeader.replace("Bearer ", "");

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error) throw error;

    req.user = data.user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = authMiddleware;
