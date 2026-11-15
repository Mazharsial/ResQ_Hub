import { useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, BellRing, CheckCheck, CheckCircle2,
  ClipboardList, Droplets, HandHeart, Handshake, Languages, MapPinned,
  MessageSquareText, ShieldCheck, Truck, UsersRound, Wifi,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import LiveMap from '../components/LiveMap';
import { api, AREA_NAMES } from '../api';

const WORKFLOW = [
  {
    name: 'Report',
    title: 'Share a local flood report',
    description: 'Residents and volunteers can submit a flood report with a map location, area, description and affected-person count.',
    icon: MessageSquareText,
    role: 'Residents · Volunteers',
  },
  {
    name: 'Screen',
    title: 'Check for nearby duplicates',
    description: 'The service compares flood reports by location, time and source to flag possible duplicates and identify reports needing review.',
    icon: Activity,
    role: 'ResQ Hub service',
  },
  {
    name: 'Review',
    title: 'Review reports before publishing',
    description: 'An authorized administrator can approve, reject or mark a submitted report as a duplicate before it is shown publicly.',
    icon: ShieldCheck,
    role: 'Authorized administrator',
  },
  {
    name: 'Inform',
    title: 'Share reviewed information',
    description: 'Approved reports and administrator-published flood updates can be shared with their Lahore area and review status.',
    icon: BellRing,
    role: 'Authorized administrator',
  },
  {
    name: 'Prioritize',
    title: 'Record a community need',
    description: 'An authorized coordinator can publish a local need with a category, requested amount and priority for relief partners to review.',
    icon: ClipboardList,
    role: 'Authorized coordinator',
  },
  {
    name: 'Commit',
    title: 'Coordinate partner support',
    description: 'Approved NGO accounts can commit support against a published need. The system prevents commitments beyond the remaining amount.',
    icon: HandHeart,
    role: 'Approved NGO account',
  },
  {
    name: 'Deliver',
    title: 'Track delivery progress',
    description: 'Partners can move a commitment from committed to dispatched and delivered so the published need can reflect completed support.',
    icon: Truck,
    role: 'Approved relief partner',
  },
];

const CHALLENGES = [
  [MessageSquareText, 'Scattered local updates', 'Reports and updates can be spread across different channels, making their source and review status difficult to follow.'],
  [MapPinned, 'Needs that are hard to locate', 'A useful request needs a clear area and location so residents and response partners can understand where support is requested.'],
  [Handshake, 'Coordination without shared context', 'When requests and commitments are difficult to compare, response teams have less visibility into what still needs attention.'],
];

const CAPABILITIES = [
  [BellRing, 'Area-based flood updates', 'Administrators can publish flood updates with a severity level and a Lahore area.'],
  [ClipboardList, 'Community flood reports', 'Residents and volunteers can submit a report with location details for review.'],
  [CheckCheck, 'Review and verification status', 'Reports are screened for possible duplicates and can be reviewed before public sharing.'],
  [Truck, 'Needs and relief tracking', 'Published needs, partner commitments and delivery stages can be followed in one workspace.'],
];

const ACCESSIBILITY = [
  [Languages, 'English and Urdu interface', 'The workspace includes English and Urdu language controls for supported interface text.'],
  [Wifi, 'Low-bandwidth preference', 'A low-bandwidth setting can reduce visual effects in the signed-in workspace.'],
  [UsersRound, 'Clear, responsive screens', 'Layouts adapt to smaller screens, and the public pages include a motion preference control.'],
];

function formatNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value).toLocaleString() : '—';
}

function formatDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString() : '';
}

