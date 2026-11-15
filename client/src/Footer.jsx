import { Logo } from './Header.jsx';
const Orn = () => <svg className="orn" viewBox="0 0 600 40" aria-hidden="true"><path d="M0 20H238M362 20H600" stroke="currentColor" fill="none" /><path d="M300 6l14 14-14 14-14-14z" fill="currentColor" /><path d="M244 20c8-15 26-15 32 0M356 20c-8-15-26-15-32 0M244 20c8 15 26 15 32 0M356 20c-8 15-26 15-32 0" stroke="currentColor" fill="none" /></svg>;
export default function Footer({ onNav }) {
  const L = (k, t) => <li><button onClick={() => onNav(k)}>{t}</button></li>;
  return (<footer className="foot"><Orn />
    <div className="foot-in">
      <div className="fbrand"><Logo dark /><p className="word">Warnings. Needs. Relief.</p><p>One place where an alert reaches everyone, a need is checked twice, and aid is tracked until it arrives.</p>
        <ul className="sdg"><li>SDG 3</li><li>SDG 10</li><li>SDG 11</li></ul></div>
      <nav aria-label="Platform"><h3>Platform</h3><ul>{L('alerts', 'Alerts')}{L('report', 'Report a disaster')}{L('needs', 'Needs dashboard')}{L('map', 'Disaster map')}</ul></nav>
      <nav aria-label="Get involved"><h3>Get involved</h3><ul>{L('auth', 'Volunteer')}{L('auth', 'Register your NGO')}{L('coord', 'How relief works')}{L('hub', 'Verified data hub')}</ul></nav>
      <div><h3>In an emergency</h3><ul className="tel"><li>Rescue <a href="tel:1122">1122</a></li><li>Edhi <a href="tel:115">115</a></li><li>Police <a href="tel:15">15</a></li></ul><p className="small">Call first. Then report here so relief can be planned.</p></div>
      <div><h3>Project</h3><ul>{L('about', 'About')}{L('features', 'Features')}{L('contact', 'Contact')}</ul><p className="small">Superior University · CMACED Social Entrepreneurship Program</p></div>
    </div>
    <div className="fbot"><p>© 2026 ResQHub Pakistan. A student humanitarian project.</p><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</button></div></footer>);
}