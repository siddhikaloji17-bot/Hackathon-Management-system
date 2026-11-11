import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "judge"], required: true },
  },
  { timestamps: true }
);

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { _id: false }
);

export const TRACKS = ["Web Dev", "UI/UX", "Data Science", "Cybersecurity"];

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    project: { type: String, required: true, trim: true },
    track: { type: String, enum: TRACKS, required: true },
    college: { type: String, trim: true, default: "" },
    leaderEmail: { type: String, required: true, lowercase: true, trim: true },
    members: {
      type: [memberSchema],
      validate: [(m) => m.length >= 1 && m.length <= 4, "A team needs 1 to 4 members"],
    },
  },
  { timestamps: true }
);

const scoreSchema = new mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scores: {
      innovation: { type: Number, required: true, min: 0, max: 10 },
      technical: { type: Number, required: true, min: 0, max: 10 },
      design: { type: Number, required: true, min: 0, max: 10 },
      impact: { type: Number, required: true, min: 0, max: 10 },
      presentation: { type: Number, required: true, min: 0, max: 10 },
    },
    comment: { type: String, trim: true, default: "", maxlength: 500 },
  },
  { timestamps: true }
);
// One score sheet per judge per team. Re-submitting updates it.
scoreSchema.index({ team: 1, judge: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);
export const Team = mongoose.model("Team", teamSchema);
export const Score = mongoose.model("Score", scoreSchema);
