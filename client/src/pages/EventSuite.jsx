import { useEffect, useMemo, useState } from "react";

const challengeDomains = [
  ["Climate Resilience", "Build tools that help communities prepare for heatwaves, floods, droughts and extreme weather."],
  ["Clean Energy", "Create accessible systems to reduce energy waste and accelerate renewable adoption."],
  ["Circular Economy", "Turn waste, spare capacity and unused products into measurable circular value."],
  ["Public Health", "Help people and health teams prevent illness, navigate care and improve outcomes."],
  ["Accessible Education", "Remove barriers to learning through inclusive, affordable and adaptive experiences."],
  ["Food Security", "Reduce food loss while improving access to safe, affordable and nutritious food."],
  ["Disaster Response", "Give responders and affected communities faster coordination and reliable information."],
  ["Urban Mobility", "Make daily travel safer, cleaner, fairer and easier to plan."],
  ["Financial Inclusion", "Help underserved people save, borrow, budget and build economic resilience."],
  ["Digital Safety", "Protect people, small businesses and communities from online harms."],
  ["Water Security", "Improve water quality, conservation, leakage detection and equitable access."],
  ["Inclusive Cities", "Design services and public spaces that work for every age and ability."],
  ["Future of Work", "Connect skills, opportunities and fair working conditions at local scale."],
  ["Mental Wellbeing", "Provide private, trusted and practical support for emotional wellbeing."],
  ["Agriculture", "Give smallholder farmers better decisions, market access and climate intelligence."],
  ["Civic Participation", "Make public consultation, local services and civic information understandable."],
  ["Wildlife Conservation", "Help protect habitats, prevent illegal activity and track biodiversity."],
  ["Healthcare Access", "Reduce waiting, travel and communication barriers in frontline care."],
  ["Responsible AI", "Create transparent, accountable tools that reduce bias and earn public trust."],
  ["Community Commerce", "Help local businesses discover customers and operate more efficiently."],
];
const solutionTasks = [
  "A live early-warning dashboard", "An offline-first mobile companion", "A verified community reporting network",
  "A privacy-preserving matching platform", "An AI decision-support assistant", "A resource allocation optimizer",
  "An accessible self-service portal", "A real-time trust and impact ledger", "A gamified behaviour change programme", "A low-cost sensor and alert kit"
];
const galleryProjects = [
  ["🌱","TerraLink","Climate intelligence",128],["♿","AccessMap","Accessibility",96],["🩺","CareCircle","Health technology",84],
  ["💧","Dropwise","Water security",112],["⚡","GridMint","Clean energy",73],["🏙️","SafeRoute","Urban mobility",91],
  ["📚","OpenClass","Accessible education",68],["🥬","FreshLoop","Food security",105],["🛡️","ShieldAI","Digital safety",79],
  ["🌾","HarvestOS","Smart agriculture",88],["🏛️","CivicLens","Public participation",64],["🦋","BioWatch","Wildlife conservation",102]
];
const generatedChallenges = challengeDomains.flatMap(([domain, mission], domainIndex) =>
  solutionTasks.map((task, taskIndex) => ({
    id: 100 + domainIndex * 10 + taskIndex,
    title: `${domain}: ${task}`,
    sponsor: taskIndex % 2 ? "Community Impact" : "Global Innovation Lab",
    difficulty: ["Beginner", "Intermediate", "Advanced"][taskIndex % 3],
    spots: 8 + ((domainIndex + taskIndex * 3) % 20),
    description: `${mission} Design a practical solution using this challenge format: ${task.toLowerCase()}. Include users, constraints, measurable impact, accessibility and a credible deployment plan.`,
  }))
);

const seed = {
  announcements: [
    { id: 1, title: "Opening ceremony begins at 9:00 AM", body: "Join the main stage for rules, tracks, mentors, and sponsor introductions.", time: "Today · 8:30 AM", type: "Important" },
    { id: 2, title: "Mentor office hours are live", body: "Book a 15-minute slot with product, design, or engineering mentors.", time: "Today · 9:45 AM", type: "Mentor" },
  ],
  timeline: [
    { time: "09:00", title: "Opening ceremony", status: "Live", detail: "Main auditorium" },
    { time: "10:00", title: "Team hacking begins", status: "Next", detail: "All project zones" },
    { time: "13:00", title: "Lunch and networking", status: "Upcoming", detail: "Innovation lounge" },
    { time: "16:30", title: "Mentor reviews", status: "Upcoming", detail: "Mentor desks" },
  ],
  challenges: [...generatedChallenges],
  requests: [],
  submissions: [],
  applications: [],
  awards: [
    { title: "Grand Champion", detail: "Best overall execution and impact" },
    { title: "People's Choice", detail: "Highest community vote score" },
    { title: "Best First-Time Team", detail: "Outstanding debut project" },
  ],
};

