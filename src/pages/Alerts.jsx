import { useEffect, useState } from 'react';
import { AlertTriangle, BellRing, Droplets, MapPin, Radio, ShieldAlert, Volume2, Waves } from 'lucide-react';
import { api, AREA_NAMES } from '../api';

const BASELINE_ALERTS = [
  {
    id: 'ALT-101',
    hazard: 'Critical River Inundation',
    sev: 'High',
    district: 'Shahdara & Shahdara Town',
    en: 'Ravi River discharge at Shahdara Railway Bridge has surged past 78,000 cusecs due to upstream flow releases. Residents in low-elevation riverside katchi settlements are advised to relocate immediately to the Shahdara High Ground Shelter. Avoid riverfront embankments.',
    ur: 'دریائے راوی شاہدرہ ریلوے پل پر پانی کا اخراج 78,000 کیوسک سے تجاوز کر گیا ہے۔ دریا کے نشیبی کنارے کے مکین فوری طور پر گورنمنٹ ہائی گراؤنڈ کیمپ شاہدرہ منتقل ہوں۔ دریا کے پشتوں سے دور رہیں۔',
    simple: 'River water is very high in Shahdara. Move to the high school shelter now.',
    timestamp: '15 mins ago',
  },
  {
    id: 'ALT-102',
    hazard: 'Drainage Backflow Surge',
    sev: 'High',
    district: 'Babu Sabu & Mehmood Booti',
    en: 'High river backpressure detected at Babu Sabu Bund Road outfall. Municipal storm gates are engaged. Low-lying areas along Bund Road should seal ground-level drinking water storage against contamination.',
    ur: 'بابو صابو بند روڈ کے نکاسی آب گیٹ پر دریا کا دباؤ بڑھ گیا ہے۔ پینے کے پانی کے ٹینکوں کو آلودگی سے بچانے کے لیے فوری محفوظ بنائیں۔',
    simple: 'Water pressure is high near Bund Road. Protect drinking water now.',
    timestamp: '45 mins ago',
  },
  {
    id: 'ALT-103',
    hazard: 'Riverfront Seepage Advisory',
    sev: 'Medium',
    district: 'Rana Town',
    en: 'Minor agricultural embankment seepage observed along Rana Town bend. Volunteer observation units deployed to monitor bank stability. Livestock should be shifted away from riverside grazing grounds.',
    ur: 'رانا ٹاؤن کے زرعی پشتوں پر پانی کے ہلکے رساؤ کی اطلاع ہے۔ مویشیوں کو دریا کے قریب سے محفوظ اونچی جگہوں پر منتقل کریں۔',
    simple: 'Water is leaking near farm banks in Rana Town. Move animals to high ground.',
    timestamp: '2 hours ago',
  },
  {
    id: 'ALT-104',
    hazard: 'Logistics Corridor Standby',
    sev: 'Medium',
    district: 'Saggian & Ravi Bridge Corridor',
    en: 'Saggian bypass and Ravi Bridge corridor remain clear for humanitarian relief convoys. Traffic police and rescue teams maintaining dedicated transit lane for emergency vehicles.',
    ur: 'سگیاں اور راوی پل روٹ امدادی گاڑیوں کے لیے کھلا ہے۔ ریسکیو اور پولیس کی خصوصی ٹیمیں تعینات ہیں۔',
    simple: 'Saggian bridge road is open for emergency help trucks.',
    timestamp: '3 hours ago',
  },
  {
    id: 'ALT-105',
    hazard: 'Downstream Discharge Monitoring',
    sev: 'Low',
    district: 'Manga Mandi',
    en: 'Controlled downstream flow passing Manga Mandi riverine belt. Water levels are currently stable but being logged hourly. Community relief desk is on 24-hour standby.',
    ur: 'مانگا منڈی کے علاقے میں پانی کا بہاؤ فی الحال قابو میں ہے۔ نگرانی کا عمل مسلسل جاری ہے۔',
    simple: 'River flow is steady in Manga Mandi. Teams are watching the water.',
    timestamp: '5 hours ago',
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(BASELINE_ALERTS);
  const [area, setArea] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLanguage] = useState({});
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadAlerts = async () => {
    try {
      const serverAlerts = await api.alerts();
      if (Array.isArray(serverAlerts) && serverAlerts.length > 0) {
        setAlerts(serverAlerts);
      } else {
        setAlerts(BASELINE_ALERTS);
      }
    } catch {
      setAlerts(BASELINE_ALERTS);
    }
  };

  useEffect(() => {
    loadAlerts();
    const unsubscribe = api.subscribeActivity((item) => {
      if (item.type === 'alert') loadAlerts();
    }, () => {});
    return unsubscribe;
  }, []);

  const visible = alerts.filter(
    (alert) => (area === 'All' || alert.district === area) && (severity === 'All' || alert.sev === severity),
  );

  const speak = (text, lang = 'en-US') => {
    if (!window.speechSynthesis) {
      setMessage('Audio playback is not supported on this browser.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    setMessage('Audio broadcast playing…');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className={`alerts-page ${largeText ? 'large-text' : ''} ${highContrast ? 'high-contrast' : ''}`}>
      <header className="app-page-heading">
        <div>
          <span className="eyebrow">Hydrological Early Warning</span>
          <h1>Flood Alerts &amp; River Advisories</h1>
          <p>Verified early warning notices for Lahore’s Ravi River corridor.</p>
        </div>
      </header>

      {/* Toolbar for Area, Severity, and Accessibility Enhancements */}
      <div className="alerts-toolbar">
        <label>
          Filter Sector
          <select className="f" value={area} onChange={(e) => setArea(e.target.value)}>
            <option>All</option>
            {AREA_NAMES.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <label>
          Severity
          <select className="f" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            {['All', 'High', 'Medium', 'Low'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>

        <div className="flex gap-2 items-end">
          <button
            type="button"
            className={`btn ghost ${largeText ? 'active' : ''}`}
            aria-pressed={largeText}
            onClick={() => setLargeText(!largeText)}
          >
            Large Text
          </button>
          <button
            type="button"
            className={`btn ghost ${highContrast ? 'active' : ''}`}
            aria-pressed={highContrast}
            onClick={() => setHighContrast(!highContrast)}
          >
            High Contrast
          </button>
        </div>
      </div>

      {error && <div className="dashboard-error" role="alert">{error}</div>}
      {message && <div className="p-2.5 rounded bg-blue-50 text-blue-900 text-xs mb-3" role="status">{message}</div>}

      <div className="alert-list" aria-live="polite">
        {visible.map((alert) => {
          const currentLang = language[alert.id] || 'en';
          const displayText = currentLang === 'ur' && alert.ur
            ? alert.ur
            : currentLang === 'simple' && alert.simple
            ? alert.simple
            : alert.en;

          return (
            <article className={`alert-card border-l-4 ${alert.sev === 'High' ? 'border-l-red-600' : 'border-l-amber-500'}`} key={alert.id}>
              <div className="alert-card-heading">
                <span className={`severity severity-${String(alert.sev).toLowerCase()}`}>
                  {alert.sev} Warning
                </span>
                <b className="text-[#102A43] text-sm">{alert.hazard}</b>
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <MapPin size={13} className="text-blue-600" />
                  {alert.district}
                </span>
                {alert.timestamp && (
                  <span className="text-[11px] text-gray-400 ml-auto">{alert.timestamp}</span>
                )}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed my-3" dir={currentLang === 'ur' ? 'rtl' : 'ltr'}>
                {displayText}
              </p>

              <div className="row alert-actions pt-2 border-t border-gray-100">
                <button
                  type="button"
                  className="btn ghost text-xs py-1.5 px-2.5"
                  onClick={() => speak(displayText, currentLang === 'ur' ? 'ur-PK' : 'en-US')}
                >
                  <Volume2 size={15} /> Audio Broadcast
                </button>
                {alert.ur && (
                  <button
                    type="button"
                    className={`btn ghost text-xs py-1.5 px-2.5 ${currentLang === 'ur' ? 'font-bold text-blue-700' : ''}`}
                    onClick={() => setLanguage({ ...language, [alert.id]: 'ur' })}
                  >
                    اردو
                  </button>
                )}
                <button
                  type="button"
                  className={`btn ghost text-xs py-1.5 px-2.5 ${currentLang === 'en' ? 'font-bold text-blue-700' : ''}`}
                  onClick={() => setLanguage({ ...language, [alert.id]: 'en' })}
                >
                  English
                </button>
                {alert.simple && (
                  <button
                    type="button"
                    className={`btn ghost text-xs py-1.5 px-2.5 ${currentLang === 'simple' ? 'font-bold text-blue-700' : ''}`}
                    onClick={() => setLanguage({ ...language, [alert.id]: 'simple' })}
                  >
                    Simple Language
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="emergency-note">
        <b>Need Immediate Life-Safety Evacuation?</b>
        <p>
          ResQ Hub provides community early warning and relief coordination. For urgent flood rescue boats and medical ambulances in Punjab, immediately dial <strong>Rescue 1122</strong>.
        </p>
      </div>
    </div>
  );
}
