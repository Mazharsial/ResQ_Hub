import { useEffect, useState } from 'react';
import { BellRing, MapPinned, MessageSquareText, Settings2 } from 'lucide-react';
import { AREA_NAMES, api } from '../api';

function loadAreas() {
  try {
    const saved = JSON.parse(localStorage.getItem('resq-areas') || '[]');
    return Array.isArray(saved) ? saved.filter(area => AREA_NAMES.includes(area)) : [];
  } catch {
    return [];
  }
}

export default function Misc({ page, s, set }) {
  const [areas, setAreas] = useState(loadAreas);
  const [selected, setSelected] = useState(AREA_NAMES[0]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (page !== 'community') return;
    api.activity().then(setActivity).catch(reason => setError(reason.message || 'Public updates could not be loaded.'));
  }, [page]);

  const saveAreas = next => {
    localStorage.setItem('resq-areas', JSON.stringify(next));
    setAreas(next);
  };

  if (page === 'profile') return <div className="settings-page">
    <header className="app-page-heading"><div><span className="eyebrow">Your workspace</span><h1>Profile and settings</h1><p>Personalize how ResQ Hub appears on this device.</p></div><Settings2 size={22} /></header>
    <section className="settings-panel"><h2>Display preferences</h2>
      <label>Language<select className="f" value={s.lang} onChange={event => set({ lang: event.target.value })}><option value="en">English</option><option value="ur">اردو</option></select></label>
      <label>Color theme<select className="f" value={s.theme} onChange={event => set({ theme: event.target.value })}>{['light', 'dark', 'contrast'].map(theme => <option key={theme}>{theme}</option>)}</select></label>
      <label className="preference-toggle"><input type="checkbox" checked={!s.motion} onChange={event => set({ motion: !event.target.checked })} /> Reduce motion</label>
      <label className="preference-toggle"><input type="checkbox" checked={s.low} onChange={event => set({ low: event.target.checked })} /> Low-bandwidth mode</label>
    </section>
    <section className="settings-panel"><h2>Saved areas</h2><p>Save areas to keep them easy to find on this device.</p>
      <div className="row"><select className="f area-select" aria-label="Area to save" value={selected} onChange={event => setSelected(event.target.value)}>{AREA_NAMES.map(area => <option key={area}>{area}</option>)}</select>
        <button className="btn" onClick={() => !areas.includes(selected) && saveAreas([...areas, selected])} disabled={areas.includes(selected)}>Save area</button></div>
      {!areas.length ? <div className="compact-empty">No areas have been saved.</div> : <ul className="saved-area-list">{areas.map(area => <li key={area}><span>{area}</span><button className="btn ghost" onClick={() => saveAreas(areas.filter(item => item !== area))}>Remove</button></li>)}</ul>}
    </section>
  </div>;

  return <div className="community-page">
    <header className="app-page-heading"><div><span className="eyebrow">Community workspace</span><h1>Community updates</h1><p>Public updates published through authorized ResQ Hub channels.</p></div><MessageSquareText size={22} /></header>
    {error && <div className="dashboard-error" role="alert">{error}</div>}
    <section className="community-panel"><div className="panel-heading"><div><span className="eyebrow">Published activity</span><h2>Local updates</h2></div><BellRing size={20} /></div>
      {!activity.length ? <div className="empty-panel compact"><span><MapPinned size={21} /></span><h2>No public updates have been posted</h2><p>Authorized ResQ Hub updates will appear here after publication.</p></div> : activity.map(item => <article className="community-update" key={item.id}>
        <b>{item.title}</b><p>{item.description}</p><small>{[item.area, new Date(item.createdAt).toLocaleString()].filter(Boolean).join(' · ')}</small>
      </article>)}
    </section>
    <section className="scope-note"><b>Community discussion</b><p>Public comments and Q&amp;A are not enabled in this release. Emergency requests should be reported through the report form or directed to official services.</p></section>
  </div>;
}
