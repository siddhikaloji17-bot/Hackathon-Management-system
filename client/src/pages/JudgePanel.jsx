import { useEffect, useState } from "react";
import { api } from "../api";

export default function JudgePanel() {
  const [config, setConfig] = useState({ criteria: [] });
  const [teams, setTeams] = useState([]);
  const [mine, setMine] = useState({}); // teamId -> saved score sheet
  const [teamId, setTeamId] = useState("");
  const [scores, setScores] = useState({});
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    const [c, t, m] = await Promise.all([api("/config"), api("/teams"), api("/scores/mine")]);
    setConfig(c);
    setTeams(t);
    setMine(Object.fromEntries(m.map((s) => [String(s.team), s])));
  }

  useEffect(() => {
    loadAll().catch((e) => setMsg({ type: "error", text: e.message }));
  }, []);

  // When a team is picked, pre-fill the form with this judge's earlier scores.
  useEffect(() => {
    if (!teamId) return;
    const saved = mine[teamId];
    const blank = Object.fromEntries(config.criteria.map((c) => [c.key, 5]));
    setScores(saved ? { ...blank, ...saved.scores } : blank);
    setComment(saved?.comment || "");
    setMsg({ type: "", text: "" });
  }, [teamId, config]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg({ type: "", text: "" });
    try {
      const saved = await api(`/scores/${teamId}`, { method: "PUT", body: { scores, comment } });
      setMine({ ...mine, [teamId]: saved });
      setMsg({ type: "ok", text: "Score saved. The leaderboard is updated." });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  }

  const done = Object.keys(mine).length;

  return (
    <div>
      <h2>Score teams</h2>
      <p className="muted">You have scored {done} of {teams.length} teams. You can change a score any time.</p>
      <div className="split">
        <ul className="team-list">
          {teams.map((t) => (
            <li key={t._id}>
              <button className={teamId === t._id ? "active" : ""} onClick={() => setTeamId(t._id)}>
                <span>{t.name}</span>
                <small>{t.track}</small>
                {mine[t._id] && <span className="tick" title="Scored">✓</span>}
              </button>
            </li>
          ))}
          {teams.length === 0 && <li className="muted">No teams registered yet.</li>}
        </ul>

        {teamId ? (
          <form className="card" onSubmit={save}>
            {(() => {
              const t = teams.find((x) => x._id === teamId);
              return (
                <>
                  <h3>{t?.name}</h3>
                  <p className="muted">{t?.project} · {t?.track}</p>
                </>
              );
            })()}
            {config.criteria.map((c) => (
              <label key={c.key} className="slider">
                <span>{c.label} <small>({Math.round(c.weight * 100)}%)</small></span>
                <input
                  type="range" min="0" max="10" step="0.5"
                  value={scores[c.key] ?? 5}
                  onChange={(e) => setScores({ ...scores, [c.key]: Number(e.target.value) })}
                />
                <output>{scores[c.key] ?? 5}</output>
              </label>
            ))}
            <label>Comment (optional)
              <textarea rows="3" maxLength="500" value={comment} onChange={(e) => setComment(e.target.value)} />
            </label>
            {msg.text && <p className={msg.type === "error" ? "error" : "ok"}>{msg.text}</p>}
            <div><button className="btn" disabled={busy}>{busy ? "Saving..." : mine[teamId] ? "Update score" : "Submit score"}</button></div>
          </form>
        ) : (
          <div className="card"><p className="muted">Pick a team on the left to score it.</p></div>
        )}
      </div>
    </div>
  );
}
