import { Link } from "react-router-dom";

const features = [
  { icon: "01", title: "Team registration", text: "Create your crew, add teammates, and choose the perfect challenge track." },
  { icon: "02", title: "Live judging", text: "Judges can score every project with clear criteria and instant progress tracking." },
  { icon: "03", title: "Live leaderboard", text: "See rankings update automatically and celebrate the teams leading the event." },
];

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow glow-one" />
        <div className="hero-glow glow-two" />
        <div className="hero-copy">
          <div className="eyebrow"><span /> BUILD · COLLABORATE · COMPETE</div>
          <h1>Where great ideas<br /><em>come alive.</em></h1>
          <p>The complete workspace for hackathons—from the first team registration to the final winning announcement.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/register">Register your team <span>→</span></Link>
            <Link className="btn btn-ghost" to="/leaderboard">Explore leaderboard</Link>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="code-card">
            <div className="code-card-top"><i /><i /><i /><span>build.js</span></div>
            <div className="code-lines">
              <span className="purple">const</span> idea <span className="pink">=</span> <span className="yellow">"impossible"</span>; <br />
              <span className="purple">const</span> team <span className="pink">=</span> <span className="yellow">"unstoppable"</span>; <br />
              <br /><span className="purple">export default</span> <span className="pink">()</span> <span className="purple">=&gt;</span> {'{'} <br />
              &nbsp;&nbsp;<span className="blue">build</span>(idea, team); <br />{'}'};
            </div>
            <div className="floating-badge badge-top">⚡ Idea to impact</div>
            <div className="floating-badge badge-bottom">🏆 Built to win</div>
          </div>
        </div>
      </section>

      <section className="feature-section">
        <div className="section-heading">
          <div><span className="kicker">Everything you need</span><h2>One platform. Endless possibilities.</h2></div>
          <p>Designed to keep organisers, judges, and builders focused on what matters most—innovation.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <span className="feature-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
