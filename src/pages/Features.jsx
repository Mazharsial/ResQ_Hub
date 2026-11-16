import { useState } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, BellRing, CheckCircle2,
  ChevronRight, ClipboardCheck, Database, Droplets, Eye,
  FileCheck, FileText, HandHeart, HeartPulse, Home, Languages,
  Layers, MapPin, MapPinned, MessageSquareText, ShieldAlert,
  ShieldCheck, Sliders, Smartphone, Sparkles, Truck, Utensils,
  Volume2, Waves, XCircle,
} from 'lucide-react';
import PublicLayout from '../components/PublicLayout';
import TiltCard from '../components/TiltCard';

const CORE_MODULES = [
  {
    id: 'early-warning',
    number: '01',
    title: 'Geo-Targeted Early Warning System',
    tagline: 'Hydrological River Gauging & Multi-Channel Alert Broadcasting',
    icon: BellRing,
    accent: '#1769AA',
    overview: 'Monitors real-time River Ravi discharge data from upstream gauging stations (Ravi Syphon, Marala, and Shahdara Bridge) to trigger automated, localized advisories before floodwaters overflow riverbanks.',
    capabilities: [
      'Bilingual alerts in professional English and authentic Urdu (اردو) typography.',
      'High-contrast and large-text display modes for low-vision and outdoor sunlight legibility.',
      'Text-to-speech audio broadcast synthesis for low-literacy riverine residents.',
      'Severity triage categorizing alerts into Critical Inundation, Flash Flood Advisory, and Controlled Water Release.',
      'Direct SMS/Push gateway architecture capable of operating in low-bandwidth cellular conditions.',
    ],
    interactiveType: 'alert-simulator',
  },
  {
    id: 'citizen-reporting',
    number: '02',
    title: 'Citizen & Volunteer Field Reporting',
    tagline: 'Structured Low-Bandwidth Distress Intake & Demographic Profiling',
    icon: MessageSquareText,
    accent: '#258BCB',
    overview: 'A lightweight, GPS-enabled mobile web intake form enabling affected citizens and ground volunteers to submit structured emergency distress requests in under 60 seconds.',
    capabilities: [
      'Pinpoint GPS map coordinate capture with automatic snap to nearest Lahore Ravi sector.',
      'Categorized distress reporting: Submerged Homes, Stranded Families, Medical Emergencies, and Clean Water Contamination.',
      'Demographic vulnerability counters tracking children, pregnant women, elderly, and persons with disabilities.',
      'Strict zero-PII data privacy: No national identity cards or sensitive personal phone numbers stored publicly.',
      'Offline submission caching for intermittent cellular service along the river floodplain.',
    ],
    interactiveType: 'report-simulator',
  },
  {
    id: 'verification-engine',
    number: '03',
    title: '4-Stage Anti-Duplicate Verification Engine',
    tagline: 'Spatial-Temporal Clustering & Ground Truth Validation Pipeline',
    icon: ShieldCheck,
    accent: '#15966B',
    overview: 'Eliminates fake distress calls, panic rumors, and duplicate reports through a disciplined 4-stage validation pipeline that guarantees clean data for humanitarian decision-makers.',
    capabilities: [
      'Stage 1 — Reported: Raw distress intake logged with unique tracking identifier (RQ-XXXXX).',
      'Stage 2 — Under Verification: Automatic 500m / 60-min spatial clustering checks for duplicate incident submissions.',
      'Stage 3 — Verified: Ground spot-check confirmation by registered field volunteers or authorized district certifiers.',
      'Stage 4 — Rejected / Duplicate: Erroneous or malicious submissions archived to protect supply integrity.',
      'Mathematical confidence scoring factoring in reporter verification history and multi-source corroboration.',
    ],
    interactiveType: 'pipeline-simulator',
  },
  {
    id: 'command-hub',
    number: '04',
    title: 'Centralized Relief Command Hub',
    tagline: 'Real-Time Supply Gap Analysis & Sector Shortage Ledger',
    icon: Database,
    accent: '#D97706',
    overview: 'Consolidates verified community distress across all 8 Lahore Ravi River sectors into a live mathematical demand ledger, tracking exactly what supplies are needed vs. pledged vs. delivered.',
    capabilities: [
      'Live gap analysis: Total Needed − (Committed Pledges + Delivered Supplies) = Unmet Deficit.',
      '4 core emergency supply categories: Clean Drinking Water, Dry Food Rations, Waterproof Family Tents, and Essential Medical Kits.',
      'Vulnerability-weighted prioritization algorithm giving higher priority to elderly/child-heavy pockets.',
      'Dynamic charts visualizing sector shortages across Shahdara, Babu Sabu, Saggian, and Manga Mandi.',
      'Automated export for humanitarian logistics coordinators and disaster management committees.',
    ],
    interactiveType: 'gap-simulator',
  },
  {
    id: 'ngo-portal',
    number: '05',
    title: 'NGO & Relief Partner Allocation Portal',
    tagline: 'Direct Resource Pledging, Dispatch Manifests & Delivery Confirmation',
    icon: Truck,
    accent: '#102A43',
    overview: 'Dedicated portal for vetted humanitarian relief partners (e.g., Al-Khidmat Foundation, Pakistan Red Crescent, Edhi Foundation) to pledge aid and track last-mile distribution.',
    capabilities: [
      'Smart anti-overpledge safeguards: System strictly prevents pledging beyond the remaining open requirement.',
      'Multi-agency coordination: Prevents two separate NGOs from duplicating aid to the same micro-settlement.',
      '3-stage delivery lifecycle tracking: Committed → Dispatched with Vehicle Manifest → Delivered on Site.',
      'Beneficiary confirmation and volunteer spot-check verification upon final handover.',
      'Digital delivery audit trail establishing accountability for institutional donors and community elders.',
    ],
    interactiveType: 'partner-simulator',
  },
];

