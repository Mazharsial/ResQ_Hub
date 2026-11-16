import { ArrowRight, ChevronDown, Mail, MessageCircle, Pause, Play, ShieldAlert, Waves } from 'lucide-react';
import Logo from './Logo';
import { AREA_NAMES } from '../geo';

export function PublicHeader({ s, set }) {
  return (
    <div className="public-header-shell">
      <header className="public-header wrap">
        <a className="public-brand" href="#/" aria-label="ResQ Hub - Return to Home">
          <Logo size={40} />
          <span>
            <b>ResQ Hub</b>
            <small>Ravi River Flood Readiness &amp; Relief</small>
          </span>
        </a>

        <nav className="public-nav" aria-label="Primary navigation">
          <a href="#/">Home</a>
          <a href="#/about">About</a>
          <a href="#/features">Features</a>
          <a className="nav-section-link" href="#/section/operations">Live Operations</a>
          <a className="nav-section-link" href="#/section/workflow">7-Stage Workflow</a>
          <a className="nav-section-link" href="#/section/data-hub">Ravi Zones</a>
          <a className="nav-section-link" href="#/section/relief">Relief Hub</a>

          <details className="public-section-menu" onClick={(event) => { if (event.target.closest('a')) event.currentTarget.open = false; }}>
            <summary>Explore <ChevronDown size={14} /></summary>
            <div>
              <a href="#/">Home</a>
              <a href="#/about">About Mission</a>
              <a href="#/features">Platform Features</a>
              <a href="#/section/operations">Live Operations Stream</a>
              <a href="#/section/workflow">7-Stage Architecture</a>
              <a href="#/section/data-hub">Lahore Riverine Map</a>
              <a href="#/section/relief">Relief Coordination</a>
            </div>
          </details>

          <button
            className="motion-toggle"
            type="button"
            onClick={() => set({ motion: !s.motion })}
            aria-pressed={s.motion}
            aria-label={s.motion ? 'Pause 3D and UI animations' : 'Resume 3D and UI animations'}
          >
            {s.motion ? <Pause size={14} /> : <Play size={14} />}
            <span>{s.motion ? 'Pause Motion' : 'Play Motion'}</span>
          </button>

          <a className="btn" href="#/auth">
            Sign In <ArrowRight size={15} />
          </a>
        </nav>
      </header>
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="wrap public-footer-inner">
        {/* Column 1: Brand & Operational Focus */}
        <div className="footer-col footer-brand-col">
          <a className="public-brand" href="#/">
            <Logo size={36} />
            <span>
              <b>ResQ Hub</b>
              <small>Humanitarian Flood Coordination</small>
            </span>
          </a>
          <p className="footer-mission-text">
            A centralized civic-tech platform engineering communication bridges between vulnerable riverine settlements and verified relief partners along Lahore’s Ravi River corridor.
          </p>
          <div className="footer-compliance-pill">
            <ShieldAlert size={14} className="text-emerald-500" />
            <span>Multi-Tier Verification &amp; Anti-Duplicate Engine</span>
          </div>
        </div>

        {/* Column 2: Platform Architecture & Modules */}
        <div className="footer-col">
          <h3 className="footer-col-title">Architecture &amp; Tools</h3>
          <ul className="footer-links-list">
            <li><a href="#/">Home Overview</a></li>
            <li><a href="#/about">About &amp; 7-Stage Relief Model</a></li>
            <li><a href="#/features">Core Platform Features</a></li>
            <li><a href="#/section/operations">Live Operations Stream</a></li>
            <li><a href="#/section/workflow">Verification Pipeline</a></li>
            <li><a href="#/auth">Responder Portal (Sign In)</a></li>
          </ul>
        </div>

        {/* Column 3: Lahore Ravi River Coverage Belt */}
        <div className="footer-col">
          <h3 className="footer-col-title">Lahore Ravi Belt Coverage</h3>
          <ul className="footer-areas-list">
            {AREA_NAMES.map((name) => (
              <li key={name}>
                <span className="area-indicator" />
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Direct Response Channels & Emergency Notice */}
        <div className="footer-col footer-contact-col">
          <h3 className="footer-col-title">Coordination Inquiries</h3>
          <p className="footer-contact-desc">
            For operational partnerships, NGO resource pledging, and field volunteer inquiries:
          </p>
          <div className="footer-contact-links">
            <a
              className="contact-card-link"
              href="mailto:mazisial9296@gmail.com"
              aria-label="Send email to ResQ Hub at mazisial9296@gmail.com"
            >
              <Mail size={18} className="text-blue-500" />
              <div>
                <b>Email Inquiries</b>
                <small>mazisial9296@gmail.com</small>
              </div>
            </a>
            <a
              className="contact-card-link"
              href="https://wa.me/923044335771"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Direct WhatsApp channel with ResQ Hub coordinator"
            >
              <MessageCircle size={18} className="text-emerald-500" />
              <div>
                <b>WhatsApp Desk</b>
                <small>+92 304 433 5771</small>
              </div>
            </a>
          </div>

          <div className="footer-emergency-advisory">
            <b>Emergency Advisory</b>
            <p>
              In life-threatening flood emergencies, dial <strong>Rescue 1122</strong> directly. ResQ Hub operates as an information and relief coordination bridge.
            </p>
          </div>
        </div>
      </div>

      {/* Clean Bottom Copyright Bar */}
      <div className="footer-bottom-bar wrap">
        <span>© {new Date().getFullYear()} ResQ Hub. All rights reserved. Built for community resilience along the Ravi River flood-prone corridor.</span>
        <span>Secure Role-Based Access Control (RBAC) &amp; ISO-aligned Data Hygiene</span>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children, s, set }) {
  return (
    <div className="public-site">
      <div className="public-prototype-banner">
        <span>Prototype · Demo Data</span>
        Example scenarios only—not official or live flood information. For emergencies, contact Rescue 1122 and follow local authorities.
      </div>
      <PublicHeader s={s} set={set} />
      {children}
      <PublicFooter />
    </div>
  );
}
