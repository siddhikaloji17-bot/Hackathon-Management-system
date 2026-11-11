// Scoring rules live here, separate from the database, so they are easy to test.

// Judging criteria: each is scored 0-10 by every judge. Weights sum to 1.
export const CRITERIA = [
  { key: "innovation", label: "Innovation", weight: 0.25 },
  { key: "technical", label: "Technical Depth", weight: 0.25 },
  { key: "design", label: "Design & UX", weight: 0.2 },
  { key: "impact", label: "Real-world Impact", weight: 0.2 },
  { key: "presentation", label: "Presentation", weight: 0.1 },
];

export const MIN_SCORE = 0;
export const MAX_SCORE = 10;

// Returns an error message, or null if the scores object is valid.
export function validateScores(scores) {
  if (!scores || typeof scores !== "object") return "Scores are required";
  for (const c of CRITERIA) {
    const v = scores[c.key];
    if (typeof v !== "number" || Number.isNaN(v)) return `${c.label} must be a number`;
    if (v < MIN_SCORE || v > MAX_SCORE) return `${c.label} must be between ${MIN_SCORE} and ${MAX_SCORE}`;
  }
  return null;
}

// One judge's weighted total out of 100.
export function weightedTotal(scores) {
  const raw = CRITERIA.reduce((sum, c) => sum + scores[c.key] * c.weight, 0);
  return Math.round(raw * 10 * 100) / 100; // 0-10 scale -> 0-100, 2 decimals
}

// Builds the ranked leaderboard.
// teams:  [{ id, name, project, track }]
// scores: [{ teamId, judgeId, scores: {...criteria} }]
// Teams with no scores yet are listed last, unranked.
export function buildLeaderboard(teams, scores) {
  const byTeam = new Map();
  for (const s of scores) {
    const key = String(s.teamId);
    if (!byTeam.has(key)) byTeam.set(key, []);
    byTeam.get(key).push(s);
  }

  const rows = teams.map((t) => {
    const list = byTeam.get(String(t.id)) || [];
    const totals = list.map((s) => weightedTotal(s.scores));
    const judgeCount = list.length;
    const average = judgeCount ? totals.reduce((a, b) => a + b, 0) / judgeCount : 0;
    const criteriaAvg = {};
    for (const c of CRITERIA) {
      criteriaAvg[c.key] = judgeCount
        ? Math.round((list.reduce((a, s) => a + s.scores[c.key], 0) / judgeCount) * 100) / 100
        : 0;
    }
    return {
      teamId: String(t.id),
      name: t.name,
      project: t.project,
      track: t.track,
      judgeCount,
      average: Math.round(average * 100) / 100,
      criteriaAvg,
    };
  });

  const scored = rows.filter((r) => r.judgeCount > 0);
  const unscored = rows.filter((r) => r.judgeCount === 0);

  // Higher average first. Ties: higher innovation, then technical, then name.
  scored.sort(
    (a, b) =>
      b.average - a.average ||
      b.criteriaAvg.innovation - a.criteriaAvg.innovation ||
      b.criteriaAvg.technical - a.criteriaAvg.technical ||
      a.name.localeCompare(b.name)
  );
  unscored.sort((a, b) => a.name.localeCompare(b.name));

  // Teams with identical average, innovation and technical share a rank.
  let rank = 0;
  let prev = null;
  scored.forEach((r, i) => {
    const sameAsPrev =
      prev &&
      r.average === prev.average &&
      r.criteriaAvg.innovation === prev.criteriaAvg.innovation &&
      r.criteriaAvg.technical === prev.criteriaAvg.technical;
    if (!sameAsPrev) rank = i + 1;
    r.rank = rank;
    prev = r;
  });
  unscored.forEach((r) => (r.rank = null));

  return [...scored, ...unscored];
}
