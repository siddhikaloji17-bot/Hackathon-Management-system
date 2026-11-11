import test from "node:test";
import assert from "node:assert/strict";
import { validateScores, weightedTotal, buildLeaderboard } from "../src/lib/scoring.js";

const sheet = (n) => ({ innovation: n, technical: n, design: n, impact: n, presentation: n });

test("validateScores accepts a full valid sheet", () => {
  assert.equal(validateScores(sheet(7)), null);
});

test("validateScores rejects out-of-range and missing values", () => {
  assert.match(validateScores({ ...sheet(5), design: 11 }), /Design/);
  assert.match(validateScores({ ...sheet(5), impact: -1 }), /Impact/);
  const { technical, ...missing } = sheet(5);
  assert.match(validateScores(missing), /Technical/);
  assert.ok(validateScores(null));
});

test("weightedTotal is out of 100", () => {
  assert.equal(weightedTotal(sheet(10)), 100);
  assert.equal(weightedTotal(sheet(0)), 0);
  assert.equal(weightedTotal(sheet(5)), 50);
});

const teams = [
  { id: "a", name: "Alpha", project: "A", track: "Web Dev" },
  { id: "b", name: "Beta", project: "B", track: "Web Dev" },
  { id: "c", name: "Gamma", project: "C", track: "UI/UX" },
  { id: "d", name: "Delta", project: "D", track: "UI/UX" },
];

test("leaderboard averages across judges and ranks highest first", () => {
  const scores = [
    { teamId: "a", judgeId: "j1", scores: sheet(6) },
    { teamId: "a", judgeId: "j2", scores: sheet(8) }, // avg 70
    { teamId: "b", judgeId: "j1", scores: sheet(9) }, // avg 90
  ];
  const board = buildLeaderboard(teams, scores);
  assert.deepEqual(board.slice(0, 2).map((r) => r.name), ["Beta", "Alpha"]);
  assert.equal(board[0].average, 90);
  assert.equal(board[1].average, 70);
  assert.equal(board[1].judgeCount, 2);
  assert.equal(board[0].rank, 1);
  assert.equal(board[1].rank, 2);
});

test("teams with no scores are listed last and unranked", () => {
  const board = buildLeaderboard(teams, [{ teamId: "a", judgeId: "j1", scores: sheet(5) }]);
  assert.equal(board[0].name, "Alpha");
  assert.deepEqual(board.slice(1).map((r) => r.rank), [null, null, null]);
});

test("ties are broken by innovation, then technical", () => {
  const a = { innovation: 9, technical: 5, design: 5, impact: 5, presentation: 5 };
  // Same weighted total as `a` but lower innovation: shift weight into design (0.2) instead.
  // a: 9*.25 + 5*.25 + 5*.2 + 5*.2 + 5*.1 = 6.0
  const b = { innovation: 5, technical: 5, design: 9 + 0.25 / 0.2 - 0.25 / 0.2 + 1.25, impact: 5, presentation: 5 };
  // Make totals identical by construction instead of guessing:
  b.design = (weightedTotal(a) / 10 - (5 * 0.25 + 5 * 0.25 + 5 * 0.2 + 5 * 0.1)) / 0.2;
  assert.ok(b.design <= 10);
  assert.equal(weightedTotal(a), weightedTotal(b));
  const board = buildLeaderboard(teams.slice(0, 2), [
    { teamId: "a", judgeId: "j1", scores: b }, // Alpha: lower innovation
    { teamId: "b", judgeId: "j1", scores: a }, // Beta: higher innovation, same total
  ]);
  assert.equal(board[0].name, "Beta");
  assert.equal(board[0].rank, 1);
  assert.equal(board[1].rank, 2);
});

test("identical results share a rank", () => {
  const board = buildLeaderboard(teams.slice(0, 2), [
    { teamId: "a", judgeId: "j1", scores: sheet(7) },
    { teamId: "b", judgeId: "j1", scores: sheet(7) },
  ]);
  assert.equal(board[0].rank, 1);
  assert.equal(board[1].rank, 1);
});
