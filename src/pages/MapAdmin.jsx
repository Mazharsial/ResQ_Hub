import { useEffect, useState } from 'react';
import { MapPinned, ShieldCheck, UsersRound } from 'lucide-react';
import { api, AREA_NAMES } from '../api';
import LiveMap from '../components/LiveMap';

function MapView() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api.reports().then(setReports).catch(reason => setError(reason.message || 'Map reports could not be loaded.'));
  }, []);

  const markers = reports.filter(report => report.public).map(report => ({
    lat: report.lat,
    lng: report.lng,
    label: `${report.district || 'Lahore area'} · ${report.status}`,
  }));

  return <div className="map-page">
    <header className="app-page-heading"><div><span className="eyebrow">Lahore · Community response</span><h1>Community map</h1><p>Public reports with approximate river context. This is not a flood-risk forecast.</p></div></header>
    {error && <div className="dashboard-error" role="alert">{error}</div>}
    <section className="map-workspace"><LiveMap markers={markers} height={500} />
      <div className="map-legend"><span><i className="legend-dot report-dot" /> Public community report</span><span>River path approximate</span></div>
      {!markers.length && <div className="compact-empty">No public reports are available to display yet.</div>}
    </section>
    <div className="scope-note"><b>Map context</b><p>River geometry is approximate. No shelter or relief-center locations are displayed until verified locations are added by an authorized partner.</p></div>
  </div>;
}

