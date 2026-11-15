import Tilt from './Tilt.jsx';

// EDIT HERE: team, problems, features and SDGs shown on the About page
const TEAM = ['Mazhar Ali (Group Leader)', 'M Jawad', 'Aryan Iqbal', 'Okasha Naeem', 'M. Hussnain Ashiq', 'M. Huzaifa', 'Gohar Mahi-Ul-Din', 'Zuhaib Maqsood'];
const PROBLEMS = ['Emergency alerts may not reach, or be understood by, everyone.', 'Reliable information about affected people and their needs is fragmented.', 'NGOs may not know where food, clean water, shelter and medical supplies are short.', 'Poor coordination delays help and causes duplicated or unequal relief.'];
const SOLUTION = [['Accessible alerts', 'Location-based warnings in text, audio, simple language and Urdu.'], ['Verified data hub', 'Reports from citizens, volunteers and NGOs are cross-checked before use.'], ['Needs dashboard', 'Track affected families and their needs for food, water, shelter and medical help.'], ['Relief coordination', 'Match verified needs with NGOs, track deliveries and collect feedback.']];
const SDGS = [['3', 'Good Health and Well-being', 'Timely alerts and tracking of medical needs.', '#2e7d32'], ['10', 'Reduced Inequalities', 'Accessible formats and a focus on vulnerable households.', '#c2185b'], ['11', 'Sustainable Cities and Communities', 'Coordinated relief that strengthens community resilience.', '#b45309']];

export default function About({ onNav }) {
  return (<div className="page">
    <div className="pghero"><div><h1>About ResQHub Pakistan</h1><p>A single platform that connects disaster warnings, community needs and relief, starting with a pilot in Lahore, Punjab.</p></div></div>
    <section className="wrap split">
      <div><h2>The problem</h2><ul className="plist">{PROBLEMS.map((p) => <li key={p}>{p}</li>)}</ul></div>
      <div><h2>Who we serve</h2><p>Disaster-affected communities across Pakistan, especially displaced families, children, women, elderly people, persons with disabilities and vulnerable households.</p></div>
    </section>
    <section className="wrap"><h2>How we solve it</h2><div className="tiles">{SOLUTION.map(([t, d]) => <Tilt key={t} className="tile feat"><h3>{t}</h3><span>{d}</span></Tilt>)}</div></section>
    <section className="wrap"><h2>UN Sustainable Development Goals</h2><div className="sdgs">{SDGS.map(([n, t, d, c]) => <Tilt key={n} className="sdgc" style={{ background: c }}><b>SDG {n}</b><h3>{t}</h3><p>{d}</p></Tilt>)}</div></section>
    <section className="wrap"><h2>The team</h2><p className="muted">BS Computer Science, Superior University · Facilitator: Mam Rida Ashraf · CMACED Social Entrepreneurship Program</p>
      <ul className="team">{TEAM.map((m) => <li key={m} className="member"><span className="av">{m[0]}</span>{m}</li>)}</ul></section>
    <section className="wrap cta2"><h2>Want to help or need help?</h2><button className="primary big" onClick={() => onNav('report')}>Report a need</button><button className="ghost big" onClick={() => onNav('contact')}>Contact us</button></section>
  </div>);
}