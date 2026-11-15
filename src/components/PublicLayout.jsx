import { ArrowRight, ChevronDown, Mail, MessageCircle, Pause, Play } from 'lucide-react';
import Logo from './Logo';

export function PublicHeader({ s, set }) {
  return (
    <div className="public-header-shell">
      <header className="public-header wrap">
        <a className="public-brand" href="#/" aria-label="ResQ Hub home">
          <Logo size={42} />
          <span><b>ResQ Hub</b><small>Community flood readiness</small></span>
        </a>
        <nav className="public-nav" aria-label="Main navigation">
          <a href="#/about">About</a>
          <a href="#/features">Features</a>
          <a className="nav-section-link" href="#/section/challenges">Challenges</a>
          <a className="nav-section-link" href="#/section/workflow">Workflow</a>
          <a className="nav-section-link nav-data-link" href="#/section/data-hub">Live data</a>
          <a className="nav-section-link" href="#/section/relief">Relief</a>
          <details className="public-section-menu" onClick={event => { if (event.target.closest('a')) event.currentTarget.open = false; }}>
            <summary>Explore <ChevronDown size={14} /></summary>
            <div>
              <a href="#/section/challenges">Challenges</a>
              <a href="#/section/solutions">Solutions</a>
              <a href="#/section/workflow">Workflow</a>
              <a href="#/section/data-hub">Live data</a>
              <a href="#/section/relief">Relief coordination</a>
              <a href="#/section/accessibility">Accessibility</a>
            </div>
          </details>
          <button className="motion-toggle" type="button" onClick={() => set({ motion: !s.motion })} aria-pressed={s.motion} aria-label={s.motion ? 'Pause animations' : 'Play animations'}>
            {s.motion ? <Pause size={15} /> : <Play size={15} />}<span>{s.motion ? 'Pause motion' : 'Play motion'}</span>
          </button>
          <a className="btn ghost" href="#/auth">Sign in <ArrowRight size={16} /></a>
        </nav>
      </header>
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="wrap public-footer-inner">
        <div className="footer-brand">
          <a className="public-brand" href="#/">
            <Logo size={38} />
            <span><b>ResQ Hub</b><small>Community flood readiness</small></span>
          </a>
          <p>Local information and coordination for Lahore’s flood-prone communities.</p>
        </div>
        <div className="footer-contact">
          <h2>Contact</h2>
          <a className="contact-link" href="mailto:mazisial9296@gmail.com" aria-label="Email ResQ Hub at mazisial9296@gmail.com">
            <Mail size={18} /><span>Email ResQ Hub<small>mazisial9296@gmail.com</small></span><ArrowRight size={15} />
          </a>
          <a className="contact-link" href="https://wa.me/923044335771" target="_blank" rel="noopener noreferrer" aria-label="Open WhatsApp chat with ResQ Hub at +92 304 433 5771">
            <MessageCircle size={18} /><span>Chat on WhatsApp<small>+92 304 433 5771</small></span><ArrowRight size={15} />
          </a>
        </div>
        <div className="footer-note">
          <b>Emergency support</b>
          <p>ResQ Hub does not replace official emergency services. In Punjab, call Rescue 1122 for emergencies.</p>
        </div>
      </div>
      <div className="wrap footer-bottom">© {new Date().getFullYear()} ResQ Hub Pakistan</div>
    </footer>
  );
}

export default function PublicLayout({ children, s, set }) {
  return (
    <div className="public-site">
      <div className="public-prototype-banner"><span>Community project</span> ResQ Hub supports flood-readiness coordination for Lahore’s Ravi-side communities. It is not an official emergency-warning service.</div>
      <PublicHeader s={s} set={set} />
      {children}
      <PublicFooter />
    </div>
  );
}
