import { useEffect, useState } from 'react';
import { Activity, ClipboardCheck, HandCoins, MapPinned, Radio, RefreshCw, ShieldCheck } from 'lucide-react';
import LiveMap from '../components/LiveMap';
import { api } from '../api';

const EMPTY_METRICS = { reports: 0, verified: 0, openNeeds: 0, deliveries: 0 };

export default function Dashboard({ user }) {
  const [metrics, setMetrics] = useState(null);
  const [reports, setReports] = useState([]);
  const [activity, setActivity] = useState([]);
  const [feedStatus, setFeedStatus] = useState('connecting');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([api.dashboard(), api.activity(), api.reports()])
      .then(([nextMetrics, nextActivity, nextReports]) => {
        if (!active) return;
        setMetrics(nextMetrics);
        setActivity(nextActivity);
        setReports(nextReports);
        setError('');
      })
      .catch(reason => {
        if (active) setError(reason.message || 'ResQ Hub data could not be loaded.');
      });

    const unsubscribe = api.subscribeActivity(item => {
      setActivity(current => [item, ...current.filter(entry => entry.id !== item.id)].slice(0, 8));
    }, setFeedStatus);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const values = metrics || EMPTY_METRICS;
  const cards = [
    [ClipboardCheck, values.reports, 'Public reports', 'var(--primary)'],
    [ShieldCheck, values.verified, 'Verified reports', 'var(--green)'],
    [HandCoins, values.openNeeds, 'Open needs', 'var(--amber)'],
    [Activity, values.deliveries, 'Completed deliveries', '#7452C8'],
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-heading">
        <div><span className="eyebrow">ResQ Hub workspace</span><h1>Good to see you, {user.name}.</h1><p>Current information for the Ravi-side Lahore pilot workspace.</p></div>
        <span className="workspace-role">{user.role}</span>
      </header>
      <div className="dashboard-notice"><ShieldCheck size={18} /><span>Use official authority channels for emergency instructions. This workspace is for community coordination.</span></div>
      {error && <div className="dashboard-error" role="alert">{error} Check the service connection and try again.</div>}

      <section className="metric-grid" aria-label="Workspace overview">
        {cards.map(([Icon, value, label, color]) => (
          <article className="metric-card" key={label}>
            <span className="metric-icon" style={{ color }}><Icon size={20} /></span>
            <span className="metric-value">{metrics ? Number(value).toLocaleString() : '—'}</span>
            <span className="metric-label">{label}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel map-panel">
          <div className="panel-heading"><div><span className="eyebrow">Lahore · Community response</span><h2>Community reports</h2></div><MapPinned size={20} /></div>
          <LiveMap markers={reports.map(report => ({
            lat: report.lat,
            lng: report.lng,
            kind: report.hazard === 'Flood' ? 'alert' : 'relief',
            label: `${report.district || report.hazard} · ${report.status}`,
          }))} />
          <div className="map-legend"><span><i className="legend-dot report-dot" /> Public report</span><span>River path approximate</span></div>
        </article>

        <article className="dashboard-panel activity-panel">
          <div className="panel-heading"><div><span className="eyebrow">Updates from ResQ Hub</span><h2>Live activity</h2></div>
            <span className={`connection-status status-${feedStatus}`}><i />{feedStatus === 'connected' ? 'Live' : feedStatus === 'reconnecting' ? 'Reconnecting' : feedStatus === 'error' ? 'Update error' : 'Connecting'}</span>
          </div>
          {activity.length ? <ol className="activity-list" aria-live="polite">
            {activity.map(item => <li key={item.id}>
              <span className="activity-icon"><Radio size={16} /></span>
              <div><b>{item.title}</b><p>{item.description}</p>
                <small>{[item.area, item.createdAt && new Date(item.createdAt).toLocaleString()].filter(Boolean).join(' · ')}</small>
              </div>
            </li>)}
          </ol> : <div className="activity-empty">
            <span className="empty-icon"><RefreshCw size={20} /></span>
            <b>{feedStatus === 'connected' ? 'No updates have been published yet' : 'Waiting for the activity service'}</b>
            <p>New verified public updates will appear here when the ResQ Hub service publishes them.</p>
          </div>}
          <p className="activity-footnote">Activity shows ResQ Hub updates; it is not an official emergency alert feed.</p>
        </article>
      </section>
    </div>
  );
}