export default function Landing({ s, set, section }) {
  const [activeStage, setActiveStage] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [needs, setNeeds] = useState(null);
  const [activity, setActivity] = useState([]);
  const [dataError, setDataError] = useState(false);
  const [connection, setConnection] = useState('connecting');

  useEffect(() => {
    let active = true;

    const loadPublicData = async () => {
      const results = await Promise.allSettled([
        api.dashboard(),
        api.alerts(),
        api.needs(),
        api.activity(),
      ]);
      if (!active) return;

      const [dashboardResult, alertsResult, needsResult, activityResult] = results;
      setDashboard(dashboardResult.status === 'fulfilled' ? dashboardResult.value : null);
      setAlerts(alertsResult.status === 'fulfilled' && Array.isArray(alertsResult.value) ? alertsResult.value : null);
      setNeeds(needsResult.status === 'fulfilled' && Array.isArray(needsResult.value) ? needsResult.value : null);
      setActivity(activityResult.status === 'fulfilled' && Array.isArray(activityResult.value) ? activityResult.value : []);
      setDataError(results.some(result => result.status === 'rejected'));
    };

    loadPublicData();
    const unsubscribe = api.subscribeActivity(
      event => {
        setActivity(current => [event, ...current.filter(item => item.id !== event.id)].slice(0, 5));
        loadPublicData();
      },
      status => {
        if (active) setConnection(status);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!section) return undefined;
    const frame = requestAnimationFrame(() => {
      document.getElementById(section)?.scrollIntoView({
        behavior: document.documentElement.dataset.motion === 'reduce' ? 'auto' : 'smooth',
        block: 'start',
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [section]);

  useEffect(() => {
    const targets = document.querySelectorAll(
      '.landing-section-heading, .landing-challenge-card, .landing-capability-card, .landing-area-row, .landing-access-card, .landing-cta > *',
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
      target.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 80}ms`);
      observer.observe(target);
    });
    return () => observer.disconnect();
  }, []);

  const currentStage = WORKFLOW[activeStage];
  const StageIcon = currentStage.icon;
  const stats = [
    ['Published reports', dashboard?.reports, ClipboardList],
    ['Verified reports', dashboard?.verified, ShieldCheck],
    ['Open needs', dashboard?.openNeeds, HandHeart],
    ['Delivered pledges', dashboard?.deliveries, CheckCircle2],
  ];
  const publishedNeeds = (needs || []).filter(need =>
    Number(need.needed) - Number(need.delivered || 0) - Number(need.pledged || 0) > 0,
  );
  const connectionLabel = {
    connecting: 'Connecting to ResQ Hub',
    connected: 'ResQ Hub updates connected',
    reconnecting: 'ResQ Hub updates reconnecting',
    error: 'ResQ Hub update connection unavailable',
  }[connection] || 'ResQ Hub update connection unavailable';

  return (
    <PublicLayout s={s} set={set}>
      <main>
        <section className="landing-hero" id="hero">
          <div className="wrap landing-hero-grid">
            <div className="hero-copy">
              <span className="eyebrow"><span className="eyebrow-dot" /> Lahore · Ravi-side flood readiness</span>
              <h1 className="landing-headline">
                <span>Where Data Meets Humanity.</span>
                <span>Connecting Hope.</span>
                <span>Coordinating Help.</span>
                <span>Saving Lives.</span>
              </h1>
              <p className="hero-tagline">Right Information. Right Help. Right Time.</p>
              <p className="landing-hero-description">
                ResQ Hub brings residents, volunteers and relief partners together around local flood reports, reviewed updates and community needs in Lahore’s Ravi-side areas.
              </p>
              <div className="row hero-actions">
                <a className="btn" href="#/section/data-hub">Explore local data <ArrowRight size={18} /></a>
                <a className="text-link" href="#/auth">Get started <ArrowRight size={18} /></a>
              </div>
              <div className="hero-caveat">
                <ShieldCheck size={17} /> Community coordination—not an official warning service.
              </div>
            </div>

            <div className="landing-preview">
              <div className="landing-preview-heading">
                <span className="landing-preview-mark"><Activity size={18} /></span>
                <span><b>ResQ Hub workspace</b><small>Lahore · Ravi-side communities</small></span>
                <span className={`connection-pill connection-${connection}`}><i />{connectionLabel}</span>
              </div>
              <div className="landing-preview-body">
                <div className="landing-preview-topline"><span>How a report moves through the platform</span><span>{String(activeStage + 1).padStart(2, '0')} / 07</span></div>
                <div className="landing-stage-progress" aria-hidden="true">
                  {WORKFLOW.map((stage, index) => <span className={index <= activeStage ? 'active' : ''} key={stage.name} />)}
                </div>
                <div className="landing-stage-current" aria-live="polite">
                  <span className="landing-stage-icon"><StageIcon size={21} /></span>
                  <div><small>{currentStage.role}</small><b>{currentStage.title}</b><p>{currentStage.description}</p></div>
                </div>
                <div className="landing-preview-controls">
                  <span>Workflow overview · not live incident telemetry</span>
                  <button type="button" onClick={() => setActiveStage((activeStage + 1) % WORKFLOW.length)}>Next step <ArrowRight size={15} /></button>
                </div>
              </div>
              <div className="landing-preview-footer">
                <ShieldCheck size={17} /><span>Exact coverage and reports depend on verified information entered into ResQ Hub.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-metrics" aria-label="ResQ Hub records">
          <div className="wrap">
            <div className="landing-metrics-heading">
              <div><span className="eyebrow">Platform records</span><h2>What has been published in ResQ Hub</h2></div>
              <span className="landing-data-note">These are platform records, not estimates of total flood impact.</span>
            </div>
            <div className="landing-metric-grid">
              {stats.map(([label, value, Icon]) => (
                <article className="landing-metric-card" key={label}>
                  <span className="landing-metric-icon"><Icon size={19} /></span>
                  <span className="landing-metric-value">{dashboard ? formatNumber(value) : '—'}</span>
                  <span className="landing-metric-label">{label}</span>
                </article>
              ))}
            </div>
            {dataError && <p className="landing-data-error" role="status">Some platform data could not be loaded. Please try again later or sign in to access the workspace.</p>}
          </div>
        </section>

        <section className="landing-challenges" id="challenges">
          <div className="wrap">
            <div className="landing-section-heading">
              <span className="eyebrow">The coordination challenge</span>
              <h2>Flood response starts with a clearer local picture.</h2>
              <p>For Lahore’s Ravi-side communities, useful reporting depends on knowing where information came from, what has been reviewed and which needs remain open.</p>
            </div>
            <div className="landing-challenge-grid">
              {CHALLENGES.map(([Icon, title, copy], index) => (
                <article className="landing-challenge-card" key={title}>
                  <span className="landing-card-number">0{index + 1}</span><Icon size={23} />
                  <h3>{title}</h3><p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-solutions" id="solutions">
          <div className="wrap">
            <div className="landing-section-heading">
              <span className="eyebrow">One connected platform</span>
              <h2>From local reporting to coordinated support.</h2>
              <p>Tools in the current ResQ Hub workspace connect community reports, administrator review, published updates and partner commitments.</p>
            </div>
            <div className="landing-capability-grid">
              {CAPABILITIES.map(([Icon, title, copy], index) => (
                <article className="landing-capability-card" key={title}>
                  <div><span>0{index + 1}</span><Icon size={22} /></div>
                  <h3>{title}</h3><p>{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-workflow" id="workflow">
          <div className="wrap">
            <div className="landing-section-heading">
              <span className="eyebrow">How ResQ Hub works</span>
              <h2>A reviewable path from report to delivery.</h2>
              <p>Select a stage to see how reporting, administration and approved partner accounts work in the existing platform.</p>
            </div>
            <div className="landing-workflow-tabs" role="tablist" aria-label="ResQ Hub workflow stages">
              {WORKFLOW.map((stage, index) => {
                const Icon = stage.icon;
                return <button type="button" role="tab" aria-selected={activeStage === index} aria-controls="workflow-stage-panel" id={`workflow-tab-${index}`} className={activeStage === index ? 'selected' : ''} onClick={() => setActiveStage(index)} key={stage.name}>
                  <span><small>0{index + 1}</small><Icon size={17} /></span><b>{stage.name}</b>
                </button>;
              })}
            </div>
            <article className="landing-workflow-panel" id="workflow-stage-panel" role="tabpanel" aria-labelledby={`workflow-tab-${activeStage}`}>
              <div className="landing-workflow-copy">
                <span className="landing-workflow-badge">STAGE {String(activeStage + 1).padStart(2, '0')} OF 07</span>
                <h3>{currentStage.title}</h3><p>{currentStage.description}</p>
                <div><span>Responsible role</span><b>{currentStage.role}</b></div>
              </div>
              <div className="landing-workflow-visual">
                <div className="landing-workflow-visual-head"><span className="landing-stage-icon"><StageIcon size={20} /></span><span><small>Platform workflow</small><b>{currentStage.name}</b></span><CheckCircle2 size={19} /></div>
                <p>{currentStage.description}</p>
                <a className="text-link" href="#/features">See platform features <ArrowRight size={16} /></a>
              </div>
            </article>
          </div>
        </section>

        <section className="landing-data-hub" id="data-hub">
          <div className="wrap">
            <div className="landing-section-heading">
              <span className="eyebrow">Lahore · Ravi-side focus</span>
              <h2>A local view, with clear limits on what it tells you.</h2>
              <p>Explore the approximate Ravi River reference and the Lahore localities configured in ResQ Hub. It is not a flood boundary, risk forecast or official warning map.</p>
            </div>
            <div className="landing-data-grid">
              <article className="landing-map-panel">
                <div className="landing-panel-heading"><span><MapPinned size={19} /> Ravi River reference</span><small>Approximate path</small></div>
                <LiveMap height={350} />
                <p className="landing-map-note"><AlertTriangle size={15} /> Map context only. Follow official emergency guidance.</p>
              </article>
              <article className="landing-area-panel">
                <div className="landing-panel-heading"><span><MapPinned size={19} /> Lahore pilot localities</span><small>{AREA_NAMES.length} areas</small></div>
                <p className="landing-area-intro">Areas currently available in the reporting and coordination forms:</p>
                <div className="landing-area-list">{AREA_NAMES.map((area, index) => <div className="landing-area-row" key={area}><span>{String(index + 1).padStart(2, '0')}</span><b>{area}</b><CheckCircle2 size={16} /></div>)}</div>
                <p className="landing-area-note">Area selection does not mean monitoring is active or that verified reports are available there. Coverage requires local validation.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-updates">
          <div className="wrap">
            <div className="landing-section-heading">
              <span className="eyebrow">Published ResQ Hub information</span>
              <h2>Updates and needs from the platform.</h2>
              <p>Only updates and requests actually published in ResQ Hub appear here. This is not a substitute for official emergency alerts.</p>
            </div>
            <div className="landing-updates-grid">
              <article className="landing-feed-panel">
                <div className="landing-panel-heading"><span><BellRing size={19} /> Flood updates</span><a href="#/app/alerts">Open alerts <ArrowRight size={15} /></a></div>
                {alerts === null ? <p className="landing-empty-state">Published alerts could not be loaded.</p> : alerts.length === 0 ? <p className="landing-empty-state">No flood updates have been published in ResQ Hub yet.</p> :
                  <div className="landing-feed-list">{alerts.slice(0, 4).map(alert => <article className="landing-feed-item" key={alert.id}><span className={`landing-severity severity-${String(alert.sev || '').toLowerCase()}`}>{alert.sev || 'Update'}</span><div><b>{alert.district || 'Lahore area'} · {alert.hazard || 'Flood update'}</b><p>{alert.en}</p></div></article>)}</div>}
              </article>
              <article className="landing-feed-panel">
                <div className="landing-panel-heading"><span><HandHeart size={19} /> Open community needs</span><a href="#/app/needs">View needs <ArrowRight size={15} /></a></div>
                {needs === null ? <p className="landing-empty-state">Published needs could not be loaded.</p> : publishedNeeds.length === 0 ? <p className="landing-empty-state">No open community needs have been published in ResQ Hub yet.</p> :
                  <div className="landing-feed-list">{publishedNeeds.slice(0, 4).map(need => <article className="landing-need-item" key={need.id}><span className="landing-need-symbol"><Droplets size={18} /></span><div><b>{need.cat} · {need.area}</b><p>{formatNumber(Math.max(0, Number(need.needed) - Number(need.delivered || 0) - Number(need.pledged || 0)))} remaining of {formatNumber(need.needed)}</p></div></article>)}</div>}
              </article>
            </div>
            {activity.length > 0 && <div className="landing-activity-strip"><span><Activity size={17} /> Recent platform activity</span><p>{activity[0].title}{activity[0].area ? ` · ${activity[0].area}` : ''}{formatDate(activity[0].createdAt) ? ` · ${formatDate(activity[0].createdAt)}` : ''}</p></div>}
          </div>
        </section>

        <section className="landing-relief" id="relief">
          <div className="wrap landing-relief-grid">
            <div className="landing-section-heading">
              <span className="eyebrow">Relief coordination</span>
              <h2>Make each commitment visible, from pledge to delivery.</h2>
              <p>Published needs and partner commitments give approved relief partners a shared way to track support for Lahore areas in ResQ Hub.</p>
              <ul className="landing-relief-points">
                <li><CheckCircle2 size={18} /> Only approved NGO accounts can make commitments.</li>
                <li><CheckCircle2 size={18} /> Commitments cannot exceed the remaining need.</li>
                <li><CheckCircle2 size={18} /> Delivery progress can be recorded in the partner workspace.</li>
              </ul>
              <a className="btn" href="#/auth">Partner sign in <ArrowRight size={17} /></a>
            </div>
            <div className="landing-relief-card">
              <div className="landing-relief-card-head"><span><Handshake size={20} /></span><div><b>Relief coordination</b><small>Published needs · Partner commitments</small></div></div>
              {publishedNeeds.length === 0 ? <div className="landing-relief-empty"><HandHeart size={24} /><b>No open needs published</b><p>When an authorized coordinator publishes a community need, it will appear in the ResQ Hub needs dashboard.</p></div> :
                <div className="landing-relief-needs">{publishedNeeds.slice(0, 3).map(need => {
                  const remaining = Math.max(0, Number(need.needed) - Number(need.delivered || 0) - Number(need.pledged || 0));
                  const covered = Math.max(0, Number(need.needed) - remaining);
                  const progress = Number(need.needed) ? Math.min(100, (covered / Number(need.needed)) * 100) : 0;
                  return <div className="landing-relief-need" key={need.id}><div><b>{need.cat}</b><span>{need.area}</span></div><div className="landing-relief-progress"><i style={{ width: `${progress}%` }} /></div><small>{formatNumber(remaining)} remaining · {formatNumber(need.needed)} requested</small></div>;
                })}</div>}
              <a className="landing-relief-link" href="#/app/needs">Open needs dashboard <ArrowRight size={16} /></a>
            </div>
          </div>
        </section>

        <section className="landing-access" id="accessibility">
          <div className="wrap">
            <div className="landing-section-heading">
              <span className="eyebrow">Community first</span>
              <h2>Designed for real people, devices and connections.</h2>
              <p>ResQ Hub includes language and display preferences while keeping reports and warnings clear about their source and status.</p>
            </div>
            <div className="landing-access-grid">
              {ACCESSIBILITY.map(([Icon, title, copy]) => <article className="landing-access-card" key={title}><span><Icon size={21} /></span><h3>{title}</h3><p>{copy}</p></article>)}
            </div>
          </div>
        </section>

        <section className="landing-cta wrap">
          <div><span className="eyebrow">For Lahore’s Ravi-side communities</span><h2>Better information starts with a report that can be reviewed.</h2><p>Explore the platform or sign in to submit and coordinate information through ResQ Hub.</p></div>
          <div className="landing-cta-actions"><a className="btn" href="#/features">Explore the platform <ArrowRight size={18} /></a><a className="text-link" href="#/auth">Get started <ArrowRight size={17} /></a></div>
        </section>
      </main>
    </PublicLayout>
  );
}
