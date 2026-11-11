import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { fileURLToPath } from "node:url";
import { User } from "./models/index.js";

// Creates the first admin account from .env if no admin exists yet.
export async function ensureAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Missing ADMIN_EMAIL or ADMIN_PASSWORD; configure both to create the initial admin account.");
  }
  if (ADMIN_PASSWORD.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters long.");
  }
  const exists = await User.findOne({ role: "admin" });
  if (exists) return;
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({ name: "Admin", email: ADMIN_EMAIL, passwordHash, role: "admin" });
  console.log(`Admin account created: ${ADMIN_EMAIL}`);
}

// Run directly with `npm run seed`.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await mongoose.connect(process.env.MONGODB_URI);
  await ensureAdmin();
  await mongoose.disconnect();
}
