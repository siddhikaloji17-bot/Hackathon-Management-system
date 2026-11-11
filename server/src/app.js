import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { User, Team, Score, TRACKS } from "./models/index.js";
import { signToken, requireAuth, requireRole } from "./middleware/auth.js";
import { CRITERIA, validateScores, buildLeaderboard } from "./lib/scoring.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // Static config the frontend needs to render forms.
  app.get("/api/config", (_req, res) => res.json({ criteria: CRITERIA, tracks: TRACKS }));

  // ---------- Auth ----------
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || !password)
      return res.status(400).json({ error: "Email and password are required" });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) return res.status(401).json({ error: "Wrong email or password" });
    res.json({ token: signToken(user), user: { id: user._id, name: user.name, role: user.role } });
  });

  // ---------- Teams ----------
  // Public: any team can register.
  app.post("/api/teams", async (req, res) => {
    const { name, project, track, college, leaderEmail, members } = req.body || {};
    if (typeof name !== "string" || !name.trim() || typeof project !== "string" || !project.trim())
      return res.status(400).json({ error: "Team name and project title are required" });
    if (!TRACKS.includes(track)) return res.status(400).json({ error: "Pick a valid track" });
    if (typeof leaderEmail !== "string" || !EMAIL_RE.test(leaderEmail.trim()))
      return res.status(400).json({ error: "Enter a valid leader email" });
    if (college !== undefined && college !== null && typeof college !== "string")
      return res.status(400).json({ error: "College / organisation must be text" });
    if (!Array.isArray(members) || members.length < 1 || members.length > 4)
      return res.status(400).json({ error: "A team needs 1 to 4 members" });
    for (const m of members) {
      if (
        typeof m?.name !== "string" ||
        !m.name.trim() ||
        typeof m.email !== "string" ||
        !EMAIL_RE.test(m.email.trim())
      )
        return res.status(400).json({ error: "Every member needs a name and a valid email" });
    }
    try {
      const team = await Team.create({
        name,
        project,
        track,
        college,
        leaderEmail,
        members: members.map((m) => ({ name: m.name, email: m.email })),
      });
      res.status(201).json({ id: team._id, name: team.name });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: "A team with this name is already registered" });
      throw err;
    }
  });

  // Judges and admins can see the team list (the judge needs it to pick a team).
  app.get("/api/teams", requireAuth, requireRole("admin", "judge"), async (_req, res) => {
    const teams = await Team.find().sort({ createdAt: 1 });
    res.json(teams);
  });

  app.delete("/api/teams/:id", requireAuth, requireRole("admin"), async (req, res) => {
    await Score.deleteMany({ team: req.params.id });
    await Team.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  });

  // ---------- Judges (admin only) ----------
  app.get("/api/judges", requireAuth, requireRole("admin"), async (_req, res) => {
    const judges = await User.find({ role: "judge" }).select("name email createdAt");
    res.json(judges);
  });

  app.post("/api/judges", requireAuth, requireRole("admin"), async (req, res) => {
    const { name, email, password } = req.body || {};
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !EMAIL_RE.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 8
    )
      return res.status(400).json({ error: "Name, valid email and a password of 8+ characters are required" });
    try {
      const passwordHash = await bcrypt.hash(String(password), 10);
      const judge = await User.create({ name, email, passwordHash, role: "judge" });
      res.status(201).json({ id: judge._id, name: judge.name, email: judge.email });
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ error: "That email is already in use" });
      throw err;
    }
  });

  app.delete("/api/judges/:id", requireAuth, requireRole("admin"), async (req, res) => {
    await Score.deleteMany({ judge: req.params.id });
    await User.deleteOne({ _id: req.params.id, role: "judge" });
    res.json({ ok: true });
  });

  // ---------- Scoring (judges) ----------
  // The logged-in judge's own score sheets, so the form can be pre-filled.
  app.get("/api/scores/mine", requireAuth, requireRole("judge"), async (req, res) => {
    const mine = await Score.find({ judge: req.user.id });
    res.json(mine);
  });

  // Submit or update this judge's score for a team.
  app.put("/api/scores/:teamId", requireAuth, requireRole("judge"), async (req, res) => {
    const { scores, comment } = req.body || {};
    if (comment !== undefined && typeof comment !== "string")
      return res.status(400).json({ error: "Comment must be text" });
    const problem = validateScores(scores);
    if (problem) return res.status(400).json({ error: problem });
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });
    const clean = {};
    for (const c of CRITERIA) clean[c.key] = scores[c.key];
    const saved = await Score.findOneAndUpdate(
      { team: team._id, judge: req.user.id },
      { scores: clean, comment: String(comment || "").slice(0, 500) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(saved);
  });

  // ---------- Leaderboard (public) ----------
  app.get("/api/leaderboard", async (req, res) => {
    const track = req.query.track;
    const filter = track && TRACKS.includes(track) ? { track } : {};
    const teams = await Team.find(filter);
    const scores = await Score.find({ team: { $in: teams.map((t) => t._id) } });
    const board = buildLeaderboard(
      teams.map((t) => ({ id: t._id, name: t.name, project: t.project, track: t.track })),
      scores.map((s) => ({ teamId: s.team, judgeId: s.judge, scores: s.scores }))
    );
    res.json(board);
  });

  // Admin dashboard numbers.
  app.get("/api/stats", requireAuth, requireRole("admin"), async (_req, res) => {
    const [teams, judges, scores] = await Promise.all([
      Team.countDocuments(),
      User.countDocuments({ role: "judge" }),
      Score.countDocuments(),
    ]);
    res.json({ teams, judges, scoreSheets: scores, expectedSheets: teams * judges });
  });

  // Catch errors from async routes.
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error(err);
    if (err.name === "ValidationError") return res.status(400).json({ error: err.message });
    res.status(500).json({ error: "Something went wrong" });
  });

  return app;
}
