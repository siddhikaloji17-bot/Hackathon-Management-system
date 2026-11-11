// API tests that do not need a database: config, validation and access control.
import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret";
const { createApp } = await import("../src/app.js");

let server;
let base;
test.before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());

const post = (path, body, token) =>
  fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });

const tokenFor = (role) => jwt.sign({ id: "507f1f77bcf86cd799439011", role, name: "T" }, "test-secret");

test("config exposes criteria and tracks", async () => {
  const res = await fetch(base + "/api/config");
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.criteria.length, 5);
  assert.ok(data.tracks.includes("Web Dev"));
});

test("team registration rejects bad input before touching the database", async () => {
  const good = {
    name: "Team X", project: "P", track: "Web Dev", leaderEmail: "a@b.co",
    members: [{ name: "A", email: "a@b.co" }],
  };
  assert.equal((await post("/api/teams", { ...good, name: "" })).status, 400);
  assert.equal((await post("/api/teams", { ...good, name: 7 })).status, 400);
  assert.equal((await post("/api/teams", { ...good, project: {} })).status, 400);
  assert.equal((await post("/api/teams", { ...good, track: "Nope" })).status, 400);
  assert.equal((await post("/api/teams", { ...good, leaderEmail: "bad" })).status, 400);
  assert.equal((await post("/api/teams", { ...good, leaderEmail: {} })).status, 400);
  assert.equal((await post("/api/teams", { ...good, members: [] })).status, 400);
  const five = Array.from({ length: 5 }, () => ({ name: "A", email: "a@b.co" }));
  assert.equal((await post("/api/teams", { ...good, members: five })).status, 400);
  assert.equal((await post("/api/teams", { ...good, members: [{ name: "A", email: "x" }] })).status, 400);
  assert.equal((await post("/api/teams", { ...good, members: [{ name: {}, email: "a@b.co" }] })).status, 400);
  assert.equal((await post("/api/teams", { ...good, college: [] })).status, 400);
});

test("protected routes require a login", async () => {
  assert.equal((await fetch(base + "/api/teams")).status, 401);
  assert.equal((await fetch(base + "/api/judges")).status, 401);
  assert.equal((await fetch(base + "/api/stats")).status, 401);
});

test("role checks: judges cannot use admin routes, admins cannot score", async () => {
  const judge = tokenFor("judge");
  const admin = tokenFor("admin");
  assert.equal((await fetch(base + "/api/judges", { headers: { Authorization: `Bearer ${judge}` } })).status, 403);
  assert.equal((await post("/api/judges", {}, judge)).status, 403);
  const put = await fetch(base + "/api/scores/507f1f77bcf86cd799439012", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${admin}` },
    body: JSON.stringify({ scores: {} }),
  });
  assert.equal(put.status, 403);
});

test("score submission validates the score ranges", async () => {
  const res = await fetch(base + "/api/scores/507f1f77bcf86cd799439012", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenFor("judge")}` },
    body: JSON.stringify({ scores: { innovation: 11, technical: 5, design: 5, impact: 5, presentation: 5 } }),
  });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /Innovation/);
});

test("login requires email and password", async () => {
  assert.equal((await post("/api/auth/login", {})).status, 400);
});
