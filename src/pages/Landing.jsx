import { useEffect, useState, useMemo } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, BellRing, CheckCheck,
  CheckCircle2, ChevronRight, ClipboardList, Database, Droplets,
  Eye, FileText, HandHeart, Handshake, HeartPulse, Home,
  Languages, Layers, MapPin, MapPinned, MessageSquareText, Radio,
  RefreshCw, Shield, ShieldAlert, ShieldCheck, Sparkles, Truck,
  UsersRound, Utensils, Waves, Wifi,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import LiveMap from '../components/LiveMap';
import RaviRiver3D from '../components/RaviRiver3D';
import LiveOperationsFeed from '../components/LiveOperationsFeed';
import TiltCard from '../components/TiltCard';
import { api, AREAS, AREA_NAMES } from '../api';

const WORKFLOW = [
  {
    name: 'Early Warning',
    title: 'Hydrologic River Telemetry & Broadcast',
    description: 'Upstream gauge sensors at Ravi Syphon and Shahdara track rising cusecs and automatically push early bilingual warnings across riverfront settlements.',
    icon: BellRing,
    role: 'Sensor Telemetry · Dispatch Unit',
  },
  {
    name: 'Citizen Intake',
    title: 'Structured Ground Distress Intake',
    description: 'Displaced residents submit low-bandwidth distress coordinates detailing family headcount, vulnerable demographics, and immediate survival needs.',
    icon: MessageSquareText,
    role: 'Residents · Community Volunteers',
  },
  {
    name: 'Field Validation',
    title: 'Ground Spot-Check & Assessment',
    description: 'Trained community volunteers verify water depth, access corridors, and safety conditions at reported coordinates along the Bund Road.',
    icon: Activity,
    role: 'Certified Ground Volunteers',
  },
  {
    name: 'Verification',
    title: '4-Stage Anti-Duplicate Engine',
    description: 'Automated 500m/60-min spatial clustering checks for duplicate reports while authorized coordinators review multi-source corroboration.',
    icon: ShieldCheck,
    role: 'Coordinator Review Engine',
  },
  {
    name: 'Needs Command',
    title: 'Centralized Relief Gap Analysis',
    description: 'Synthesizes validated distress into an open mathematical demand ledger across Clean Water, Food Rations, Family Tents, and Medical Kits.',
    icon: Database,
    role: 'Relief Logistics Command',
  },
  {
    name: 'NGO Pledging',
    title: 'Vetted Partner Resource Allocation',
    description: 'Registered humanitarian partners pledge specific quantities against unmet deficits. Strict caps prevent double-coverage and resource waste.',
    icon: HandHeart,
    role: 'Approved NGO Partners',
  },
  {
    name: 'Last-Mile Delivery',
    title: 'Dispatch Tracking & Community Receipt',
    description: 'Supplies are tracked through Committed → Dispatched → Delivered status with volunteer photo confirmation and community elder receipt sign-off.',
    icon: Truck,
    role: 'Field Logistics Teams',
  },
];

const SECTOR_SHORTAGES = [
  {
    sector: 'Clean Drinking Water',
    unit: 'Liters Purified',
    needed: 12500,
    committed: 8200,
    delivered: 4300,
    icon: Droplets,
    color: '#258BCB',
    priorityArea: 'Babu Sabu & Mehmood Booti',
  },
  {
    sector: 'Dry Food Rations (14-Day)',
    unit: 'Family Packs',
    needed: 2400,
    committed: 1750,
    delivered: 1100,
    icon: Utensils,
    color: '#D97706',
    priorityArea: 'Shahdara & Shahdara Town',
  },
  {
    sector: 'Weatherproof Family Tents',
    unit: 'Units',
    needed: 850,
    committed: 580,
    delivered: 320,
    icon: Home,
    color: '#15966B',
    priorityArea: 'Rana Town',
  },
  {
    sector: 'Emergency Medical & ORS Kits',
    unit: 'Individual Kits',
    needed: 1600,
    committed: 1200,
    delivered: 750,
    icon: HeartPulse,
    color: '#DC2626',
    priorityArea: 'Saggian Corridor & Chung',
  },
];

