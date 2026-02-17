const supabaseAdmin = require("../../infrastructure/supabase/adminClient");

class AuthController {
  async signup(req, res, next) {
    try {
      const { email, password, displayName } = req.body;

      const { data, error } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { display_name: displayName }
        });

      if (error) throw error;

      return res.json({ message: "User created", user: data.user });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const { data, error } =
        await supabaseAdmin.auth.signInWithPassword({
          email,
          password,
        });

      if (error) throw error;

      return res.json({ session: data.session });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
