import { AlertTriangle, ArrowRight, Heart, Mail, MessageCircle, Phone, Shield, Truck } from 'lucide-react';
import Logo from './Logo';
import { AREA_NAMES } from '../geo';

export function PublicHeader() {
  return (
    <div className="public-header-shell">
      <header className="public-header wrap">
        <a className="public-brand" href="#/" aria-label="ResQ Hub - Return to Home">
          <Logo size={42} />
          <span>
            <b>ResQHub</b>
            <small>Disaster Management &amp; Relief Coordination</small>
          </span>
        </a>

        <nav className="public-nav" aria-label="Primary navigation">
          <a href="#/" className="nav-item">Home</a>
          <a href="#/about" className="nav-item">About</a>
          <a href="#/features" className="nav-item">Features</a>
          <a href="#/alerts" className="nav-item">Alerts</a>
          <a href="#/needs" className="nav-item">Needs</a>
          <a href="#/hub" className="nav-item">Verified Hub</a>
          <a href="mailto:mazisial9296@gmail.com" className="nav-item">Contact</a>

          <div className="header-auth-actions">
            <a className="header-login-link" href="#/auth">
              Login
            </a>
            <a className="header-register-pill" href="#/auth?mode=register">
              Register
            </a>
          </div>
        </nav>
      </header>
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="wrap footer-content-grid">
        {/* Column 1: Organization & Identity */}
        <div className="footer-col brand-col">
          <div className="flex items-center gap-3 mb-3">
            <Logo size={40} />
            <div>
              <b className="footer-brand-title">ResQHub</b>
              <small className="footer-brand-subtitle">Civic Disaster Resilience</small>
            </div>
          </div>
          <p className="footer-description">
            A centralized disaster management and relief coordination platform delivering accessible early warnings, verified localized data, and direct NGO assistance for flood-prone riverine communities along Lahore’s Ravi River.
          </p>
          <div className="footer-punchline">
            <i>"See the risk. Unite the response. Deliver relief."</i>
          </div>
        </div>

        {/* Column 2: Platform Navigation */}
        <div className="footer-col">
          <h4 className="footer-col-title">Platform Modules</h4>
          <ul className="footer-links">
            <li><a href="#/">Home Overview</a></li>
            <li><a href="#/about">About Mission &amp; SDGs</a></li>
            <li><a href="#/features">Platform Architecture</a></li>
            <li><a href="#/alerts">Early Warning Alerts</a></li>
            <li><a href="#/report">Report Flood Emergency</a></li>
            <li><a href="#/hub">Verified Data Hub</a></li>
            <li><a href="#/needs">Needs &amp; Relief Dashboard</a></li>
            <li><a href="#/auth">Responder Sign In</a></li>
          </ul>
        </div>

        {/* Column 3: Monitored Lahore Ravi Sectors */}
        <div className="footer-col">
          <h4 className="footer-col-title">Lahore Ravi Sectors</h4>
          <ul className="footer-links sectors-list">
            {AREA_NAMES.map((name) => (
              <li key={name}>
                <a href="#/map-admin">{name}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Emergency Contacts */}
        <div className="footer-col">
          <h4 className="footer-col-title">Emergency Contacts</h4>
          <p className="footer-contact-note">
            For life-threatening flood emergencies and immediate water rescue:
          </p>
          <div className="footer-emergency-badge">
            <Phone size={18} />
            <span>Emergency: <b>Rescue 1122</b></span>
          </div>

          <div className="footer-contact-list mt-3">
            <a href="mailto:mazisial9296@gmail.com" className="footer-contact-link">
              <Mail size={16} /> mazisial9296@gmail.com
            </a>
            <a href="https://wa.me/923044335771" target="_blank" rel="noopener noreferrer" className="footer-contact-link">
              <MessageCircle size={16} /> +92 304 433 5771 (WhatsApp)
            </a>
          </div>
        </div>
      </div>

      {/* Clean Bottom Copyright Bar */}
      <div className="footer-bottom-bar wrap">
        <span>© {new Date().getFullYear()} ResQHub. All rights reserved. Connecting Warnings, Needs &amp; Relief.</span>
        <span>Operational Focus: Lahore District, Punjab, Pakistan</span>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }) {
  return (
    <div className="public-site">
      <PublicHeader />
      {children}
      <PublicFooter />
    </div>
  );
}
