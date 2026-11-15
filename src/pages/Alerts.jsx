import { useEffect, useState } from 'react';
import { AlertTriangle, Volume2 } from 'lucide-react';
import { api, AREA_NAMES } from '../api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [area, setArea] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLanguage] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadAlerts = () => api.alerts().then(setAlerts).catch(reason => setError(reason.message || 'Alerts could not be loaded.'));
  useEffect(() => {
    loadAlerts();
    const unsubscribe = api.subscribeActivity(item => {
      if (item.type === 'alert') loadAlerts();
    }, () => {});
    return unsubscribe;
  }, []);

  const visible = alerts.filter(alert => (area === 'All' || alert.district === area)
    && (severity === 'All' || alert.sev === severity));
  const speak = text => {
    if (!window.speechSynthesis) return setMessage('Audio playback is not supported in this browser.');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  return <div className={`alerts-page${largeText ? ' large-text' : ''}${highContrast ? ' high-contrast' : ''}`}>
    <header className="app-page-heading"><div><span className="eyebrow">Verified updates</span><h1>Alerts</h1><p>Public updates published by ResQ Hub services.</p></div></header>
    <div className="alerts-toolbar">
      <label>Area<select className="f" value={area} onChange={event => setArea(event.target.value)}><option>All</option>{AREA_NAMES.map(name => <option key={name}>{name}</option>)}</select></label>
      <label>Severity<select className="f" value={severity} onChange={event => setSeverity(event.target.value)}>{['All', 'High', 'Medium', 'Low'].map(item => <option key={item}>{item}</option>)}</select></label>
      <button className="btn ghost" aria-pressed={largeText} onClick={() => setLargeText(value => !value)}>Large text</button>
      <button className="btn ghost" aria-pressed={highContrast} onClick={() => setHighContrast(value => !value)}>High contrast</button>
    </div>
    {error && <div className="dashboard-error" role="alert">{error}</div>}
    {message && <p role="status">{message}</p>}
    {!visible.length && <div className="empty-panel"><span><AlertTriangle size={22} /></span><h2>No public alerts are available</h2><p>When an authorized ResQ Hub update is published, it will appear here. For immediate emergency instructions, follow local authorities.</p></div>}
    <div className="alert-list" aria-live="polite">
      {visible.map(alert => {
        const text = language[alert.id] === 'ur' && alert.ur ? alert.ur
          : language[alert.id] === 'simple' && alert.simple ? alert.simple
            : alert.en;
        return <article className="alert-card" key={alert.id}>
          <div className="alert-card-heading"><span className={`severity severity-${String(alert.sev).toLowerCase()}`}>{alert.sev}</span><b>{alert.hazard}</b><span>{alert.district}</span></div>
          <p dir={language[alert.id] === 'ur' ? 'rtl' : 'ltr'}>{text}</p>
          <div className="row alert-actions">
            <button className="btn ghost" onClick={() => speak(text)}><Volume2 size={17} /> Listen</button>
            {alert.simple && <button className="btn ghost" onClick={() => setLanguage({ ...language, [alert.id]: 'simple' })}>Simple language</button>}
            {alert.ur && <button className="btn ghost" onClick={() => setLanguage({ ...language, [alert.id]: 'ur' })}>اردو</button>}
            <button className="btn ghost" onClick={() => setLanguage({ ...language, [alert.id]: 'en' })}>English</button>
          </div>
        </article>;
      })}
    </div>
    <div className="emergency-note"><b>Need emergency assistance?</b><p>ResQ Hub is not an emergency service. In Punjab, call Rescue 1122 for urgent assistance.</p></div>
  </div>;
}
