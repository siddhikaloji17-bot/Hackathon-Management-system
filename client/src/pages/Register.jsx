import { useEffect, useState } from "react";
import { api } from "../api";

const emptyMember = () => ({ name: "", email: "" });

export default function Register() {
  const [tracks, setTracks] = useState([]);
  const [form, setForm] = useState({ name: "", project: "", track: "", college: "", leaderEmail: "" });
  const [members, setMembers] = useState([emptyMember()]);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/config").then((c) => setTracks(c.tracks)).catch(() => setError("Could not reach the server"));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setMember = (i, k, v) => setMembers(members.map((m, j) => (j === i ? { ...m, [k]: v } : m)));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api("/teams", { method: "POST", body: { ...form, members } });
      setDone(res.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card narrow">
        <h2>You are registered</h2>
        <p>Team <strong>{done}</strong> is in. Good luck!</p>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Register your team</h2>
      <div className="grid2">
        <label>Team name
          <input value={form.name} onChange={set("name")} required />
        </label>
        <label>Project title
          <input value={form.project} onChange={set("project")} required />
        </label>
        <label>Track
          <select value={form.track} onChange={set("track")} required>
            <option value="">Select a track</option>
            {tracks.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <label>College / organisation
          <input value={form.college} onChange={set("college")} />
        </label>
        <label>Team leader email
          <input type="email" value={form.leaderEmail} onChange={set("leaderEmail")} required />
        </label>
      </div>

      <h3>Members ({members.length}/4)</h3>
      {members.map((m, i) => (
        <div className="grid2 member" key={i}>
          <input placeholder="Name" value={m.name} onChange={(e) => setMember(i, "name", e.target.value)} required />
          <input type="email" placeholder="Email" value={m.email} onChange={(e) => setMember(i, "email", e.target.value)} required />
          {members.length > 1 && (
            <button type="button" className="link-btn" onClick={() => setMembers(members.filter((_, j) => j !== i))}>Remove</button>
          )}
        </div>
      ))}
      {members.length < 4 && (
        <button type="button" className="btn secondary small" onClick={() => setMembers([...members, emptyMember()])}>
          + Add member
        </button>
      )}

      {error && <p className="error">{error}</p>}
      <div><button className="btn" disabled={busy}>{busy ? "Submitting..." : "Register team"}</button></div>
    </form>
  );
}
