import { useEffect, useState } from "react";
import { api } from "../api";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  async function load() {
    const [s, t, j] = await Promise.all([api("/stats"), api("/teams"), api("/judges")]);
    setStats(s);
    setTeams(t);
    setJudges(j);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function addJudge(e) {
    e.preventDefault();
    setError("");
    try {
      await api("/judges", { method: "POST", body: form });
      setForm({ name: "", email: "", password: "" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(kind, id, label) {
    if (!window.confirm(`Delete ${label}? Their scores are deleted too.`)) return;
    try {
      await api(`/${kind}/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <h2>Admin</h2>
      {error && <p className="error">{error}</p>}
      {stats && (
        <div className="stats">
          <div className="card stat"><strong>{stats.teams}</strong><span>Teams</span></div>
          <div className="card stat"><strong>{stats.judges}</strong><span>Judges</span></div>
          <div className="card stat">
            <strong>{stats.scoreSheets}/{stats.expectedSheets}</strong><span>Score sheets in</span>
          </div>
        </div>
      )}

      <h3>Judges</h3>
      <form className="card grid4" onSubmit={addJudge}>
        <input placeholder="Name" value={form.name} onChange={set("name")} required />
        <input type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
        <input type="password" placeholder="Password (8+ chars)" minLength="8" value={form.password} onChange={set("password")} required />
        <button className="btn">Add judge</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th></th></tr></thead>
          <tbody>
            {judges.map((j) => (
              <tr key={j._id}>
                <td>{j.name}</td><td>{j.email}</td>
                <td><button className="link-btn danger" onClick={() => remove("judges", j._id, j.name)}>Delete</button></td>
              </tr>
            ))}
            {judges.length === 0 && <tr><td colSpan="3">No judges yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <h3>Registered teams</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Team</th><th>Project</th><th>Track</th><th>Leader</th><th>Members</th><th></th></tr></thead>
          <tbody>
            {teams.map((t) => (
              <tr key={t._id}>
                <td><strong>{t.name}</strong></td><td>{t.project}</td><td>{t.track}</td>
                <td>{t.leaderEmail}</td><td>{t.members.length}</td>
                <td><button className="link-btn danger" onClick={() => remove("teams", t._id, t.name)}>Delete</button></td>
              </tr>
            ))}
            {teams.length === 0 && <tr><td colSpan="6">No teams yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
