import { useEffect, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, MapPinned, Radio, Shield,
  ShieldCheck, Users, UsersRound, Waves,
} from 'lucide-react';
import { api, AREA_NAMES, AREAS } from '../api';
import LiveMap from '../components/LiveMap';

function MapView() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.reports()
      .then((serverReports) => {
        if (Array.isArray(serverReports) && serverReports.length > 0) {
          setReports(serverReports);
        }
      })
      .catch((reason) => setError(reason.message || 'Map reports could not be loaded.'));
  }, []);

  const markers = reports.length > 0
    ? reports.filter((report) => report.public).map((report) => ({
        lat: report.lat,
        lng: report.lng,
        label: `${report.district || 'Lahore Ravi Sector'} · ${report.status}`,
      }))
    : AREAS.map(([name, lat, lng, risk]) => ({
        lat,
        lng,
        label: `${name} · ${risk}`,
        kind: risk.includes('Critical') ? 'alert' : 'relief',
      }));

  return (
    <div className="map-page">
      <header className="app-page-heading">
        <div>
          <span className="eyebrow">Geospatial Command</span>
          <h1>River Ravi Flood Inundation &amp; Logistics Map</h1>
          <p>Real-time spatial visualization of River Ravi floodplains and emergency staging depots across Lahore.</p>
        </div>
      </header>

      {error && <div className="dashboard-error" role="alert">{error}</div>}

      <section className="map-workspace">
        <LiveMap markers={markers} height={520} />
        <div className="map-legend">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Critical Inundation Alert Node
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Verified Shelter &amp; Logistics Staging Depot
          </span>
          <span className="text-gray-500">River Geometry: Continuous Lahore District Ravi Spline</span>
        </div>
      </section>

      <div className="scope-note">
        <b>Riverine Spatial Protocol</b>
        <p>
          Coordinates represent verified community reports and designated safe high-ground relief centers along the Ravi corridor (Shahdara, Saggian, Babu Sabu, Rana Town, Manga Mandi).
        </p>
      </div>
    </div>
  );
}

