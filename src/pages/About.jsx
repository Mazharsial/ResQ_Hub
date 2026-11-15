import { useEffect } from 'react';
import {
  ArrowRight, BellRing, CheckCircle2, Handshake, HeartHandshake,
  Lightbulb, MapPinned, MessageSquareText, ShieldCheck, UsersRound,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';

const TEAM = [
  'M. Jawad',
  'Mazhar Ali',
  'Aaryan Iqbal',
  'Okasha Naeem',
  'Zuhaib Maqsood',
  'Muhammad Huzaifa',
  'M. Hussnain Ashiq',
  'Gohar Mahi-Ul-Din',
];

const VALUES = [
  [HeartHandshake, 'Compassion', 'Put people and their safety at the center of every decision.'],
  [ShieldCheck, 'Transparency', 'Make information sources, verification and uncertainty clear.'],
  [UsersRound, 'Community first', 'Build with local knowledge and the needs of affected residents.'],
  [Handshake, 'Collaboration', 'Make it easier for communities and responders to coordinate.'],
  [CheckCircle2, 'Accountability', 'Support responsible reporting, follow-up and clear ownership.'],
  [Lightbulb, 'Innovation', 'Use practical technology to make response information more useful.'],
];

const CHALLENGES = [
  [MessageSquareText, 'Fragmented information', 'Important updates can be scattered across channels, making them harder to verify and act on.'],
  [MapPinned, 'Unreported local needs', 'Residents need a clear way to share where help is needed and what support may be required.'],
  [Handshake, 'Difficult coordination', 'Responders need better visibility into reported needs and the support already being organized.'],
];

const IMPACT_AREAS = [
  [BellRing, 'Timely emergency alerts', 'Present relevant updates clearly, with their source and status easy to understand.'],
  [MessageSquareText, 'Community needs reporting', 'Help residents submit local observations and requests for review and follow-up.'],
  [ShieldCheck, 'Verified disaster data', 'Distinguish confirmed information from reports that still need checking.'],
  [Handshake, 'Relief coordination', 'Give response teams a shared place to track needs and assistance in progress.'],
];

export default function About({ s, set }) {
  useEffect(() => {
    const targets = document.querySelectorAll(
      '.about-purpose, .about-photo-card, .team-heading, .team-card, .about-intent-card, .about-value-card, .about-reason-card, .about-impact-card, .scope-note, .about-cta > *',
    );
    if (document.documentElement.dataset.motion === 'reduce' || !('IntersectionObserver' in window)) {
      targets.forEach(target => target.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    targets.forEach((target, index) => {
      target.classList.add('scroll-reveal');
      target.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 90}ms`);
      observer.observe(target);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <PublicLayout s={s} set={set}>
      <main className="public-page about-page">
        <section className="page-hero wrap">
          <span className="eyebrow">About ResQ Hub</span>
          <h1>When Communities Are Ready, Every Response Is Stronger.</h1>
          <p>ResQ Hub is designed to bridge the gap between disaster-affected communities and relief organizations through timely alerts, verified information, and coordinated assistance.</p>
        </section>

        <div className="wrap about-content">
          <div className="about-story-grid">
            <div className="about-purpose">
              <span className="eyebrow">Our purpose</span>
              <h2>Make the right information easier to find—and the right help easier to coordinate.</h2>
              <p>Flood situations create urgent information and coordination needs. ResQ Hub is being developed to bring local reporting, verification, accessible alerts and relief coordination into one clear experience, while keeping official emergency guidance at the center.</p>
            </div>
            <figure className="about-photo-card">
              <img src="/img/community-rescue.svg" alt="Illustration of a rescue boat helping residents in a flooded community" />
              <figcaption><ShieldCheck size={18} /><span>Stronger response starts with people working together.</span></figcaption>
              <span className="about-photo-orbit orbit-a" /><span className="about-photo-orbit orbit-b" />
            </figure>
          </div>

          <section className="about-intents" aria-label="Mission and vision">
            <article className="about-intent-card">
              <span className="eyebrow">Our mission</span>
              <p>To connect communities with timely disaster alerts, verified information, and coordinated relief support.</p>
            </article>
            <article className="about-intent-card about-vision">
              <span className="eyebrow">Our vision</span>
              <p>A safer and more resilient society where every community is informed, prepared, and supported during disasters.</p>
            </article>
          </section>

          <section className="team-section">
            <div className="team-heading"><span className="eyebrow"><UsersRound size={15} /> The people behind the project</span><h2>Meet our team</h2><p>A team committed to building practical, community-centered tools for flood readiness.</p></div>
            <div className="team-grid">
              {TEAM.map((name, index) => {
                const leader = name === 'Mazhar Ali';
                return <article className={`team-card${leader ? ' team-leader' : ''}`} key={name} style={{ '--team-index': index }}>
                  <div className={`team-avatar avatar-${index + 1}`} aria-hidden="true">{name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()}</div>
                  <div className="team-info"><b>{name}</b><span>{leader ? 'Team Leader' : 'Project Team'}</span></div>
                  {leader && <span className="leader-badge">Lead</span>}
                </article>;
              })}
            </div>
          </section>

          <section className="about-values">
            <div className="about-section-heading"><span className="eyebrow">What guides us</span><h2>Our core values</h2><p>Principles that shape how the platform communicates, coordinates and earns trust.</p></div>
            <div className="about-values-grid">
              {VALUES.map(([Icon, title, copy]) => (
                <article className="about-value-card" key={title}><span className="about-value-icon"><Icon size={20} /></span><h3>{title}</h3><p>{copy}</p></article>
              ))}
            </div>
          </section>

          <section className="about-why">
            <div className="about-section-heading"><span className="eyebrow">Why ResQ Hub?</span><h2>When information is scattered, response gets harder.</h2><p>Communities and response teams need a clearer way to share updates, understand local needs and coordinate support.</p></div>
            <div className="about-reason-grid">
              {CHALLENGES.map(([Icon, title, copy]) => (
                <article className="about-reason-card" key={title}><Icon size={21} /><h3>{title}</h3><p>{copy}</p></article>
              ))}
            </div>
          </section>

          <section className="about-impact">
            <div className="about-section-heading"><span className="eyebrow">How we make a difference</span><h2>Useful tools for a more coordinated response.</h2></div>
            <div className="about-impact-grid">
              {IMPACT_AREAS.map(([Icon, title, copy], index) => (
                <article className="about-impact-card" key={title}>
                  <div className="feature-card-top"><span>0{index + 1}</span><Icon size={22} /></div>
                  <h3>{title}</h3><p>{copy}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="scope-note"><b>Current scope</b><p>The listed localities are a planned focus, not a claim of live monitoring or confirmed coverage. Locations, risk data and response partners require verification before operational deployment.</p></div>
        </div>

        <section className="about-cta wrap">
          <div><span className="eyebrow">ResQ Hub</span><h2>Because Help Should Reach, Not Wait.</h2></div>
          <a className="btn" href="#/features">Explore our platform <ArrowRight size={18} /></a>
        </section>
      </main>
    </PublicLayout>
  );
}
