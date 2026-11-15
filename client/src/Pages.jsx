import { useEffect, useState } from 'react';
import Scene from './Scene.jsx'; import Tilt from './Tilt.jsx'; import { api, CITIES } from './api.js';

export const Icon = ({ d }) => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
const IC = {
  alert: 'M12 3 2 21h20L12 3zM12 10v5M12 18v.01', people: 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-1a4 4 0 0 0-3-3.9', truck: 'M1 6h13v10H1zM14 10h5l3 3v3h-8M6 19h.01M18 19h.01', heart: 'M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z',
  food: 'M4 3v7a3 3 0 0 0 3 3v8M7 3v6M10 3v7M17 21V3c-2 1-3 4-3 8h3', water: 'M12 2.7S5 10 5 14a7 7 0 0 0 14 0c0-4-7-11.3-7-11.3z', shelter: 'M3 11 12 3l9 8M5 10v10h14V10', medical: 'M12 5v14M5 12h14', org: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6'
};
const ago = (d) => { const m = Math.max(1, Math.round((Date.now() - new Date(d)) / 6e4)); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} hr ago` : `${Math.round(m / 1440)} days ago`; };
const LABEL = { pending: 'Unverified', verified: 'Verified', pledged: 'Aid pledged', delivered: 'Delivered' };
const Badge = ({ s }) => <span className={'badge ' + s}>{LABEL[s]}</span>;
const Tile = ({ icon, n, label, tone }) => <Tilt className={'tile ' + tone}><Icon d={IC[icon]} /><b>{n}</b><span>{label}</span></Tilt>;
const Head = ({ title, sub }) => <header className="phead"><h1>{title}</h1>{sub && <p>{sub}</p>}</header>;
export const CityFilter = ({ city, setCity }) => city ? <p className="filter">Showing {city} <button className="ghost" onClick={() => setCity('')}>Show all cities</button></p> : null;

export function Alerts({ alerts, city, setCity }) {
  const [mode, setMode] = useState('simple');
  const list = alerts.filter((a) => !city || a.city === city);
  const speak = (t, l) => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = l; speechSynthesis.speak(u); };
  return (<><Head title="Alerts" sub="Read it, hear it, or switch to Urdu." /><CityFilter city={city} setCity={setCity} />
    <div className="seg" role="group" aria-label="Alert language">{[['simple', 'Simple English'], ['message', 'Full text'], ['urdu', 'اردو']].map(([k, l]) => <button key={k} aria-pressed={mode === k} onClick={() => setMode(k)}>{l}</button>)}</div>
    <div aria-live="polite">{!list.length && <p className="muted">No active alerts{city ? ` in ${city}` : ''}.</p>}
      {list.map((a) => {
        const t = a[mode] || a.simple; return (
          <article key={a._id} className={'alert ' + a.severity}><small>{a.city} · {a.type} · {ago(a.createdAt)}</small><h3>{a.title}</h3>
            <p lang={mode === 'urdu' ? 'ur' : 'en'} dir={mode === 'urdu' ? 'rtl' : 'ltr'} className={mode === 'urdu' ? 'ur' : ''}>{t}</p>
            <button className="ghost" onClick={() => speak(t, mode === 'urdu' ? 'ur-PK' : 'en-US')}>Listen to this alert</button></article>);
      })}</div></>);
}

export function Dashboard({ alerts, needs, overview, go, setCity }) {
  const top = alerts.find((a) => a.severity === 'danger') || alerts[0];
  return (<><Head title="Emergency Alerts" />
    {top && <div className="banner"><Icon d={IC.alert} /><div><b>{top.title}</b><p>{top.simple}</p></div><button className="primary" onClick={() => go('alerts')}>View details</button></div>}
    <div className="tiles"><Tile icon="alert" tone="r" n={overview.alerts ?? 0} label="Active alerts" /><Tile icon="people" tone="b" n={overview.families ?? 0} label="Families affected" />
      <Tile icon="truck" tone="g" n={overview.delivered ?? 0} label="Relief deliveries" /><Tile icon="heart" tone="p" n={overview.volunteers ?? 0} label="Volunteers" /></div>
    <section className="mapcard"><Scene needs={needs} alertCities={alerts.filter((a) => a.severity !== 'info').map((a) => a.city)} onPick={(c) => { setCity(c); go('hub'); }} />
      <button className="primary" onClick={() => go('map')}>View full map</button><Legend /></section></>);
}
export const Legend = () => <p className="legend"><i className="d red" />Active alert <i className="d amber" />Unverified <i className="d blue" />Verified <i className="d green" />Aid on the way</p>;

export function Report({ refresh }) {
  const [step, setStep] = useState(1), [msg, setMsg] = useState('');
  const [f, setF] = useState({ city: 'Lahore', type: 'flood', description: '', area: '', families: 1, needs: [], vulnerable: [], contact: '' });
  const tog = (k, v) => setF((s) => ({ ...s, [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] }));
  const send = async () => { try { await api('/needs', 'POST', { ...f, families: +f.families }); setMsg('done'); refresh(); } catch (e) { setMsg(e.message); } };
  const Chk = ({ k, opts }) => opts.map((o) => <label key={o} className="chip"><input type="checkbox" checked={f[k].includes(o)} onChange={() => tog(k, o)} />{o}</label>);
  if (msg === 'done') return <><Head title="Report sent" /><p>Thank you. Partners will confirm your report before aid is assigned.</p><button className="primary" onClick={() => { setMsg(''); setStep(1); }}>Send another report</button></>;
  return (<><Head title="Report a disaster" />
    <ol className="steps">{['Location', 'Details', 'Submit'].map((s, i) => <li key={s} aria-current={step === i + 1} className={step > i ? 'on' : ''}><span>{i + 1}</span>{s}</li>)}</ol>
    <div className="form">
      {step === 1 && <><label>City<select value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>Area or street<input required value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} /></label></>}
      {step === 2 && <><label>Incident type<select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option>flood</option><option>earthquake</option><option>landslide</option></select></label>
        <label>Description<textarea rows="3" maxLength="500" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <label>Families affected<input type="number" min="1" value={f.families} onChange={(e) => setF({ ...f, families: e.target.value })} /></label>
        <fieldset><legend>What is needed?</legend><Chk k="needs" opts={['food', 'water', 'shelter', 'medical']} /></fieldset>
        <fieldset><legend>Who is most at risk?</legend><Chk k="vulnerable" opts={['children', 'women', 'elderly', 'disability']} /></fieldset></>}
      {step === 3 && <><p><b>{f.type}</b> in <b>{f.area || '—'}, {f.city}</b>: {f.families} families need {f.needs.join(', ') || 'help'}.</p>
        <label>Phone for follow-up (kept private)<input value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></label></>}
      {msg && msg !== 'done' && <p role="alert" className="err">{msg}</p>}
      <div>{step > 1 && <button className="ghost" onClick={() => setStep(step - 1)}>Back</button>}
        {step < 3 ? <button className="primary" disabled={step === 1 && !f.area} onClick={() => setStep(step + 1)}>Next</button> : <button className="primary" onClick={send}>Submit report</button>}</div>
    </div></>);
}

function Actions({ n, role, refresh }) {
  const [err, setErr] = useState(''), [open, setOpen] = useState(false), [ngo, setNgo] = useState(''), [items, setItems] = useState('');
  const act = (p, b) => api(`/needs/${n._id}/${p}`, 'POST', b).then(() => { setOpen(false); refresh(); }).catch((e) => setErr(e.message));
  const partner = ['volunteer', 'ngo', 'admin'].includes(role), isNgo = ['ngo', 'admin'].includes(role);
  return <div>{err && <p role="alert" className="err">{err}</p>}
    {partner && n.status === 'pending' && <button className="ghost" onClick={() => act('verify')}>Confirm report</button>}
    {isNgo && ['verified', 'pledged'].includes(n.status) && !open && <button className="ghost" onClick={() => setOpen(true)}>Pledge aid</button>}
    {open && <div className="inline"><input aria-label="Organisation" placeholder="Your organisation" value={ngo} onChange={(e) => setNgo(e.target.value)} /><input aria-label="Items" placeholder="What will you deliver?" value={items} onChange={(e) => setItems(e.target.value)} /><button className="primary" onClick={() => act('pledge', { ngo, items })}>Confirm pledge</button></div>}
    {isNgo && n.status === 'pledged' && <button className="ghost" onClick={() => act('deliver')}>Mark delivered</button>}</div>;
}
const Row = ({ n, role, refresh }) => <article className="row"><div className={'ico ' + n.type}><Icon d={IC[n.type === 'earthquake' ? 'shelter' : 'water']} /></div>
  <div className="grow"><h3>{n.area}, {n.city} – {n.type}</h3><p className="muted">{n.families} families · needs {n.needs.join(', ') || 'help'} · updated {ago(n.updatedAt)}{n.pledges[0] ? ` · ${n.pledges[0].ngo}: ${n.pledges[0].items}` : ''}</p><Actions n={n} role={role} refresh={refresh} /></div><Badge s={n.status} /></article>;

export function Hub({ needs, city, setCity, role, refresh }) {
  const [tab, setTab] = useState('ver'); const list = needs.filter((n) => !city || n.city === city);
  const byCity = Object.entries(list.reduce((a, n) => ({ ...a, [n.city]: (a[n.city] || 0) + n.families }), {}));
  return (<><Head title="Verified data hub" sub="Accurate, cross-checked information. A report is verified after two partner confirmations." /><CityFilter city={city} setCity={setCity} />
    <div className="seg">{[['ver', 'Verified reports'], ['pen', 'Needs confirmation'], ['area', 'Affected areas']].map(([k, l]) => <button key={k} aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>)}</div>
    {tab === 'ver' && list.filter((n) => n.status !== 'pending').map((n) => <Row key={n._id} n={n} role={role} refresh={refresh} />)}
    {tab === 'pen' && list.filter((n) => n.status === 'pending').map((n) => <Row key={n._id} n={n} role={role} refresh={refresh} />)}
    {tab === 'area' && byCity.map(([c, f]) => <article className="row" key={c}><div className="grow"><h3>{c}</h3><p className="muted">{f} families reported</p></div><button className="ghost" onClick={() => setCity(c)}>Filter</button></article>)}</>);
}

export function Needs({ needs, go }) {
  const sum = (k) => needs.filter((n) => n.needs.includes(k) && n.status !== 'delivered').reduce((a, n) => a + n.families, 0);
  const areas = Object.entries(needs.filter((n) => n.status !== 'delivered').reduce((a, n) => ({ ...a, [n.city]: (a[n.city] || 0) + n.families }), {})).sort((a, b) => b[1] - a[1]), max = areas[0]?.[1] || 1;
  return (<><Head title="Needs dashboard" sub="Track and fulfil community needs (families still waiting)." />
    <div className="tiles"><Tile icon="food" tone="a" n={sum('food')} label="Food" /><Tile icon="water" tone="b" n={sum('water')} label="Clean water" /><Tile icon="shelter" tone="o" n={sum('shelter')} label="Shelter" /><Tile icon="medical" tone="p" n={sum('medical')} label="Medical aid" /></div>
    <div className="two"><section><h2>Top priority areas</h2>{areas.map(([c, f]) => <div key={c} className="bar"><span>{c}</span><div><i style={{ width: (f / max) * 100 + '%' }} /></div><b>{f}</b></div>)}</section>
      <Tilt className="cta"><h2>How you can help</h2><p>Donate, volunteer or share.</p><button className="light" onClick={() => go('coord')}>Support now</button></Tilt></div></>);
}

export function Coord({ ngos, needs, role, refresh, go }) {
  return (<><Head title="NGO and volunteer coordination" sub="Collaborate for faster relief." />
    <div className="two"><section>{ngos.map((o) => <Tilt key={o._id} className="row"><div className="ico"><Icon d={IC.org} /></div><div className="grow"><h3>{o.name}</h3><p className="muted">Relief: {o.relief}</p></div><span className="badge verified">{o.active ? 'Active' : 'Paused'}</span></Tilt>)}</section>
      <Tilt className="cta"><h2>Join relief efforts</h2><p>Be part of the relief mission.</p><button className="light" onClick={() => go('auth')}>Register now</button></Tilt></div>
    <h2>Relief requests</h2>{needs.filter((n) => n.status !== 'pending').map((n) => <Row key={n._id} n={n} role={role} refresh={refresh} />)}</>);
}

export function MapPage({ needs, alerts, city, setCity, go }) {
  const [t, setT] = useState('all'); const nn = needs.filter((n) => t === 'all' || n.type === t); const aa = alerts.filter((a) => a.severity !== 'info' && (t === 'all' || a.type === t));
  const fam = needs.filter((n) => n.city === city).reduce((s, n) => s + n.families, 0), al = alerts.find((a) => a.city === city);
  return (<><Head title="Disaster map" /><div className="seg">{['all', 'flood', 'earthquake', 'landslide'].map((k) => <button key={k} aria-pressed={t === k} onClick={() => setT(k)}>{k}</button>)}</div>
    <section className="mapcard tall"><Scene needs={nn} alertCities={aa.map((a) => a.city)} onPick={setCity} />
      {city && <div className="pop"><h3>{city}</h3><p>{al ? al.title : 'No active alert'}</p><p className="muted">Families affected: {fam}</p><button className="primary" onClick={() => go('hub')}>View details</button></div>}<Legend /></section></>);
}

export function Admin() {
  const [s, setS] = useState(null), [err, setErr] = useState('');
  const load = () => api('/admin/summary').then(setS).catch((e) => setErr(e.message)); useEffect(() => { load(); }, []);
  if (err) return <p className="err" role="alert">{err}</p>; if (!s) return <p>Loading…</p>;
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], mx = Math.max(1, ...s.monthly.map((m) => m.n));
  const pts = s.monthly.map((m, i) => `${20 + (s.monthly.length > 1 ? (i / (s.monthly.length - 1)) * 260 : 130)},${110 - (m.n / mx) * 90}`).join(' ');
  return (<><Head title="Admin dashboard" />
    <div className="tiles"><Tile icon="people" tone="b" n={s.users} label="Total users" /><Tile icon="alert" tone="r" n={s.alerts} label="Total alerts" /><Tile icon="medical" tone="g" n={s.resolved + '%'} label="Resolved" /><Tile icon="org" tone="p" n={s.orgs} label="Organisations" /></div>
    <div className="two"><section><h2>Reports per month</h2><svg viewBox="0 0 300 130" role="img" aria-label="Reports per month line chart"><polyline points={pts} fill="none" stroke="var(--blue)" strokeWidth="3" />
      {s.monthly.map((m, i) => <text key={i} x={20 + (s.monthly.length > 1 ? (i / (s.monthly.length - 1)) * 260 : 130)} y="126" fontSize="9" textAnchor="middle">{M[m._id - 1]}</text>)}</svg></section>
      <section><h2>Recent activity</h2>{s.recent.map((r) => <p key={r._id}>{r.area}, {r.city} · <Badge s={r.status} /> <span className="muted">{ago(r.createdAt)}</span></p>)}</section></div>
    <h2>Partner approvals</h2>{!s.pending.length && <p className="muted">No pending requests.</p>}
    {s.pending.map((u) => <article key={u._id} className="row"><div className="grow"><h3>{u.name}</h3><p className="muted">{u.email} wants {u.requestedRole} access</p></div><button className="primary" onClick={() => api(`/admin/users/${u._id}/approve`, 'POST').then(load)}>Approve</button></article>)}</>);
}
