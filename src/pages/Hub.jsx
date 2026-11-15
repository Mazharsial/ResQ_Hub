import { useEffect, useState } from 'react';
import { CheckCircle2, ClipboardList, Search } from 'lucide-react';
import { api } from '../api';

const TABS = ['Flood reports', 'Affected areas', 'Relief centers', 'Shelters'];

export default function Hub({ user }) {
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('time');
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.reports().then(setReports).catch(reason => setError(reason.message || 'Reports could not be loaded.'));
  }, []);

  const list = reports.filter(report => (report.public || user.role === 'Admin')
    && `${report.district || ''} ${report.hazard || ''}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'time' ? new Date(b.time) - new Date(a.time) : (b.confidence || 0) - (a.confidence || 0));

  return <div className="hub-page">
    <header className="app-page-heading"><div><span className="eyebrow">Community information</span><h1>Verified data hub</h1><p>Browse public reports and validated response information.</p></div></header>
    <div className="hub-tabs" role="tablist" aria-label="Data categories">{TABS.map((title, index) =>
      <button key={title} role="tab" aria-selected={tab === index} className={tab === index ? 'selected' : ''} onClick={() => setTab(index)}>{title}</button>)}</div>
    {error && <div className="dashboard-error" role="alert">{error}</div>}
    {tab === 0 ? <>
      <div className="hub-toolbar">
        <label className="hub-search"><Search size={17} /><input className="f" aria-label="Search public reports" placeholder="Search reports or areas" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <select className="f" aria-label="Sort reports" value={sort} onChange={event => setSort(event.target.value)}><option value="time">Newest first</option><option value="confidence">Verification confidence</option></select>
      </div>
      {!list.length && <div className="empty-panel"><span><ClipboardList size={22} /></span><h2>No public reports yet</h2><p>Reports will appear here after they have been reviewed for public sharing.</p></div>}
      <div className="hub-report-list">{list.map(report => <article className="hub-report" key={report.id}>
        <div className="hub-report-icon"><CheckCircle2 size={21} /></div>
        <div className="hub-report-content">
          <div className="hub-report-title"><b>{report.district || 'Lahore area'} · {report.hazard}</b><span className={report.status === 'Verified' ? 'verified-tag' : 'pending-tag'}>{report.status}</span></div>
          <p>{report.desc || 'A community report has been submitted for review.'}</p>
          <div className="hub-report-meta"><span>{report.srcs?.length || 1} reporting source{(report.srcs?.length || 1) === 1 ? '' : 's'}</span><span>{report.time ? new Date(report.time).toLocaleString() : ''}</span></div>
          {selected === report.id && <ul className="report-details"><li>Report ID: {report.id}</li><li>Location: {report.lat}, {report.lng}</li><li>Review status: {report.status}</li></ul>}
          <button className="btn ghost" onClick={() => setSelected(selected === report.id ? null : report.id)}>{selected === report.id ? 'Hide details' : 'View details'}</button>
        </div>
      </article>)}</div>
    </> : <div className="empty-panel"><span><ClipboardList size={22} /></span><h2>{TABS[tab]} are not available yet</h2><p>Verified information will be shown here once it has been published by an authorized ResQ Hub partner.</p></div>}
  </div>;
}
