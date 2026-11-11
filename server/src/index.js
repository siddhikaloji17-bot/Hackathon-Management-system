import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { ensureAdmin } from "./seed.js";

const { MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, PORT = 5000 } = process.env;
if (!MONGODB_URI || !JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    "Missing MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, or ADMIN_PASSWORD. Copy .env.example to .env and fill it in."
  );
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters long.");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log("MongoDB connected");
await ensureAdmin();

createApp().listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