export default function EventSuite() {
  const [tab, setTab] = useState("Overview");
  const [data, setData] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("hackathon-suite") || "{}");
      return { ...seed, ...saved, challenges: saved.challenges?.length > 20 ? saved.challenges : generatedChallenges };
    }
    catch { return seed; }
  });
  const [notice, setNotice] = useState("");
  const [challengeQuery, setChallengeQuery] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [applicationStep, setApplicationStep] = useState(1);
  const [application, setApplication] = useState({ team: "", leader: "", email: "", members: "", idea: "", skills: "", availability: "Full hackathon", agree: false });
  const [submission, setSubmission] = useState({ demo: "", repo: "", pitch: "" });
  const [support, setSupport] = useState({ topic: "Technical", message: "" });
  const tabs = ["Overview", "Schedule", "Challenges", "My Applications", "Submissions", "Mentors", "Project Gallery", "Awards"];
  useEffect(() => localStorage.setItem("hackathon-suite", JSON.stringify(data)), [data]);
  const now = useMemo(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), []);

  function addSubmission(e) {
    e.preventDefault();
    if (!submission.demo || !submission.repo) return;
    setData({ ...data, submissions: [{ id: Date.now(), ...submission, status: "Submitted" }, ...data.submissions] });
    setNotice("Project submission saved successfully.");
    setSubmission({ demo: "", repo: "", pitch: "" });
  }
  function askMentor(e) {
    e.preventDefault();
    if (!support.message.trim()) return;
    setData({ ...data, requests: [{ id: Date.now(), ...support, status: "Waiting" }, ...data.requests] });
    setNotice("Support request sent. A mentor will join shortly.");
    setSupport({ topic: "Technical", message: "" });
  }

  function openApplication(challenge) {
    setSelectedChallenge(challenge);
    setApplicationStep(1);
  }
  function submitApplication(e) {
    e.preventDefault();
    const entry = { id: Date.now(), challengeId: selectedChallenge.id, challenge: selectedChallenge.title, ...application, status: "Under review", submittedAt: new Date().toISOString() };
    setData({ ...data, applications: [entry, ...data.applications] });
    setSelectedChallenge(null);
    setApplication({ team: "", leader: "", email: "", members: "", idea: "", skills: "", availability: "Full hackathon", agree: false });
    setNotice("Application submitted successfully. Track its status in My Applications.");
  }

  const filteredChallenges = data.challenges.filter((challenge) =>
    `${challenge.title} ${challenge.description} ${challenge.sponsor}`.toLowerCase().includes(challengeQuery.toLowerCase())
  );

  return (
    <div className="suite">
      <header className="suite-head">
        <div><span className="kicker">EVENT CONTROL ROOM</span><h2>BuildFest 2026</h2><p><span className="live-dot" /> Live event <b>·</b> Today, 24 teams <b>·</b> {now}</p></div>
        <button className="btn btn-primary" onClick={() => setNotice("Check-in desk opened for scan or manual confirmation.")}>Check in team</button>
      </header>
      {notice && <div className="notice" role="status"><span>✓</span>{notice}<button onClick={() => setNotice("")}>×</button></div>}
      <nav className="suite-tabs" aria-label="Event tools">
        {tabs.map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}
      </nav>

      {tab === "Overview" && <>
        <div className="metrics">
          <Metric value="24" label="Registered teams" detail="3 waiting approval" />
          <Metric value="18" label="Checked in" detail="75% arrival rate" />
          <Metric value="8" label="Mentor hours" detail="14 experts active" />
          <Metric value="6" label="Submissions" detail="4 hours remaining" />
        </div>
        <div className="suite-grid"><section className="panel wide"><div className="panel-title"><div><span>LIVE FEED</span><h3>Announcements</h3></div></div>{data.announcements.map((a) => <article className="announcement" key={a.id}><span className="tag">{a.type}</span><div><h4>{a.title}</h4><p>{a.body}</p></div><small>{a.time}</small></article>)}</section><section className="panel"><div className="panel-title"><div><span>UP NEXT</span><h3>Event pulse</h3></div></div>{data.timeline.slice(0,3).map((item,i)=><div className="pulse-row" key={item.title}><span>{String(i+1).padStart(2,"0")}</span><div><b>{item.title}</b><small>{item.time} · {item.detail}</small></div></div>)}</section></div>
      </>}

      {tab === "Schedule" && <section className="panel"><div className="panel-title"><div><span>DAY PLAN</span><h3>Hackathon timeline</h3></div><b className="accent">Day 01</b></div><div className="timeline">{data.timeline.map((item)=><article key={item.title}><time>{item.time}</time><span className={`status ${item.status.toLowerCase()}`}>{item.status}</span><div><h4>{item.title}</h4><p>{item.detail}</p></div></article>)}</div></section>}

      {tab === "Challenges" && <section><div className="section-lead"><div><span className="kicker">CHOOSE YOUR MISSION</span><h3>200 real-world problem statements</h3></div><span>{filteredChallenges.length} challenges shown</span></div><div className="challenge-search"><span>⌕</span><input value={challengeQuery} onChange={(e)=>setChallengeQuery(e.target.value)} placeholder="Search health, climate, AI, mobility, education…" /></div><div className="challenge-grid">{filteredChallenges.map((challenge)=><article className="challenge" key={challenge.id}><div className="challenge-top"><span>{challenge.difficulty}</span><b>{challenge.spots} spots</b></div><h3>{challenge.title}</h3><p>{challenge.description}</p><div className="challenge-foot"><span>Sponsored by <b>{challenge.sponsor}</b></span><button className="btn btn-ghost" onClick={()=>openApplication(challenge)}>Apply ↗</button></div></article>)}</div>{!filteredChallenges.length && <div className="empty-state"><b>No challenge found</b><p>Try another theme or solution format.</p></div>}</section>}

      {tab === "Submissions" && <section className="panel"><div className="panel-title"><div><span>FINAL DELIVERY</span><h3>Submit your project</h3></div></div><form className="feature-form" onSubmit={addSubmission}><label>Live demo URL<input value={submission.demo} onChange={(e)=>setSubmission({...submission,demo:e.target.value})} placeholder="https://your-project.com" required /></label><label>Source repository<input value={submission.repo} onChange={(e)=>setSubmission({...submission,repo:e.target.value})} placeholder="https://github.com/team/project" required /></label><label>Pitch deck / video<textarea rows="4" value={submission.pitch} onChange={(e)=>setSubmission({...submission,pitch:e.target.value})} placeholder="Add your presentation or demo video URL" /></label><button className="btn btn-primary">Submit project</button></form>{data.submissions.map((item)=><div className="submission-row" key={item.id}><span>✓</span><div><b>Project submitted</b><small>{item.demo}</small></div><em>{item.status}</em></div>)}</section>}

      {tab === "Mentors" && <section className="mentor-layout"><div className="panel"><div className="panel-title"><div><span>ON-DEMAND HELP</span><h3>Request a mentor</h3></div></div><form className="feature-form" onSubmit={askMentor}><label>Expertise<select value={support.topic} onChange={(e)=>setSupport({...support,topic:e.target.value})}><option>Technical</option><option>Product</option><option>Design</option><option>Business</option></select></label><label>What do you need help with?<textarea rows="5" value={support.message} onChange={(e)=>setSupport({...support,message:e.target.value})} required /></label><button className="btn btn-primary">Find a mentor</button></form></div><div className="panel"><div className="panel-title"><div><span>SUPPORT QUEUE</span><h3>Requests</h3></div></div>{data.requests.length ? data.requests.map((r)=><div className="support-row" key={r.id}><span>{r.topic[0]}</span><div><b>{r.topic} support</b><p>{r.message}</p></div><em>{r.status}</em></div>) : <div className="empty-state"><b>All clear</b><p>No active support requests.</p></div>}</div></section>}

      {tab === "Project Gallery" && <section><div className="section-lead"><div><span className="kicker">COMMUNITY SHOWCASE</span><h3>12 projects to explore</h3></div><span>Community voting is open</span></div><div className="gallery">{galleryProjects.map(([emoji,title,track,votes]) => <GalleryCard key={title} emoji={emoji} title={title} track={track} votes={String(votes)} />)}</div></section>}

      {tab === "Awards" && <section><div className="section-lead"><div><span className="kicker">CELEBRATE EXCELLENCE</span><h3>Award categories</h3></div></div><div className="award-grid">{data.awards.map((award,i)=><article className="award" key={award.title}><span>0{i+1}</span><div className="trophy">{i===0?"🏆":"✦"}</div><h3>{award.title}</h3><p>{award.detail}</p></article>)}</div></section>}

      {tab === "My Applications" && <section><div className="section-lead"><div><span className="kicker">YOUR JOURNEY</span><h3>Challenge applications</h3></div><span>{data.applications.length} submitted</span></div>{data.applications.length ? <div className="application-list">{data.applications.map((item)=><article className="application-row" key={item.id}><div className="application-icon">{item.team.charAt(0).toUpperCase()}</div><div><h4>{item.challenge}</h4><p>{item.team} · Led by {item.leader}</p></div><span className="review-status">{item.status}</span></article>)}</div> : <div className="panel empty-state"><b>No applications yet</b><p>Choose a challenge and complete your team application.</p><button className="btn btn-primary" onClick={()=>setTab("Challenges")}>Explore challenges</button></div>}</section>}

      {selectedChallenge && <div className="modal-backdrop" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSelectedChallenge(null)}}><form className="application-modal" onSubmit={submitApplication}><div className="modal-head"><div><span>CHALLENGE APPLICATION</span><h3>{selectedChallenge.title}</h3></div><button type="button" aria-label="Close" onClick={()=>setSelectedChallenge(null)}>×</button></div><div className="step-track"><span className={applicationStep >= 1 ? "active" : ""}>1 Team</span><span className={applicationStep >= 2 ? "active" : ""}>2 Solution</span><span className={applicationStep >= 3 ? "active" : ""}>3 Review</span></div>{applicationStep === 1 && <div className="application-fields"><label>Team name<input required value={application.team} onChange={(e)=>setApplication({...application,team:e.target.value})} placeholder="e.g. Green Rangers" /></label><div className="grid2"><label>Team leader<input required value={application.leader} onChange={(e)=>setApplication({...application,leader:e.target.value})} /></label><label>Leader email<input type="email" required value={application.email} onChange={(e)=>setApplication({...application,email:e.target.value})} /></label></div><label>Team members (names)<textarea rows="3" required value={application.members} onChange={(e)=>setApplication({...application,members:e.target.value})} placeholder="Add each member's name, separated by commas" /></label></div>}{applicationStep === 2 && <div className="application-fields"><label>Your proposed solution<textarea rows="4" required value={application.idea} onChange={(e)=>setApplication({...application,idea:e.target.value})} placeholder="What will you build, for whom, and what problem will it solve?" /></label><label>Skills and tools your team brings<textarea rows="3" required value={application.skills} onChange={(e)=>setApplication({...application,skills:e.target.value})} placeholder="AI, design, web development, research…" /></label><label>Availability<select value={application.availability} onChange={(e)=>setApplication({...application,availability:e.target.value})}><option>Full hackathon</option><option>Weekend only</option><option>Remote participation</option><option>Final presentation only</option></select></label></div>}{applicationStep === 3 && <div className="application-review"><div><span>Team</span><b>{application.team}</b></div><div><span>Leader</span><b>{application.leader} · {application.email}</b></div><div><span>Members</span><b>{application.members}</b></div><div><span>Solution</span><b>{application.idea}</b></div><label className="checkbox"><input type="checkbox" required checked={application.agree} onChange={(e)=>setApplication({...application,agree:e.target.checked})} /> I confirm that this application is accurate and our team can attend.</label></div>}<div className="modal-actions">{applicationStep > 1 && <button type="button" className="btn btn-ghost" onClick={()=>setApplicationStep(applicationStep-1)}>Back</button>}<button type={applicationStep === 3 ? "submit" : "button"} className="btn btn-primary" onClick={applicationStep < 3 ? ()=>setApplicationStep(applicationStep+1) : undefined}>{applicationStep === 3 ? "Submit application" : "Continue →"}</button></div></form></div>}
    </div>
  );
}

function Metric({value,label,detail}) { return <article className="metric"><strong>{value}</strong><div><b>{label}</b><span>{detail}</span></div><i>↗</i></article>; }
function GalleryCard({emoji,title,track,votes}) { const [count,setCount]=useState(Number(votes)); const [voted,setVoted]=useState(false); return <article className="project-card"><div className="project-art">{emoji}</div><span>{track}</span><h3>{title}</h3><button className={voted?"voted":""} onClick={()=>{if(!voted){setCount(count+1);setVoted(true)}}}>{voted?"✓ Voted":"♡ "+count}</button></article>; }
