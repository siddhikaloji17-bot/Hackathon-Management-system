import { useEffect, useState } from "react";
import { api } from "../api";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [config, setConfig] = useState({ tracks: [], criteria: [] });
  const [track, setTrack] = useState("");
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    api("/config").then(setConfig).catch(() => {});
  }, []);

  // Refresh every 10 seconds so the board stays live during judging.
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const data = await api("/leaderboard" + (track ? `?track=${encodeURIComponent(track)}` : ""));
        if (alive) {
          setRows(data);
          setUpdated(new Date());
          setError("");
        }
      } catch (err) {
        if (alive) setError(err.message);
      }
    }
    load();
    const id = setInterval(load, 10000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [track]);

  return (
    <div>
      <div className="row between">
        <h2>Leaderboard</h2>
        <select value={track} onChange={(e) => setTrack(e.target.value)}>
          <option value="">All tracks</option>
          {config.tracks.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rank</th><th>Team</th><th>Project</th><th>Track</th>
              {config.criteria.map((c) => <th key={c.key} className="hide-sm">{c.label}</th>)}
              <th>Judges</th><th>Score /100</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6 + config.criteria.length}>No teams yet.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.teamId} className={r.rank && r.rank <= 3 ? `top top${r.rank}` : ""}>
                <td>{r.rank ?? "-"}</td>
                <td><strong>{r.name}</strong></td>
                <td>{r.project}</td>
                <td>{r.track}</td>
                {config.criteria.map((c) => (
                  <td key={c.key} className="hide-sm">{r.judgeCount ? r.criteriaAvg[c.key].toFixed(1) : "-"}</td>
                ))}
                <td>{r.judgeCount}</td>
                <td><strong>{r.judgeCount ? r.average.toFixed(2) : "-"}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">
        Score is each judge's weighted total, averaged across judges. Ties go to higher Innovation, then Technical Depth.
        {updated && ` Updated ${updated.toLocaleTimeString()}.`}
      </p>
    </div>
  );
}