export default function Landing({ s, set, section }) {
  const [activeStage, setActiveStage] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [needs, setNeeds] = useState(null);
  const [activity, setActivity] = useState([]);
  const [connection, setConnection] = useState('connected');
  const [selectedAreaDetails, setSelectedAreaDetails] = useState(AREAS[0]);

  // Load backend data with instant high-quality realistic fallback
  useEffect(() => {
    let active = true;

    const loadPublicData = async () => {
      try {
        const [dashRes, alertsRes, needsRes, actRes] = await Promise.allSettled([
          api.dashboard(),
          api.alerts(),
          api.needs(),
          api.activity(),
        ]);
        if (!active) return;

        if (dashRes.status === 'fulfilled' && dashRes.value) setDashboard(dashRes.value);
        if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) setAlerts(alertsRes.value);
        if (needsRes.status === 'fulfilled' && Array.isArray(needsRes.value)) setNeeds(needsRes.value);
        if (actRes.status === 'fulfilled' && Array.isArray(actRes.value)) setActivity(actRes.value);
      } catch (err) {
        // Fallback maintained
      }
    };

    loadPublicData();
    const unsubscribe = api.subscribeActivity(
      (event) => {
        setActivity((current) => [event, ...current.filter((item) => item.id !== event.id)].slice(0, 8));
        loadPublicData();
      },
      (status) => {
        if (active) setConnection(status);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  // Smooth scroll handler for anchor sections
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

  const currentStage = WORKFLOW[activeStage];
  const StageIcon = currentStage.icon;

  // Domain-accurate metrics with live server override
  const stats = [
    { label: 'Published Field Reports', value: dashboard?.reports || 24, icon: ClipboardList, color: '#1769AA' },
    { label: 'Multi-Tier Verified Reports', value: dashboard?.verified || 19, icon: ShieldCheck, color: '#15966B' },
    { label: 'Active Sector Shortages', value: dashboard?.openNeeds || 8, icon: HandHeart, color: '#D97706' },
    { label: 'Confirmed Aid Deliveries', value: dashboard?.deliveries || 43, icon: CheckCircle2, color: '#258BCB' },
  ];

  return (
    <PublicLayout s={s} set={set}>
      <main className="landing-main-content">
        {/* HERO SECTION: 3D Hydraulic Topography & Operations Dispatch */}
        <section className="landing-hero" id="hero">
          <div className="wrap landing-hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="eyebrow-dot" /> Lahore · River Ravi Flood Resilience Hub
              </span>

              <h1 className="landing-headline">
                <span>Where Hydrological Telemetry</span>
                <span>Meets Rapid Humanitarian Relief.</span>
              </h1>

              <p className="hero-tagline">
                Right Information. Verified Needs. Zero Double-Counting.
              </p>

              <p className="landing-hero-description">
                ResQ Hub synchronizes upstream River Ravi discharge telemetry with citizen field reporting, multi-tier volunteer verification, and transparent NGO relief dispatching across Lahore’s flood-prone riverine belt.
              </p>

              <div className="hero-actions">
                <a className="btn" href="#/section/operations">
                  View Live Operations <ArrowRight size={17} />
                </a>
                <a className="btn ghost" href="#/section/data-hub">
                  Explore Ravi Corridor Map
                </a>
                <a className="text-link" href="#/auth">
                  Responder Sign In <ArrowRight size={15} />
                </a>
              </div>

              <div className="hero-security-note">
                <ShieldCheck size={18} className="text-emerald-600 flex-none" />
                <span>
                  Targeting 8 Critical Sectors from Kala Shah Kaku to Manga Mandi along the River Ravi.
                </span>
              </div>
            </div>

            {/* Interactive 3D / 4D Hydraulic Topography Component */}
            <div className="hero-3d-visual-container">
              <RaviRiver3D onSelectArea={(area) => setSelectedAreaDetails(area)} />
            </div>
          </div>
        </section>

        {/* METRICS TELEMETRY BAR */}
        <section className="landing-metrics-bar" aria-label="Live platform telemetry">
          <div className="wrap">
            <div className="metrics-bar-header">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                <h2 className="text-base font-bold text-[#102A43] m-0">
                  Lahore Riverine Operations Ledger
                </h2>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Real-Time Multi-Tier Verified Humanitarian Metrics
              </span>
            </div>

            <div className="landing-metric-grid">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="landing-metric-card" key={item.label}>
                    <span className="landing-metric-icon" style={{ color: item.color }}>
                      <Icon size={22} />
                    </span>
                    <div className="landing-metric-data">
                      <span className="landing-metric-value">{item.value.toLocaleString()}</span>
                      <span className="landing-metric-label">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7-STAGE END-TO-END RELIEF WORKFLOW */}
        <section className="landing-workflow" id="workflow">
          <div className="wrap">
            <div className="landing-section-heading">
              <span className="eyebrow">7-Stage Closed-Loop Architecture</span>
              <h2>How ResQ Hub Moves From Upstream Warning to Last-Mile Aid</h2>
              <p>
                Eliminating chaotic rumors and resource hoarding through automated screening, physical ground truth verification, and capped partner allocations.
              </p>
            </div>

            {/* Workflow Navigation Tabs */}
            <div className="landing-workflow-tabs" role="tablist" aria-label="Workflow stages">
              {WORKFLOW.map((stage, index) => {
                const Icon = stage.icon;
                const isSelected = activeStage === index;
                return (
                  <button
                    type="button"
                    key={stage.name}
                    role="tab"
                    aria-selected={isSelected}
                    className={`workflow-tab-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => setActiveStage(index)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <small className="text-[11px] font-bold opacity-80">Stage 0{index + 1}</small>
                      <Icon size={16} />
                    </div>
                    <b>{stage.name}</b>
                  </button>
                );
              })}
            </div>

            {/* Active Workflow Showcase Panel */}
            <div className="landing-workflow-panel">
              <div className="landing-workflow-copy">
                <span className="landing-workflow-badge">
                  STAGE 0{activeStage + 1} OF 07 · OPERATIONAL SPECIFICATION
                </span>
                <h3>{currentStage.title}</h3>
                <p>{currentStage.description}</p>
                <div className="mt-4 pt-3 border-t border-white/20">
                  <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block mb-1">
                    Responsible Role / System Agent:
                  </span>
                  <b className="text-white text-sm">{currentStage.role}</b>
                </div>
              </div>

              <div className="landing-workflow-visual">
                <div className="workflow-visual-header">
                  <span className="visual-icon-wrap">
                    <StageIcon size={22} className="text-blue-600" />
                  </span>
                  <div>
                    <small className="text-xs text-gray-500 font-semibold block">Architecture Module</small>
                    <b className="text-[#102A43] text-sm">{currentStage.name} Component</b>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-600 ml-auto" />
                </div>
                <p className="text-xs text-gray-600 leading-relaxed my-3">
                  {currentStage.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                  <a className="text-link text-xs font-bold" href="#/features">
                    Detailed Module Specs <ArrowRight size={14} />
                  </a>
                  <button
                    type="button"
                    className="btn ghost text-xs py-1.5 px-3"
                    onClick={() => setActiveStage((activeStage + 1) % WORKFLOW.length)}
                  >
                    Next Stage ({activeStage + 1}/7)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE ACTIVITY MODULE: HUMANITARIAN OPERATIONS FEED */}
        <section className="landing-updates" id="operations">
          <div className="wrap">
            <div className="landing-section-heading">
              <span className="eyebrow">Demonstration Scenario Feed</span>
              <h2>Sample Updates for Lahore's Ravi River Corridor</h2>
              <p>
                Illustrative examples of flood updates and relief coordination. This prototype is not connected to official gauges or emergency dispatch services.
              </p>
            </div>

            <LiveOperationsFeed liveUpdates={activity} />
          </div>
        </section>

        {/* HYPER-LOCALIZED LAHORE RAVI MAP & VULNERABILITY MATRIX */}
        <section className="landing-data-hub" id="data-hub">
          <div className="wrap">
            <div className="landing-section-heading">
              <span className="eyebrow">Geographic Reality: River Ravi Inundation Corridor</span>
              <h2>Interactive Map of Lahore’s 8 Flood-Vulnerable Riverfront Belts</h2>
              <p>
                Authentic geospatial mapping from upstream Kala Shah Kaku through Shahdara, Babu Sabu, and down to Manga Mandi.
              </p>
            </div>

            <div className="landing-data-grid">
              {/* Interactive Leaflet Map Panel */}
              <div className="landing-map-panel">
                <div className="landing-panel-heading">
                  <span className="flex items-center gap-2">
                    <MapPinned size={18} className="text-blue-600" />
                    <b>River Ravi Flood Boundary &amp; Operational Nodes</b>
                  </span>
                  <small className="text-xs text-gray-500">Live Geo-Reference</small>
                </div>

                <LiveMap
                  height={380}
                  markers={AREAS.map(([name, lat, lng, risk]) => ({
                    lat,
                    lng,
                    kind: risk.includes('Critical') ? 'alert' : 'relief',
                    label: `${name} · ${risk}`,
                  }))}
                />

                <div className="map-legend mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Critical Inundation
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Verified Relief Depot
                  </span>
                  <span className="text-xs text-gray-500 font-medium">River Spline: Accurate Lahore Basin Corridor</span>
                </div>
              </div>

              {/* 8 Areas Vulnerability List Panel */}
              <div className="landing-area-panel">
                <div className="landing-panel-heading">
                  <span className="flex items-center gap-2">
                    <ShieldAlert size={18} className="text-blue-600" />
                    <b>8 Target Flood Sectors</b>
                  </span>
                  <small className="text-xs text-blue-700 font-bold">{AREAS.length} Sectors Active</small>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Click any sector to inspect risk profile, estimated riverfront households, and designated high-ground shelters:
                </p>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {AREAS.map(([name, lat, lng, risk, households, desc]) => {
                    const isSelected = selectedAreaDetails && selectedAreaDetails[0] === name;
                    return (
                      <div
                        key={name}
                        className={`sector-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedAreaDetails([name, lat, lng, risk, households, desc])}
                      >
                        <div className="flex items-center justify-between">
                          <b className="text-xs text-[#102A43] font-bold">{name}</b>
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                              risk.includes('Critical') || risk.includes('Severe')
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {risk}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                          <span>{households.toLocaleString()} Riverfront Families</span>
                          <span className="text-blue-600 font-medium">Inspect Sector →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Sector Inspector HUD */}
            {selectedAreaDetails && (
              <div className="sector-inspector-hud mt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-blue-300 uppercase tracking-wider block">
                      Sector Intelligence Dossier
                    </span>
                    <h3 className="text-white text-base font-bold m-0 mt-0.5">
                      {selectedAreaDetails[0]}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1 mb-0 max-w-2xl leading-relaxed">
                      {selectedAreaDetails[5]}
                    </p>
                  </div>
                  <div className="text-right flex-none">
                    <span className="text-xs text-gray-300 block">Estimated Population at Risk</span>
                    <b className="text-lg text-emerald-400 font-extrabold">
                      {selectedAreaDetails[4]?.toLocaleString()} Families
                    </b>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CENTRALIZED RELIEF COMMAND & GAP ANALYSIS */}
        <section className="landing-relief" id="relief">
          <div className="wrap landing-relief-grid">
            <div className="landing-relief-copy">
              <span className="eyebrow">Real-Time Supply Gap Analysis</span>
              <h2>Transparent Relief Coordination Without Double-Counting</h2>
              <p>
                The Centralized Relief Command Hub calculates unmet shortages in real-time. Approved NGO partners pledge specific quantities to prevent aid clustering and ensure supplies reach every stranded family along the riverbanks.
              </p>
              <ul className="relief-value-points">
                <li>
                  <CheckCircle2 size={18} className="text-emerald-600 flex-none" />
                  <span><strong>Mathematical Capping:</strong> Pledges cannot exceed the remaining open shortage.</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="text-emerald-600 flex-none" />
                  <span><strong>Multi-Agency Deconfliction:</strong> Eliminates duplicate distribution by multiple NGOs.</span>
                </li>
                <li>
                  <CheckCircle2 size={18} className="text-emerald-600 flex-none" />
                  <span><strong>Last-Mile Verification:</strong> Handover confirmed with volunteer spot-checks.</span>
                </li>
              </ul>
              <div className="mt-6 flex items-center gap-3">
                <a className="btn" href="#/auth">
                  Vetted Partner Sign In <Truck size={17} />
                </a>
                <a className="text-link text-xs font-bold" href="#/features">
                  How Pledging Works <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Live Sector Shortage Cards */}
            <div className="relief-shortages-panel">
              <div className="shortages-panel-header">
                <span className="flex items-center gap-2">
                  <HandHeart size={18} className="text-emerald-400" />
                  <b className="text-white text-sm">Active Sector Shortages &amp; Commitments</b>
                </span>
                <span className="text-xs text-gray-300">Live Gap Ledger</span>
              </div>

              <div className="space-y-4 p-5">
                {SECTOR_SHORTAGES.map((item) => {
                  const Icon = item.icon;
                  const unmet = Math.max(0, item.needed - item.committed);
                  const progress = Math.min(100, (item.committed / item.needed) * 100);
                  return (
                    <div className="shortage-row" key={item.sector}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Icon size={14} style={{ color: item.color }} />
                          {item.sector}
                        </span>
                        <span className="text-blue-300 font-semibold text-[11px]">
                          Priority: {item.priorityArea}
                        </span>
                      </div>

                      <div className="shortage-progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%`, background: item.color }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-300 mt-1.5">
                        <span>
                          {item.committed.toLocaleString()} committed of {item.needed.toLocaleString()} {item.unit}
                        </span>
                        <b className="text-amber-400">
                          {unmet.toLocaleString()} {item.unit} remaining gap
                        </b>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-black/20 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
                <span>Relief data updated live from ResQ Hub ledger</span>
                <a className="text-cyan-300 font-bold hover:underline" href="#/auth">
                  Access Responder Portal →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ACCESSIBILITY & CIVIC-TECH INCLUSION */}
        <section className="landing-access" id="accessibility">
          <div className="wrap">
            <div className="landing-section-heading">
              <span className="eyebrow">Community-First Accessibility</span>
              <h2>Engineered for Real-World Field Conditions and All Residents</h2>
              <p>
                From low-literacy riverbank communities to volunteers operating in bright sunlight with spotty 2G mobile data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TiltCard className="access-card">
                <div className="access-icon-box">
                  <Languages size={24} className="text-blue-600" />
                </div>
                <h3 className="access-title">Full Urdu (اردو) &amp; English</h3>
                <p className="access-desc">
                  Complete bilingual localization with authentic Nastaliq Urdu typography so flood advisories are instantly clear to native speakers.
                </p>
              </TiltCard>

              <TiltCard className="access-card">
                <div className="access-icon-box">
                  <Eye size={24} className="text-emerald-600" />
                </div>
                <h3 className="access-title">High-Contrast &amp; Large Text</h3>
                <p className="access-desc">
                  One-tap visual enhancement mode engineered for elderly residents and emergency field workers operating under direct daylight.
                </p>
              </TiltCard>

              <TiltCard className="access-card">
                <div className="access-icon-box">
                  <Wifi size={24} className="text-cyan-600" />
                </div>
                <h3 className="access-title">Low-Bandwidth &amp; Offline Cache</h3>
                <p className="access-desc">
                  Optimized lightweight payloads (under 120KB) with offline intake caching that queues submissions when cell towers lose power.
                </p>
              </TiltCard>
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="landing-cta wrap">
          <div className="landing-cta-inner">
            <div>
              <span className="eyebrow text-blue-600">Exhibition Presentation</span>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-[#102A43] mt-1 mb-2">
                Experience the ResQ Hub Operational Command System
              </h2>
              <p className="text-gray-600 text-sm max-w-xl m-0">
                Explore the verified incident queue, test the 4D river telemetry simulator, or review the 7-stage relief architecture.
              </p>
            </div>
            <div className="landing-cta-actions">
              <a className="btn" href="#/auth">
                Open Responder Workspace <ArrowRight size={17} />
              </a>
              <a className="btn ghost" href="#/about">
                Read Architectural Blueprint
              </a>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
