import { useEffect, useState } from 'react';
import {
  BellRing, CheckCircle2, Eye, Languages, MapPin,
  MapPinned, MessageSquareText, Radio, Settings2, Shield,
  ShieldCheck, Smartphone, Users,
} from 'lucide-react';
import { AREA_NAMES, api } from '../api';
import LiveOperationsFeed from '../components/LiveOperationsFeed';

function loadAreas() {
  try {
    const saved = JSON.parse(localStorage.getItem('resq-areas') || '[]');
    return Array.isArray(saved) ? saved.filter((area) => AREA_NAMES.includes(area)) : [];
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
    api.activity()
      .then((serverActivity) => {
        if (Array.isArray(serverActivity)) setActivity(serverActivity);
      })
      .catch((reason) => setError(reason.message || 'Public updates could not be loaded.'));
  }, [page]);

  const saveAreas = (next) => {
    localStorage.setItem('resq-areas', JSON.stringify(next));
    setAreas(next);
  };

  if (page === 'profile') {
    return (
      <div className="settings-page">
        <header className="app-page-heading">
          <div>
            <span className="eyebrow">Device &amp; Telemetry Preferences</span>
            <h1>Workspace Profile &amp; Settings</h1>
            <p>Customize language, accessibility, and high-priority riverine watch sectors on this device.</p>
          </div>
          <Settings2 size={22} className="text-blue-600" />
        </header>

        <section className="settings-panel">
          <h2>Accessibility &amp; Display Controls</h2>
          <label>
            Interface Language
            <select
              className="f"
              value={s.lang}
              onChange={(e) => set({ lang: e.target.value })}
            >
              <option value="en">English (Professional Humanitarian Standard)</option>
              <option value="ur">اردو (Urdu Localization)</option>
            </select>
          </label>

          <label>
            Visual Contrast Theme
            <select
              className="f"
              value={s.theme}
              onChange={(e) => set({ theme: e.target.value })}
            >
              <option value="light">Standard Light (Clean Civic-Tech Canvas)</option>
              <option value="dark">Dark Matrix (High-Contrast Night Operations)</option>
              <option value="contrast">Ultra High Contrast (Field Sunlight Visibility)</option>
            </select>
          </label>

          <label className="preference-toggle">
            <input
              type="checkbox"
              checked={!s.motion}
              onChange={(e) => set({ motion: !e.target.checked })}
            />
            <span>Reduce 3D animations and fluid transitions (Battery saver mode)</span>
          </label>

          <label className="preference-toggle">
            <input
              type="checkbox"
              checked={s.low}
              onChange={(e) => set({ low: e.target.checked })}
            />
            <span>Low-bandwidth data mode (Prioritize plain text over map vector layers)</span>
          </label>
        </section>

        <section className="settings-panel">
          <h2>Monitored River Sectors</h2>
          <p className="text-xs text-gray-600 mb-3">
            Pin vulnerable sectors to prioritize early warning notifications on this terminal:
          </p>

          <div className="row">
            <select
              className="f area-select"
              aria-label="Area to pin"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {AREA_NAMES.map((area) => (
                <option key={area}>{area}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn text-xs py-2 px-3"
              onClick={() => !areas.includes(selected) && saveAreas([...areas, selected])}
              disabled={areas.includes(selected)}
            >
              Pin Sector
            </button>
          </div>

          {!areas.length ? (
            <div className="compact-empty mt-3">No prioritized riverfront sectors saved on this device.</div>
          ) : (
            <ul className="saved-area-list">
              {areas.map((area) => (
                <li key={area}>
                  <span className="font-semibold text-xs text-[#102A43]">{area}</span>
                  <button
                    type="button"
                    className="btn ghost text-xs py-1 px-2"
                    onClick={() => saveAreas(areas.filter((item) => item !== area))}
                  >
                    Unpin
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="community-page">
      <header className="app-page-heading">
        <div>
          <span className="eyebrow">Public Coordination Feed</span>
          <h1>Community Operations Stream</h1>
          <p>Verified public field notices and relief dispatches along the River Ravi.</p>
        </div>
        <MessageSquareText size={22} className="text-blue-600" />
      </header>

      {error && <div className="dashboard-error" role="alert">{error}</div>}

      <section className="community-panel">
        <LiveOperationsFeed liveUpdates={activity} />
      </section>

      <div className="scope-note mt-4">
        <b>Field Protocol</b>
        <p>
          Reports published here are vetted by certified ground volunteers and district coordinators. In active life-safety emergencies, immediately contact Rescue 1122.
        </p>
      </div>
    </div>
  );
}