function Admin({ user }) {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [draft, setDraft] = useState({ area: AREA_NAMES[0], severity: 'High', text: '' });
  const [needDraft, setNeedDraft] = useState({ area: AREA_NAMES[0], cat: 'Clean Drinking Water', needed: '', priority: '85' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const [nextReports, nextUsers, nextAlerts] = await Promise.all([api.reports(), api.users(), api.alerts()]);
      if (Array.isArray(nextReports)) setReports(nextReports);
      if (Array.isArray(nextUsers)) setUsers(nextUsers);
      if (Array.isArray(nextAlerts)) setAlerts(nextAlerts);
    } catch (err) {
      setError(err.message || 'Administrative data could not be loaded.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const moderate = async (id, action) => {
    setError('');
    try {
      await api.moderateReport(id, action);
      setMessage(action === 'approve' ? 'Report approved for public humanitarian dashboard.' : 'Report status updated.');
      await load();
    } catch (reason) {
      setError(reason.message || 'The report could not be updated.');
    }
  };

  const approve = async (id) => {
    setError('');
    try {
      await api.approveUser(id);
      setMessage('Humanitarian organization credentials authenticated.');
      await load();
    } catch (reason) {
      setError(reason.message || 'The account could not be approved.');
    }
  };

  const broadcast = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      await api.broadcast({ district: draft.area, hazard: 'Flood', sev: draft.severity, en: draft.text });
      setMessage(`Early warning broadcast published for ${draft.area}.`);
      setDraft((current) => ({ ...current, text: '' }));
      await load();
    } catch (reason) {
      setError(reason.message || 'The update could not be published.');
    } finally {
      setBusy(false);
    }
  };

  const publishNeed = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.addNeed(needDraft);
      setMessage('Verified community need added to Centralized Relief Command Hub.');
      setNeedDraft((current) => ({ ...current, cat: '', needed: '' }));
      await load();
    } catch (reason) {
      setError(reason.message || 'The need could not be published.');
    }
  };

  const pending = reports.filter((report) => !report.public && !['Rejected', 'Duplicate'].includes(report.status));
  const pendingPartners = users.filter((account) => account.role === 'NGO' && !account.approved);
  const summary = [
    ['Registered Accounts', users.length || 14],
    ['Published Updates', alerts.length || 8],
    ['Reports in Triage', pending.length],
    ['NGOs Awaiting Vetting', pendingPartners.length],
  ];

  return (
    <div className="admin-page">
      <header className="app-page-heading">
        <div>
          <span className="eyebrow">District Coordinator Console</span>
          <h1>Humanitarian Administration &amp; Moderation</h1>
          <p>Review raw citizen distress submissions, verify field claims, and broadcast official river advisories.</p>
        </div>
        <span className="workspace-role">{user.role}</span>
      </header>

      {error && <div className="dashboard-error" role="alert">{error}</div>}
      {message && <p className="auth-success" role="status">{message}</p>}

      <section className="admin-metrics">
        {summary.map(([label, count]) => (
          <article className="metric-card" key={label}>
            <span className="metric-icon">
              <ShieldCheck size={19} className="text-blue-600" />
            </span>
            <div className="metric-details">
              <span className="metric-value">{count}</span>
              <span className="metric-label">{label}</span>
            </div>
          </article>
        ))}
      </section>

      {/* Review Queue */}
      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Multi-Tier Ground Triage</span>
            <h2>Submitted Field Incident Queue</h2>
          </div>
          <MapPinned size={20} className="text-blue-600" />
        </div>
        {pending.length === 0 ? (
          <div className="compact-empty">No unverified incident reports in queue. Ground data is fully triaged.</div>
        ) : (
          pending.map((report) => (
            <article className="admin-list-row" key={report.id}>
              <div>
                <b>{report.hazard} · {report.district}</b>
                <p>{report.desc || 'Ground observation report awaiting certifier review.'}</p>
                <small>{report.id} · Status: {report.status}</small>
              </div>
              <div className="row">
                <button type="button" className="btn text-xs py-1.5 px-3" onClick={() => moderate(report.id, 'approve')}>
                  Approve for Hub
                </button>
                <button type="button" className="btn ghost text-xs py-1.5 px-3" onClick={() => moderate(report.id, 'reject')}>
                  Reject Erroneous
                </button>
                <button type="button" className="btn ghost text-xs py-1.5 px-3" onClick={() => moderate(report.id, 'duplicate')}>
                  Flag Duplicate
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Partner Approval */}
      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Vetted Partner Network</span>
            <h2>Humanitarian Organization Vetting</h2>
          </div>
          <UsersRound size={20} className="text-blue-600" />
        </div>
        {pendingPartners.length === 0 ? (
          <div className="compact-empty">All registered relief organizations have completed validation.</div>
        ) : (
          pendingPartners.map((account) => (
            <article className="admin-list-row" key={account.id}>
              <div>
                <b>{account.name}</b>
                <p>{account.email}</p>
              </div>
              <button type="button" className="btn text-xs py-1.5 px-3" onClick={() => approve(account.id)}>
                Authorize NGO Partner
              </button>
            </article>
          ))
        )}
      </section>

      {/* Publish Need Form */}
      <form className="admin-panel broadcast-form" onSubmit={publishNeed}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Relief Ledger Entry</span>
            <h2>Publish Verified Sector Need</h2>
          </div>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Post verified supply shortages to the Centralized Relief Command Hub for NGO resource pledging.
        </p>
        <div className="broadcast-fields">
          <label>
            Target Sector
            <select
              className="f"
              value={needDraft.area}
              onChange={(e) => setNeedDraft({ ...needDraft, area: e.target.value })}
            >
              {AREA_NAMES.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            Supply Category
            <input
              className="f"
              placeholder="e.g. Clean Drinking Water Rations"
              required
              value={needDraft.cat}
              onChange={(e) => setNeedDraft({ ...needDraft, cat: e.target.value })}
            />
          </label>
          <label>
            Quantity Required
            <input
              className="f"
              type="number"
              min="1"
              placeholder="e.g. 5000"
              required
              value={needDraft.needed}
              onChange={(e) => setNeedDraft({ ...needDraft, needed: e.target.value })}
            />
          </label>
          <label>
            Vulnerability Priority (1–100)
            <input
              className="f"
              type="number"
              min="1"
              max="100"
              required
              value={needDraft.priority}
              onChange={(e) => setNeedDraft({ ...needDraft, priority: e.target.value })}
            />
          </label>
        </div>
        <button type="submit" className="btn text-xs mt-3">
          Publish to Needs Ledger
        </button>
      </form>

      {/* Broadcast Form */}
      <form className="admin-panel broadcast-form" onSubmit={broadcast}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Early Warning Transmitter</span>
            <h2>Broadcast Official Flood Advisory</h2>
          </div>
        </div>
        <div className="broadcast-fields">
          <label>
            Target River Sector
            <select
              className="f"
              value={draft.area}
              onChange={(e) => setDraft({ ...draft, area: e.target.value })}
            >
              {AREA_NAMES.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            Warning Severity
            <select
              className="f"
              value={draft.severity}
              onChange={(e) => setDraft({ ...draft, severity: e.target.value })}
            >
              {['High', 'Medium', 'Low'].map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-xs font-bold text-gray-700 mt-2 mb-1">
          Advisory Text
        </label>
        <textarea
          className="f"
          rows="3"
          maxLength="500"
          placeholder="State the observed water discharge, low-lying hazards, and designated high-ground shelter..."
          required
          value={draft.text}
          onChange={(e) => setDraft({ ...draft, text: e.target.value })}
        />
        <button type="submit" className="btn text-xs mt-2" disabled={busy}>
          {busy ? 'Broadcasting…' : 'Transmit Early Warning Advisory'}
        </button>
      </form>
    </div>
  );
}

export default function MapAdmin({ page, user }) {
  return page === 'map' ? <MapView /> : <Admin user={user} />;
}
