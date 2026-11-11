# Hackathon Management Platform

A full-stack web app to run a hackathon: teams register online, judges score them on one shared form, and a public leaderboard ranks teams automatically.

**Stack:** React (Vite) · Node.js + Express · MongoDB (Mongoose) · JWT authentication

## Features

- **Team registration** (public): team name, project, track, 1 to 4 members, validated on the server. Duplicate team names are rejected.
- **Judge scoring**: each judge scores every team on 5 weighted criteria (0 to 10). A judge can update a score later; there is one score sheet per judge per team.
- **Auto-generated leaderboard** (public): updates every 10 seconds, filter by track, shows per-criteria averages, and handles ties.
- **Admin dashboard**: add or remove judges, view or delete teams, see how many score sheets are in.
- **Role-based access**: admin, judge and public routes are separated with JWT and middleware. Passwords are hashed with bcrypt.

## How scoring works

| Criterion | Weight |
|---|---|
| Innovation | 25% |
| Technical Depth | 25% |
| Design & UX | 20% |
| Real-world Impact | 20% |
| Presentation | 10% |

Each judge's sheet becomes a weighted total out of 100. A team's score is the average across all judges who scored it. Ties are broken by higher Innovation, then higher Technical Depth. Teams with identical results share a rank. Teams with no scores yet are listed last. The rules are in `server/src/lib/scoring.js` and are unit tested.

## Run it locally

You need Node.js 18+ and MongoDB (local install or a free MongoDB Atlas cluster).

```bash
# 1. API
cd server
cp .env.example .env      # then edit MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run dev               # http://localhost:5000, creates the admin account on first start

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

Log in at `/login` with the admin email and password from your `.env`, add a few judges in the Admin page, register some teams, then log in as a judge and score them.

## Tests

```bash
cd server
npm test
```

13 tests cover the scoring and ranking rules, input validation, login checks and role-based access.

## API

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/login` | public |
| POST | `/api/teams` | public |
| GET | `/api/teams` | judge, admin |
| DELETE | `/api/teams/:id` | admin |
| GET / POST | `/api/judges` | admin |
| DELETE | `/api/judges/:id` | admin |
| GET | `/api/scores/mine` | judge |
| PUT | `/api/scores/:teamId` | judge |
| GET | `/api/leaderboard?track=` | public |
| GET | `/api/stats` | admin |
| GET | `/api/config` | public |

## Deploying

- **Database:** MongoDB Atlas (free tier).
- **API:** Render or Railway. Set the same variables as `.env`, and set `CLIENT_ORIGIN` to your frontend URL.
- **Frontend:** Vercel or Netlify. Run `npm run build` in `client`, and set `VITE_API_URL` to your API URL.

## Project structure

```
server/src/
  app.js            routes and validation
  models/index.js   User, Team, Score schemas
  middleware/auth.js  JWT and role checks
  lib/scoring.js    scoring and leaderboard rules (pure functions)
  seed.js           first admin account
client/src/
  pages/            Home, Register, Login, Leaderboard, JudgePanel, Admin
  api.js, auth.jsx  fetch wrapper and login state
```

## Ideas to extend it

Email confirmation to team leaders, CSV export of results, judge-score normalisation so strict and generous judges balance out, and a lock to freeze scoring when judging ends.
