import "dotenv/config";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { ensureAdmin } from "./seed.js";

const { MONGODB_URI, JWT_SECRET, PORT = 5000 } = process.env;
if (!MONGODB_URI || !JWT_SECRET) {
  console.error("Missing MONGODB_URI or JWT_SECRET. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log("MongoDB connected");
await ensureAdmin();

createApp().listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
