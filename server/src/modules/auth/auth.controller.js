const bcrypt = require("bcrypt");
const User = require("../../models/User");
const { signToken } = require("../../utils/jwt");
const { registerSchema, loginSchema } = require("./auth.validation");

async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation error", data: parsed.error.flatten() });
  }

  const { name, email, password, role } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ success: false, message: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });

  const token = signToken({ userId: user._id.toString(), role: user.role });

  return res.status(201).json({
    success: true,
    message: "Registered successfully",
    data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
  });
}

async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Validation error", data: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const token = signToken({ userId: user._id.toString(), role: user.role });

  return res.json({
    success: true,
    message: "Logged in successfully",
    data: { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } },
  });
}

async function me(req, res) {
  return res.json({ success: true, message: "OK", data: req.user });
}

module.exports = { register, login, me };
