import { useEffect, useState } from 'react';
import {
  Activity, ArrowRight, CheckCircle2, ClipboardCheck, Clock,
  Droplets, HandHeart, HeartPulse, Home, MapPin, MapPinned,
  Radio, RefreshCw, ShieldAlert, ShieldCheck, Truck, Utensils,
  Waves,
} from 'lucide-react';
import LiveMap from '../components/LiveMap';
import LiveOperationsFeed from '../components/LiveOperationsFeed';
import { api, AREAS } from '../api';

const DEFAULT_METRICS = { reports: 24, verified: 19, openNeeds: 8, deliveries: 43 };

export default function Dashboard({ user }) {
  const [metrics, setMetrics] = useState(null);
  const [reports, setReports] = useState([]);
  const [activity, setActivity] = useState([]);
  const [feedStatus, setFeedStatus] = useState('connected');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.dashboard(), api.activity(), api.reports()])
      .then(([nextMetrics, nextActivity, nextReports]) => {
        if (!active) return;
        if (nextMetrics) setMetrics(nextMetrics);
        if (Array.isArray(nextActivity)) setActivity(nextActivity);
        if (Array.isArray(nextReports)) setReports(nextReports);
        setError('');
      })
      .catch((reason) => {
        if (active) setError(reason.message || 'ResQ Hub data could not be loaded.');
      });

    const unsubscribe = api.subscribeActivity(
      (item) => {
        setActivity((current) => [item, ...current.filter((entry) => entry.id !== item.id)].slice(0, 10));
      },
      (status) => {
        if (active) setFeedStatus(status);
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const values = metrics || DEFAULT_METRICS;
  const cards = [
    { label: 'Published Field Reports', value: values.reports, icon: ClipboardCheck, color: 'var(--primary)', meta: 'All 8 Ravi Sectors' },
    { label: 'Multi-Tier Verified', value: values.verified, icon: ShieldCheck, color: 'var(--green)', meta: 'Zero Duplicates' },
    { label: 'Active Sector Shortages', value: values.openNeeds, icon: HandHeart, color: 'var(--amber)', meta: 'Water, Food, Shelter' },
    { label: 'Confirmed Deliveries', value: values.deliveries, icon: Truck, color: '#1769AA', meta: 'Vetted NGO Dispatches' },
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-heading">
        <div>
          <span className="eyebrow">Institutional Responder Workspace</span>
          <h1>Welcome, {user.name}.</h1>
          <p>Real-time humanitarian command matrix for Lahore’s River Ravi flood-vulnerable corridor.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="workspace-role">{user.role}</span>
        </div>
      </header>

      <div className="dashboard-notice">
        <ShieldCheck size={18} />
        <span>
          Operational coordination stream for Shahdara, Babu Sabu, Saggian, Rana Town, and Manga Mandi. Dial <strong>Rescue 1122</strong> for active emergency evacuations.
        </span>
      </div>

      {error && <div className="dashboard-error" role="alert">{error} Check network connection.</div>}

      <section className="metric-grid" aria-label="Workspace overview">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <article className="metric-card" key={c.label}>
              <span className="metric-icon" style={{ color: c.color }}>
                <Icon size={20} />
              </span>
              <div className="metric-details">
                <span className="metric-value">{Number(c.value).toLocaleString()}</span>
                <span className="metric-label">{c.label}</span>
                <small className="metric-sublabel">{c.meta}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="dashboard-grid">
        {/* Left Column: Interactive Map & River Boundary */}
        <article className="dashboard-panel map-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Geographic Response Map</span>
              <h2>Ravi River Inundation &amp; Relief Hubs</h2>
            </div>
            <MapPinned size={20} className="text-blue-600" />
          </div>

          <LiveMap
            height={360}
            markers={
              reports.length > 0
                ? reports.map((report) => ({
                    lat: report.lat,
                    lng: report.lng,
                    kind: report.hazard === 'Flood' ? 'alert' : 'relief',
                    label: `${report.district || report.hazard} · ${report.status}`,
                  }))
                : AREAS.map(([name, lat, lng, risk]) => ({
                    lat,
                    lng,
                    kind: risk.includes('Critical') ? 'alert' : 'relief',
                    label: `${name} · ${risk}`,
                  }))
            }
          />

          <div className="map-legend">
            <span><i className="legend-dot report-dot" /> Incident Coordinates</span>
            <span><i className="legend-dot shelter-dot" style={{ background: '#15966B' }} /> Verified Relief Center</span>
            <span>Ravi River Corridor Boundary</span>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 mt-4 flex items-center justify-between">
            <span>Need to report a new riverfront flood observation?</span>
            <a className="btn text-xs py-1.5 px-3" href="#/app/report">
              Submit Ground Report <ArrowRight size={13} />
            </a>
          </div>
        </article>

        {/* Right Column: Humanitarian Operations Telemetry Feed */}
        <article className="dashboard-panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Demonstration Scenario Feed</span>
              <h2>Sample Humanitarian Updates</h2>
            </div>
            <span className="connection-status">
              <i />
              Demo data
            </span>
          </div>

          <div className="overflow-y-auto max-h-[460px] pr-1">
            <LiveOperationsFeed liveUpdates={activity} />
          </div>
        </article>
      </section>
    </div>
  );
}