export default function Features({ s, set }) {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  // Interactive Simulator States
  const [simAlertSev, setSimAlertSev] = useState('High');
  const [simAlertLang, setSimAlertLang] = useState('en');

  const [simPipeStage, setSimPipeStage] = useState(2); // 0: Reported, 1: Under Verification, 2: Verified, 3: Rejected

  const [simNeedWater, setSimNeedWater] = useState({ needed: 5000, committed: 3200, delivered: 1800 });

  const activeModule = CORE_MODULES[activeModuleIndex];

  return (
    <PublicLayout s={s} set={set}>
      <main className="public-page features-page">
        {/* Features Page Hero */}
        <section className="features-hero-section">
          <div className="wrap">
            <span className="eyebrow">
              <span className="eyebrow-dot" /> Enterprise System Specifications
            </span>
            <h1 className="features-hero-title">
              Complete Humanitarian Operational Capabilities of ResQ Hub.
            </h1>
            <p className="features-hero-lead">
              A breakdown of the 5 core modules powering flood readiness, early warning, ground validation, and equitable relief allocation across Lahore’s Ravi River corridor.
            </p>
          </div>
        </section>

        {/* Core Modules Interactive Showcase */}
        <section className="modules-showcase-section wrap">
          {/* Top Horizontal Module Navigator */}
          <div className="modules-nav-bar" role="tablist" aria-label="Core modules">
            {CORE_MODULES.map((mod, idx) => {
              const Icon = mod.icon;
              const isSelected = activeModuleIndex === idx;
              return (
                <button
                  type="button"
                  key={mod.id}
                  role="tab"
                  aria-selected={isSelected}
                  className={`module-nav-tab ${isSelected ? 'active' : ''}`}
                  onClick={() => setActiveModuleIndex(idx)}
                >
                  <span className="tab-number">{mod.number}</span>
                  <Icon size={18} className="tab-icon" />
                  <span className="tab-title">{mod.title.split(' ')[0]} {mod.title.split(' ')[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Module Detailed Showcase Card */}
          <div className="module-detail-card">
            <div className="module-grid">
              {/* Left Column: Module Description & Capabilities */}
              <div className="module-copy">
                <div className="flex items-center gap-2 mb-2">
                  <span className="module-number-pill">Module {activeModule.number}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{activeModule.tagline}</span>
                </div>
                <h2 className="module-heading">{activeModule.title}</h2>
                <p className="module-overview">{activeModule.overview}</p>

                <h3 className="capabilities-title">Key Operational Capabilities</h3>
                <ul className="capabilities-list">
                  {activeModule.capabilities.map((cap) => (
                    <li key={cap}>
                      <CheckCircle2 size={16} className="text-emerald-600 flex-none mt-0.5" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Interactive Module Simulator */}
              <div className="module-simulator-box">
                <div className="simulator-header">
                  <span className="simulator-badge">
                    <Activity size={13} className="text-emerald-400" /> Interactive Module Demo
                  </span>
                  <span className="text-xs text-gray-400">Live Architecture Simulator</span>
                </div>

                <div className="simulator-body">
                  {/* Simulator 1: Early Warning Alert Simulator */}
                  {activeModule.id === 'early-warning' && (
                    <div className="sim-content">
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="font-bold text-gray-700">Simulate Severity Level:</span>
                        <div className="flex gap-1.5">
                          {['High', 'Medium', 'Low'].map((lvl) => (
                            <button
                              type="button"
                              key={lvl}
                              className={`sim-toggle-btn ${simAlertSev === lvl ? 'active' : ''}`}
                              onClick={() => setSimAlertSev(lvl)}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="font-bold text-gray-700">Display Language:</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            className={`sim-toggle-btn ${simAlertLang === 'en' ? 'active' : ''}`}
                            onClick={() => setSimAlertLang('en')}
                          >
                            English
                          </button>
                          <button
                            type="button"
                            className={`sim-toggle-btn ${simAlertLang === 'ur' ? 'active' : ''}`}
                            onClick={() => setSimAlertLang('ur')}
                          >
                            اردو (Urdu)
                          </button>
                        </div>
                      </div>

                      <div className={`sim-alert-card severity-${simAlertSev.toLowerCase()}`}>
                        <div className="flex items-center justify-between pb-2 border-b border-black/10">
                          <span className="font-bold text-xs">
                            {simAlertSev} Severity Alert · Shahdara Sector
                          </span>
                          <span className="text-[11px] font-semibold text-gray-600">Shahdara Bridge Gauge</span>
                        </div>
                        <p className="text-sm font-medium mt-2 mb-3 leading-relaxed" dir={simAlertLang === 'ur' ? 'rtl' : 'ltr'}>
                          {simAlertLang === 'ur'
                            ? 'دریائے راوی شاہدرہ پل پر پانی کا اخراج 78,000 کیوسک سے تجاوز کر گیا۔ دریا کے نشیبی کنارے کے مکین فوری طور پر گورنمنٹ ہائی گراؤنڈ کیمپ منتقل ہوں۔'
                            : 'River Ravi discharge at Shahdara Railway Bridge has exceeded 78,000 cusecs. Low-lying riverfront residents are advised to execute planned relocation to Shahdara High Ground Shelter.'}
                        </p>
                        <div className="flex items-center gap-2 pt-2 border-t border-black/10 text-xs">
                          <Volume2 size={14} className="text-blue-700" />
                          <span className="text-gray-600 text-[11px]">Audio broadcast synthesis available for community loudspeaker relays.</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simulator 2: Structured Field Reporting Intake */}
                  {activeModule.id === 'citizen-reporting' && (
                    <div className="sim-content">
                      <div className="sim-form-preview">
                        <div className="sim-form-field">
                          <label>Location Coordinates</label>
                          <input readOnly value="31.6210° N, 74.2850° E (Shahdara Town Riverbank)" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 sim-form-field">
                          <div>
                            <label>Displaced Families</label>
                            <input readOnly value="28 Families (140 People)" />
                          </div>
                          <div>
                            <label>Immediate Sector Need</label>
                            <input readOnly value="Clean Water & Tarpaulins" />
                          </div>
                        </div>
                        <div className="sim-form-field">
                          <label>Vulnerability Assessment</label>
                          <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-bold">18 Elderly</span>
                            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-bold">34 Children</span>
                            <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">Zero PII Leaked</span>
                          </div>
                        </div>
                        <div className="sim-submit-btn">
                          <span>Verified Token: RQ-90821-SHD</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simulator 3: 4-Stage Verification Pipeline */}
                  {activeModule.id === 'verification-engine' && (
                    <div className="sim-content">
                      <span className="text-xs font-bold text-gray-700 block mb-3">Interactive Pipeline Stepper:</span>
                      <div className="sim-stepper">
                        {['1. Reported', '2. Under Verification', '3. Verified', '4. Rejected / Dup'].map((stName, sIdx) => (
                          <button
                            type="button"
                            key={stName}
                            className={`sim-stepper-btn ${simPipeStage === sIdx ? 'active' : ''}`}
                            onClick={() => setSimPipeStage(sIdx)}
                          >
                            {stName}
                          </button>
                        ))}
                      </div>

                      <div className="sim-pipeline-status-card">
                        <div className="flex items-center gap-2 mb-1.5">
                          {simPipeStage === 2 ? (
                            <CheckCircle2 size={18} className="text-emerald-600" />
                          ) : simPipeStage === 3 ? (
                            <XCircle size={18} className="text-rose-600" />
                          ) : (
                            <Activity size={18} className="text-amber-600" />
                          )}
                          <b className="text-sm">
                            {simPipeStage === 0 && 'Incident Token Registered in Review Queue'}
                            {simPipeStage === 1 && 'Running Spatial Duplicate Clustering (500m radius)'}
                            {simPipeStage === 2 && 'Ground Validation Confirmed by Sector Volunteer'}
                            {simPipeStage === 3 && 'Marked as Duplicate Report (Merged into Token RQ-482)'}
                          </b>
                        </div>
                        <p className="text-xs text-gray-600 m-0 leading-relaxed">
                          {simPipeStage === 2
                            ? 'Confidence Score: 94%. Incident forwarded to Centralized Relief Command Hub for NGO pledging.'
                            : simPipeStage === 1
                            ? 'Analyzing GPS proximity against 14 existing submissions along Saggian Corridor...'
                            : simPipeStage === 0
                            ? 'Awaiting secondary confirmation by field certifier or community elder.'
                            : 'Redundant allocation prevented. Supplies preserved for uncovered areas.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Simulator 4: Centralized Relief Gap Analysis */}
                  {activeModule.id === 'command-hub' && (
                    <div className="sim-content">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="font-bold text-gray-700">Clean Water Rations Gap (Babu Sabu)</span>
                        <span className="font-bold text-blue-700">
                          {simNeedWater.needed - simNeedWater.committed} L Unmet Deficit
                        </span>
                      </div>

                      {/* Stacked Progress Bar */}
                      <div className="sim-progress-track">
                        <div
                          className="sim-progress-fill delivered"
                          style={{ width: `${(simNeedWater.delivered / simNeedWater.needed) * 100}%` }}
                          title={`Delivered: ${simNeedWater.delivered}`}
                        />
                        <div
                          className="sim-progress-fill committed"
                          style={{ width: `${((simNeedWater.committed - simNeedWater.delivered) / simNeedWater.needed) * 100}%` }}
                          title={`Committed: ${simNeedWater.committed - simNeedWater.delivered}`}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                        <div className="p-2 rounded bg-emerald-50 border border-emerald-100">
                          <span className="text-[10px] text-gray-500 block">Delivered</span>
                          <b className="text-emerald-700">{simNeedWater.delivered} L</b>
                        </div>
                        <div className="p-2 rounded bg-blue-50 border border-blue-100">
                          <span className="text-[10px] text-gray-500 block">In Transit</span>
                          <b className="text-blue-700">{simNeedWater.committed - simNeedWater.delivered} L</b>
                        </div>
                        <div className="p-2 rounded bg-amber-50 border border-amber-100">
                          <span className="text-[10px] text-gray-500 block">Open Shortage</span>
                          <b className="text-amber-700">{simNeedWater.needed - simNeedWater.committed} L</b>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simulator 5: NGO Partner Allocation Portal */}
                  {activeModule.id === 'ngo-portal' && (
                    <div className="sim-content">
                      <div className="sim-partner-card">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs">
                          <b className="text-[#102A43]">Pakistan Red Crescent Dispatch Unit</b>
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            Vetted Partner
                          </span>
                        </div>
                        <div className="space-y-1.5 my-2.5 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Target Sector:</span>
                            <strong className="text-gray-900">Manga Mandi Downstream Hub</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Pledged Resource:</span>
                            <strong className="text-gray-900">450 Family Food Baskets (14 Days)</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Dispatch Status:</span>
                            <span className="text-blue-600 font-bold">En Route (Vehicle # LHR-8921)</span>
                          </div>
                        </div>
                        <div className="p-2 rounded bg-gray-50 text-[11px] text-gray-500 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>Strict Anti-Overpledge Lock: 0 Surplus Waste</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Module Feature Grid Summary */}
        <section className="features-grid-section wrap">
          <div className="section-header-centered">
            <span className="eyebrow">Comprehensive Platform Scope</span>
            <h2 className="section-title">All 5 Core Modules Working as One Connected Engine</h2>
            <p className="section-subtitle">
              ResQ Hub links community alerts, volunteer verification, centralized triage, and partner dispatching into a seamless, synchronized loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {CORE_MODULES.map((item, index) => {
              const Icon = item.icon;
              return (
                <TiltCard key={item.id} className="feature-module-card">
                  <div className="flex items-center justify-between mb-4">
                    <span className="module-card-icon" style={{ color: item.accent }}>
                      <Icon size={24} />
                    </span>
                    <span className="module-card-num">{item.number}</span>
                  </div>
                  <h3 className="module-card-title">{item.title}</h3>
                  <p className="module-card-desc">{item.overview}</p>
                  <button
                    type="button"
                    className="module-card-link"
                    onClick={() => {
                      setActiveModuleIndex(index);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                  >
                    Open Simulator Demo <ChevronRight size={14} />
                  </button>
                </TiltCard>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="features-cta-section wrap">
          <div className="about-cta-card">
            <div className="cta-copy">
              <span className="eyebrow text-blue-200">Exhibition Showcase</span>
              <h2 className="text-white text-2xl lg:text-3xl font-extrabold mt-1 mb-2">
                Ready to Experience the Live Flood Readiness Workspace?
              </h2>
              <p className="text-gray-200 text-sm max-w-xl m-0">
                Access the authenticated responder dashboard, submit live ground reports, or test the verified relief coordination hub.
              </p>
            </div>
            <div className="cta-actions">
              <a className="btn bg-white text-[#102A43] hover:bg-gray-100" href="#/auth">
                Responder Workspace <ArrowRight size={16} />
              </a>
              <a className="btn ghost text-white border-white/30 hover:bg-white/10" href="#/">
                Return to Overview
              </a>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
