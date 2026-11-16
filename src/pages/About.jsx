import { useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, BellRing, CheckCircle2,
  ChevronRight, Database, FileSpreadsheet, HandHeart, HeartHandshake,
  Layers, Lightbulb, MapPin, MapPinned, MessageSquareText, Shield,
  ShieldAlert, ShieldCheck, Truck, Users, UsersRound, Waves,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import TiltCard from '../components/TiltCard';
import { AREA_NAMES } from '../geo';

const SEVEN_STAGES = [
  {
    stage: '01',
    name: 'Early Warning & Hydrologic Telemetry',
    actor: 'Hydrometric Sensors & Alert Dispatchers',
    description: 'Continuous monitoring of upstream river discharge (Ravi Syphon & Shahdara gauges). Automated early alerts dispatched across multi-channel SMS and push feeds in Urdu and English before water levels breach critical embankments.',
    inputs: 'River discharge rates (cusecs), precipitation forecasts, historical inundation models',
    output: 'Geotargeted early advisory to vulnerable riverside communities',
  },
  {
    stage: '02',
    name: 'Structured Community Distress Intake',
    actor: 'Affected Citizens & Riverine Residents',
    description: 'Empowers displaced citizens to submit rapid, low-bandwidth flood reports with GPS pinpoints, family member counts, vulnerable demographics (elderly, children, disabled), and immediate emergency needs.',
    inputs: 'Coordinates, affected headcounts, distress category (submerged home, stranded family)',
    output: 'Raw incident telemetry token queued for spatial clustering',
  },
  {
    stage: '03',
    name: 'Field Volunteer Ground Validation',
    actor: 'Trained Community & Field Volunteers',
    description: 'On-the-ground volunteer corps equipped with standardized rapid assessment checklists visit reported coordinates along the Bund Road and riverbanks to authenticate distress validity, take physical measurements, and rule out duplicates.',
    inputs: 'Field spot-checks, accessibility routes, water depth markings',
    output: 'First-tier validation badge attached to incident token',
  },
  {
    stage: '04',
    name: 'Multi-Tier Anti-Duplicate Verification Engine',
    actor: 'Algorithmic Heuristics & Coordinator Review',
    description: 'Automated geospatial spatial-temporal clustering algorithm flags reports within 500m / 1h radius to eliminate double-counting, while authorized coordinators review cross-referenced photos and corroborate claims.',
    inputs: 'Spatial proximity calculations, temporal clustering, multi-source corroboration',
    output: 'Formally Verified Incident Status (or flagged duplicate / rejected)',
  },
  {
    stage: '05',
    name: 'Centralized Relief Needs Command Hub',
    actor: 'District Coordination Desk & Relief Planners',
    description: 'Synthesizes verified distress into actionable supply requirements across 4 core humanitarian sectors: Clean Water, Ready-to-Eat Food Rations, Emergency Weatherproof Shelter, and Essential Medical Kits.',
    inputs: 'Aggregated community reports, demographic vulnerability weights',
    output: 'Publicly visible, real-time demand ledger tracking committed vs. outstanding shortages',
  },
  {
    stage: '06',
    name: 'NGO Resource Pledging & Allocation',
    actor: 'Approved Humanitarian NGO Partners',
    description: 'Verified relief organizations (e.g., Al-Khidmat, Red Crescent, Edhi) access the partner portal to pledge specific quantities against open needs. The system strictly caps pledges to prevent over-allocation and redundant aid clusters.',
    inputs: 'NGO inventory commitments, vehicle dispatch capacities, target delivery zones',
    output: 'Signed relief dispatch manifests with real-time transit tracking',
  },
  {
    stage: '07',
    name: 'Last-Mile Delivery Confirmation & Feedback',
    actor: 'Field Logistics Teams & Recipient Communities',
    description: 'Relief dispatches are tracked through Committed → Dispatched → Delivered status. Final delivery requires recipient community acknowledgment and volunteer photo confirmation, closing the accountability loop.',
    inputs: 'Delivery receipts, beneficiary sign-offs, photo confirmation',
    output: 'Fully resolved need logged into public transparency ledger',
  },
];

const CORE_VALUES = [
  {
    icon: ShieldCheck,
    title: 'Data Hygiene & Anti-Duplication',
    text: 'Every reported need undergoes mathematical spatial-temporal screening and multi-tier ground verification, preventing wasted relief supplies and double-counting.',
  },
  {
    icon: MapPin,
    title: 'Hyper-Localized Riverine Realism',
    text: 'Custom-tailored to Lahore’s unique Ravi River flood topology—focusing on vulnerable embankment settlements from Kala Shah Kaku to Manga Mandi.',
  },
  {
    icon: UsersRound,
    title: 'Community-Centered Inclusivity',
    text: 'Bilingual English/Urdu interface with high-contrast accessibility and audio-assisted alerts so that low-literacy riverine residents are never excluded.',
  },
  {
    icon: Database,
    title: 'Transparency & Accountability',
    text: 'Clear visibility into required vs. committed vs. delivered aid supplies ensures zero hoarding and equitable aid distribution across all flood sectors.',
  },
  {
    icon: Truck,
    title: 'Actionable Supply Chain Routing',
    text: 'Turns raw distress calls into structured logistical batches that humanitarian organizations can immediately dispatch with vehicle-ready manifests.',
  },
  {
    icon: HeartHandshake,
    title: 'Civic-Tech Ethics',
    text: 'Strict data privacy with zero collection of national ID numbers or sensitive identifiers, adhering to international humanitarian data standards.',
  },
];

const TEAM = [
  { name: 'Mazhar Ali', role: 'Team Leader & Systems Architect', initials: 'MA', lead: true },
  { name: 'M. Jawad', role: 'Full-Stack Developer & Geo-Data', initials: 'MJ' },
  { name: 'Aaryan Iqbal', role: 'UI/UX & Product Design Specialist', initials: 'AI' },
  { name: 'Okasha Naeem', role: 'Backend & Security Engineer', initials: 'ON' },
  { name: 'Zuhaib Maqsood', role: 'Field Operations & Logistics Lead', initials: 'ZM' },
  { name: 'Muhammad Huzaifa', role: 'Database & Verification Algorithms', initials: 'MH' },
  { name: 'M. Hussnain Ashiq', role: 'Frontend & Accessibility Engineer', initials: 'HA' },
  { name: 'Gohar Mahi-Ul-Din', role: 'Quality Assurance & Testing Lead', initials: 'GM' },
];

export default function About({ s, set }) {
  const [activeStage, setActiveStage] = useState(0);

  return (
    <PublicLayout s={s} set={set}>
      <main className="public-page about-page">
        {/* Authoritative Page Hero */}
        <section className="about-hero-section">
          <div className="wrap">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Institutional Mission &amp; Relief Architecture
            </span>
            <h1 className="about-hero-title">
              Bridging the Critical Divide Between Riverine Communities and Humanitarian Responders.
            </h1>
            <p className="about-hero-lead">
              ResQ Hub is an enterprise civic-tech platform engineered specifically for Lahore’s Ravi River flood belt. By replacing fragmented communication with a closed-loop, 7-stage verification and relief pipeline, we ensure that every distress signal is authenticated, quantified, and resolved with speed and transparency.
            </p>
          </div>
        </section>

        {/* Riverine Vulnerability Context */}
        <section className="about-context-section wrap">
          <div className="about-context-grid">
            <div className="about-context-text">
              <span className="eyebrow text-blue-600">The Problem Space</span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#102A43] mt-2 mb-4">
                Why Lahore’s Ravi River Basin Demands Specialized Humanitarian Infrastructure
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Each monsoon season, sudden upstream releases from transboundary catchments swell the River Ravi along Lahore's northern and western perimeters. Dense, low-elevation riverine settlements—including Shahdara Town, Rana Town, Saggian, and Babu Sabu—face immediate inundation, compromised drinking water wells, and isolated evacuation access.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Historically, disaster response has suffered from <strong>unverified social media rumors, duplicate requests, and chaotic supply allocation</strong> where some pockets receive surplus food packs while adjacent settlements remain without clean water or shelter. ResQ Hub eliminates this chaotic friction through algorithmic triage and real-time gap analysis.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm font-bold text-[#102A43]">
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-blue-600 flex-none" />
                  <span>8 Riverine Pilot Sectors</span>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600 flex-none" />
                  <span>0% Duplicate Allocation</span>
                </div>
              </div>
            </div>

            <div className="about-context-card">
              <div className="card-inner-glow" />
              <div className="p-6 relative z-10 text-white">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/15">
                  <span className="text-xs font-bold tracking-wider uppercase text-blue-200">
                    Riverine Focus Corridor
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Active Telemetry
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">Lahore River Ravi Operational Belt</h3>
                <p className="text-sm text-gray-200 leading-relaxed mb-4">
                  Targeted coverage of critical flood-vulnerable nodes along the Ravi riverfront:
                </p>
                <div className="space-y-2">
                  {AREA_NAMES.slice(0, 6).map((area, idx) => (
                    <div key={area} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-white/10">
                      <span className="font-semibold">{area}</span>
                      <span className="text-blue-300 text-[11px]">Sector {idx + 1}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/15 text-xs text-gray-300 flex items-center gap-2">
                  <Waves size={15} className="text-cyan-300 flex-none" />
                  <span>Real-time hydrological monitoring at Shahdara &amp; Ravi Syphon</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7-STAGE END-TO-END RELIEF ARCHITECTURE (Interactive Deep-Dive) */}
        <section className="architecture-section">
          <div className="wrap">
            <div className="section-header-centered">
              <span className="eyebrow">End-to-End System Architecture</span>
              <h2 className="section-title">The 7-Stage Closed-Loop Humanitarian Relief Workflow</h2>
              <p className="section-subtitle">
                How an initial hydrological alert transitions systematically into community reporting, field validation, and confirmed last-mile aid delivery.
              </p>
            </div>

            {/* Stage Selector Grid */}
            <div className="stage-selector-grid">
              {SEVEN_STAGES.map((sItem, index) => {
                const isActive = activeStage === index;
                return (
                  <button
                    type="button"
                    key={sItem.stage}
                    className={`stage-select-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveStage(index)}
                  >
                    <div className="stage-btn-top">
                      <span className="stage-number">{sItem.stage}</span>
                      {isActive && <span className="active-dot" />}
                    </div>
                    <b className="stage-btn-title">{sItem.name}</b>
                    <small className="stage-btn-actor">{sItem.actor}</small>
                  </button>
                );
              })}
            </div>

            {/* Active Stage Detailed Panel */}
            <div className="stage-detail-panel">
              <div className="stage-panel-header">
                <div className="flex items-center gap-3">
                  <span className="stage-badge">Stage {SEVEN_STAGES[activeStage].stage} of 07</span>
                  <span className="text-xs font-semibold text-gray-500">·</span>
                  <span className="text-xs font-bold text-blue-700">{SEVEN_STAGES[activeStage].actor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="stage-nav-btn"
                    disabled={activeStage === 0}
                    onClick={() => setActiveStage((p) => Math.max(0, p - 1))}
                  >
                    Previous Stage
                  </button>
                  <button
                    type="button"
                    className="stage-nav-btn primary"
                    disabled={activeStage === SEVEN_STAGES.length - 1}
                    onClick={() => setActiveStage((p) => Math.min(SEVEN_STAGES.length - 1, p + 1))}
                  >
                    Next Stage <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <h3 className="stage-panel-title">{SEVEN_STAGES[activeStage].name}</h3>
              <p className="stage-panel-desc">{SEVEN_STAGES[activeStage].description}</p>

              <div className="stage-io-grid">
                <div className="io-card inputs-card">
                  <span className="io-tag">System Data Inputs</span>
                  <p className="io-text">{SEVEN_STAGES[activeStage].inputs}</p>
                </div>
                <div className="io-card outputs-card">
                  <span className="io-tag">Verified Outputs &amp; Artifacts</span>
                  <p className="io-text">{SEVEN_STAGES[activeStage].output}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE ARCHITECTURAL PRINCIPLES */}
        <section className="about-values-section wrap">
          <div className="section-header-centered">
            <span className="eyebrow">Design Principles</span>
            <h2 className="section-title">Engineered for Accuracy, Speed, and Human Dignity</h2>
            <p className="section-subtitle">
              Every interface and algorithm in ResQ Hub complies with international humanitarian technical standards.
            </p>
          </div>

          <div className="values-grid">
            {CORE_VALUES.map((val) => {
              const Icon = val.icon;
              return (
                <TiltCard key={val.title} className="value-card">
                  <div className="value-icon-box">
                    <Icon size={22} className="text-blue-600" />
                  </div>
                  <h3 className="value-title">{val.title}</h3>
                  <p className="value-text">{val.text}</p>
                </TiltCard>
              );
            })}
          </div>
        </section>

        {/* PROJECT LEADERSHIP & ENGINEERING TEAM */}
        <section className="about-team-section wrap">
          <div className="section-header-centered">
            <span className="eyebrow">Academic &amp; Project Engineering Team</span>
            <h2 className="section-title">The Innovators Behind ResQ Hub</h2>
            <p className="section-subtitle">
              Developed by dedicated software engineering and humanitarian tech researchers committed to flood resilience along the Ravi River.
            </p>
          </div>

          <div className="team-grid">
            {TEAM.map((member) => (
              <div key={member.name} className={`team-member-card ${member.lead ? 'leader-card' : ''}`}>
                <div className="member-avatar">
                  {member.initials}
                </div>
                <div className="member-info">
                  <div className="flex items-center gap-2">
                    <b className="member-name">{member.name}</b>
                    {member.lead && <span className="leader-pill">Lead</span>}
                  </div>
                  <span className="member-role">{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="about-cta-section wrap">
          <div className="about-cta-card">
            <div className="cta-copy">
              <span className="eyebrow text-blue-200">Explore the Platform</span>
              <h2 className="text-white text-2xl lg:text-3xl font-extrabold mt-1 mb-2">
                Discover the 5 Core Enterprise Modules of ResQ Hub
              </h2>
              <p className="text-gray-200 text-sm max-w-xl m-0">
                Explore the early warning engine, structured citizen distress intake, multi-tier verification engine, and NGO partner dispatch portal.
              </p>
            </div>
            <div className="cta-actions">
              <a className="btn bg-white text-[#102A43] hover:bg-gray-100" href="#/features">
                Explore Features <ArrowRight size={16} />
              </a>
              <a className="btn ghost text-white border-white/30 hover:bg-white/10" href="#/auth">
                Sign In to Workspace
              </a>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