function Admin({ user }) {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [draft, setDraft] = useState({ area: AREA_NAMES[0], severity: 'High', text: '' });
  const [needDraft, setNeedDraft] = useState({ area: AREA_NAMES[0], cat: 'Clean water', needed: '', priority: '70' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [nextReports, nextUsers, nextAlerts] = await Promise.all([api.reports(), api.users(), api.alerts()]);
    setReports(nextReports);
    setUsers(nextUsers);
    setAlerts(nextAlerts);
  };
  useEffect(() => {
    load().catch(reason => setError(reason.message || 'Administrator data could not be loaded.'));
  }, []);

  const moderate = async (id, action) => {
    setError('');
    try {
      await api.moderateReport(id, action);
      setMessage(action === 'approve' ? 'Report approved for public sharing.' : 'Report review status updated.');
      await load();
    } catch (reason) {
      setError(reason.message || 'The report could not be updated.');
    }
  };

  const approve = async id => {
    setError('');
    try {
      await api.approveUser(id);
      setMessage('Organization access approved.');
      await load();
    } catch (reason) {
      setError(reason.message || 'The account could not be approved.');
    }
  };

  const broadcast = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await api.broadcast({ district: draft.area, hazard: 'Flood', sev: draft.severity, en: draft.text });
      setMessage(`Update published for ${draft.area}.`);
      setDraft(current => ({ ...current, text: '' }));
      await load();
    } catch (reason) {
      setError(reason.message || 'The update could not be published.');
    } finally {
      setBusy(false);
    }
  };

  const publishNeed = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.addNeed(needDraft);
      setMessage('Community need published.');
      setNeedDraft(current => ({ ...current, cat: '', needed: '' }));
      await load();
    } catch (reason) {
      setError(reason.message || 'The need could not be published.');
    }
  };

  const pending = reports.filter(report => !report.public && !['Rejected', 'Duplicate'].includes(report.status));
  const pendingPartners = users.filter(account => account.role === 'NGO' && !account.approved);
  const summary = [
    ['Registered accounts', users.length],
    ['Public updates', alerts.length],
    ['Reports awaiting review', pending.length],
    ['Partners awaiting approval', pendingPartners.length],
  ];

  return <div className="admin-page">
    <header className="app-page-heading"><div><span className="eyebrow">Authorized workspace</span><h1>Administration</h1><p>Review community submissions and publish verified public updates.</p></div><span className="workspace-role">{user.role}</span></header>
    {error && <div className="dashboard-error" role="alert">{error}</div>}
    {message && <p className="auth-success" role="status">{message}</p>}
    <section className="admin-metrics">{summary.map(([label, count]) => <article className="metric-card" key={label}><span className="metric-icon"><ShieldCheck size={19} /></span><span className="metric-value">{count}</span><span className="metric-label">{label}</span></article>)}</section>

    <section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">Review queue</span><h2>Submitted reports</h2></div><MapPinned size={20} /></div>
      {!pending.length ? <div className="compact-empty">No reports are waiting for review.</div> : pending.map(report => <article className="admin-list-row" key={report.id}>
        <div><b>{report.hazard} · {report.district}</b><p>{report.desc || 'No description provided.'}</p><small>{report.id} · {report.status}</small></div>
        <div className="row"><button className="btn" onClick={() => moderate(report.id, 'approve')}>Approve</button><button className="btn ghost" onClick={() => moderate(report.id, 'reject')}>Reject</button><button className="btn ghost" onClick={() => moderate(report.id, 'duplicate')}>Mark duplicate</button></div>
      </article>)}
    </section>

    <section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">Partner access</span><h2>Organization approvals</h2></div><UsersRound size={20} /></div>
      {!pendingPartners.length ? <div className="compact-empty">No organizations are waiting for approval.</div> : pendingPartners.map(account => <article className="admin-list-row" key={account.id}>
        <div><b>{account.name}</b><p>{account.email}</p></div><button className="btn" onClick={() => approve(account.id)}>Approve organization</button>
      </article>)}
      <details className="account-list"><summary>Registered accounts ({users.length})</summary>{users.map(account => <div className="account-row" key={account.id}><b>{account.name}</b><span>{account.email}</span><small>{account.role} · {account.approved ? 'Active' : 'Pending approval'}</small></div>)}</details>
    </section>

    <form className="admin-panel broadcast-form" onSubmit={publishNeed}>
      <div className="panel-heading"><div><span className="eyebrow">Needs coordination</span><h2>Publish a verified community need</h2></div></div>
      <p>Publish only needs confirmed through an authorized response partner.</p>
      <div className="broadcast-fields"><label>Area<select className="f" value={needDraft.area} onChange={event => setNeedDraft({ ...needDraft, area: event.target.value })}>{AREA_NAMES.map(name => <option key={name}>{name}</option>)}</select></label>
        <label>Need category<input className="f" maxLength="80" required value={needDraft.cat} onChange={event => setNeedDraft({ ...needDraft, cat: event.target.value })} /></label>
        <label>Quantity requested<input className="f" type="number" min="1" max="100000000" required value={needDraft.needed} onChange={event => setNeedDraft({ ...needDraft, needed: event.target.value })} /></label>
        <label>Priority (1–100)<input className="f" type="number" min="1" max="100" required value={needDraft.priority} onChange={event => setNeedDraft({ ...needDraft, priority: event.target.value })} /></label></div>
      <button className="btn">Publish verified need</button>
    </form>

    <form className="admin-panel broadcast-form" onSubmit={broadcast}>
      <div className="panel-heading"><div><span className="eyebrow">Public communication</span><h2>Publish an update</h2></div></div>
      <p>Only publish information that has been verified by an authorized source.</p>
      <div className="broadcast-fields"><label>Area<select className="f" value={draft.area} onChange={event => setDraft({ ...draft, area: event.target.value })}>{AREA_NAMES.map(name => <option key={name}>{name}</option>)}</select></label>
        <label>Severity<select className="f" value={draft.severity} onChange={event => setDraft({ ...draft, severity: event.target.value })}>{['High', 'Medium', 'Low'].map(level => <option key={level}>{level}</option>)}</select></label></div>
      <label>Update text<textarea className="f" rows="4" maxLength="500" required value={draft.text} onChange={event => setDraft({ ...draft, text: event.target.value })} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Publishing…' : 'Publish update'}</button>
    </form>
  </div>;
}

export default function MapAdmin({ page, user }) {
  return page === 'map' ? <MapView /> : <Admin user={user} />;
}
