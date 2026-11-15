
import { useEffect, useState, useCallback } from 'react';

import Scene from './Scene.jsx';
import Tilt from './Tilt.jsx';
import { api, setToken } from './api.js';

import * as P from './Pages.jsx';
import Header, { Logo } from './Header.jsx';
import Footer from './Footer.jsx';
import About from './About.jsx';
import Contact from './Contact.jsx';

// ---------------- AUTH ----------------

function Auth({ onAuth, back, initial }) {
  const [reg, setReg] = useState(initial === 'register');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setBusy(true);
    setErr('');

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const result = await api(
        reg ? '/auth/register' : '/auth/login',
        'POST',
        data
      );

      if (!result?.token || !result?.user) {
        throw new Error('Invalid server response. Please try again.');
      }

      onAuth(result.token, result.user);
    } catch (error) {
      setErr(error.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <aside>
        <Logo dark />
        <h2>Together for a Safer Pakistan</h2>
      </aside>

      <main>
        <div className="seg">
          <button
            type="button"
            aria-pressed={!reg}
            onClick={() => {
              setReg(false);
              setErr('');
            }}
          >
            Login
          </button>

          <button
            type="button"
            aria-pressed={reg}
            onClick={() => {
              setReg(true);
              setErr('');
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} className="form">
          {reg && (
            <label>
              Full name (or organisation name for NGOs)
              <input
                name="name"
                type="text"
                required
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email address
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={reg ? 'new-password' : 'current-password'}
            />
          </label>

          {reg && (
            <label>
              I am joining as
              <select name="role" defaultValue="citizen">
                <option value="citizen">Citizen</option>
                <option value="volunteer">
                  Volunteer (needs approval)
                </option>
                <option value="ngo">
                  NGO (needs approval)
                </option>
              </select>
            </label>
          )}

          {err && (
            <p role="alert" className="err">
              {err}
            </p>
          )}

          <button
            type="submit"
            className="primary"
            disabled={busy}
          >
            {busy
              ? 'Please wait...'
              : reg
                ? 'Create account'
                : 'Login'}
          </button>
        </form>

        <button
          type="button"
          className="ghost"
          onClick={back}
        >
          Back to home
        </button>
      </main>
    </div>
  );
}

// ---------------- LANDING PAGE ----------------

function Landing({ needs, alerts, toApp }) {
  const features = [
    [
      'Accessible alerts',
      'Location-based warnings in text, audio, simple language and Urdu.',
      'alert'
    ],
    [
      'Verified data hub',
      'Reports from citizens, volunteers and NGOs are cross-checked.',
      'org'
    ],
    [
      'Needs dashboard',
      'See who needs food, water, shelter and medical help.',
      'people'
    ],
    [
      'Relief coordination',
      'Match verified needs with NGOs and track deliveries.',
      'truck'
    ]
  ];

  const icons = {
    alert: 'M12 3 2 21h20L12 3zM12 10v5M12 18v.01',

    org: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6',

    people:
      'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6',

    truck:
      'M1 6h13v10H1zM14 10h5l3 3v3h-8M6 19h.01M18 19h.01'
  };

  return (
    <div className="land">

      <header className="hero">
        <div className="copy">
          <h1>ResQHub Pakistan</h1>

          <h2>Connect. Support. Recover.</h2>

          <p>
            A unified platform to report disasters, get help,
            and coordinate relief efforts across Pakistan.
          </p>

          <button
            className="primary big"
            onClick={toApp}
          >
            Report emergency
          </button>

          <a className="ghost btn" href="#features">
            Learn more
          </a>
        </div>

        <div className="scene">
          <Scene
            needs={needs}
            alertCities={alerts
              .filter((alert) => alert.severity !== 'info')
              .map((alert) => alert.city)}
          />
        </div>
      </header>

      <ul className="strip">
        <li>24/7 monitoring</li>
        <li>Trusted organisations</li>
        <li>Faster relief</li>
      </ul>

      <section id="features" className="wrap">
        <h2>What ResQHub does</h2>

        <div className="tiles">
          {features.map(([title, description, icon]) => (
            <Tilt
              key={title}
              className="tile feat"
            >
              <P.Icon d={icons[icon]} />

              <h3>{title}</h3>

              <span>{description}</span>
            </Tilt>
          ))}
        </div>
      </section>

      <About />
      <Contact />
    </div>
  );
}

// ---------------- NAVIGATION ----------------

const NAV = [
  ['dashboard', 'Dashboard'],
  ['report', 'Report disaster'],
  ['alerts', 'Alerts'],
  ['needs', 'Needs'],
  ['hub', 'Verified data hub'],
  ['coord', 'Relief coordination'],
  ['map', 'Disaster map']
];

const GUEST = [
  ['landing', 'Home'],
  ['about', 'About'],
  ['features', 'Features'],
  ['contact', 'Contact']
];

// ---------------- APP ----------------

export default function App() {

  // Restore user session safely
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        sessionStorage.getItem('u') || 'null'
      );
    } catch {
      sessionStorage.removeItem('u');
      return null;
    }
  });

  const [page, setPage] = useState(
    () => {
      try {
        return sessionStorage.getItem('u')
          ? 'dashboard'
          : 'landing';
      } catch {
        return 'landing';
      }
    }
  );

  const [city, setCity] = useState('');
  const [q, setQ] = useState('');
  const [mode, setMode] = useState('login');

  const [d, setD] = useState({
    alerts: [],
    needs: [],
    overview: {},
    ngos: []
  });

  // ---------------- API DATA ----------------

  const load = useCallback(async () => {
    try {
      const [alerts, needs, overview, ngos] = await Promise.all([
        api('/alerts'),
        api('/needs'),
        api('/overview'),
        api('/ngos')
      ]);

      setD({
        alerts: Array.isArray(alerts) ? alerts : [],
        needs: Array.isArray(needs) ? needs : [],
        overview: overview || {},
        ngos: Array.isArray(ngos) ? ngos : []
      });

    } catch (error) {
      console.error('Failed to load application data:', error);
    }
  }, []);

  useEffect(() => {
    load();

    const timer = setInterval(load, 30000);

    return () => clearInterval(timer);
  }, [load]);

  // Restore authentication token
  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        sessionStorage.getItem('u') || 'null'
      );

      const savedToken = sessionStorage.getItem('token');

      if (savedUser && savedToken) {
        setToken(savedToken);
      }
    } catch (error) {
      console.error('Session restore failed:', error);
    }
  }, []);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [page]);

  // ---------------- AUTH ACTIONS ----------------

  const onAuth = (token, loggedInUser) => {
    setToken(token);

    sessionStorage.setItem('token', token);
    sessionStorage.setItem('u', JSON.stringify(loggedInUser));

    setUser(loggedInUser);
    setPage('dashboard');

    load();
  };

  const logout = () => {
    setToken('');

    sessionStorage.removeItem('token');
    sessionStorage.removeItem('u');

    setUser(null);
    setPage('landing');
  };

  // ---------------- PAGE NAVIGATION ----------------

  const go = (nextPage) => {
    if (nextPage === 'auth') {
      setMode('register');
      setPage('auth');
      return;
    }

    if (user) {
      setPage(nextPage);
    } else {
      setMode('login');
      setPage('auth');
    }
  };

  const openAuth = (selectedMode) => {
    setMode(selectedMode);
    setPage('auth');
  };

  const navigate = (key) => {

    if (['about', 'features', 'contact'].includes(key)) {
      setPage('landing');

      setTimeout(() => {
        document
          .getElementById(key)
          ?.scrollIntoView({
            behavior: 'smooth'
          });
      }, 80);

      return;
    }

    if (key === 'landing') {
      setPage('landing');
      return;
    }

    if (key === 'auth') {
      openAuth('register');
      return;
    }

    go(key);
  };

  // ---------------- SEARCH FILTER ----------------

  const items = user?.role === 'admin'
    ? [...NAV, ['admin', 'Admin dashboard']]
    : NAV;

  const role = user?.role;

  const search = q.trim().toLowerCase();

  const needs = d.needs.filter((need) => {
    const text = `${need.area || ''} ${need.city || ''} ${need.type || ''}`;

    return !search || text.toLowerCase().includes(search);
  });

  const alerts = d.alerts.filter((alert) => {
    const text = `${alert.title || ''} ${alert.city || ''}`;

    return !search || text.toLowerCase().includes(search);
  });

  const inShell = !['landing', 'auth'].includes(page);

  // ---------------- PAGE CONTENT ----------------

  let view;

  if (page === 'landing') {

    view = (
      <Landing
        needs={d.needs}
        alerts={d.alerts}
        toApp={() => go('report')}
      />
    );

  } else if (page === 'auth') {

    view = (
      <Auth
        initial={mode}
        onAuth={onAuth}
        back={() => setPage(user ? 'dashboard' : 'landing')}
      />
    );

  } else {

    view = (
      <div className="shell">

        <aside className="side">
          <nav aria-label="Main navigation">

            {items.map(([key, label]) => (
              <button
                key={key}
                aria-current={page === key ? 'page' : undefined}
                onClick={() => setPage(key)}
              >
                {label}
              </button>
            ))}

          </nav>
        </aside>

        <div className="content">

          {page === 'dashboard' && (
            <P.Dashboard
              alerts={alerts}
              needs={needs}
              overview={d.overview}
              go={go}
              setCity={setCity}
            />
          )}

          {page === 'report' && (
            <P.Report refresh={load} />
          )}

          {page === 'alerts' && (
            <P.Alerts
              alerts={alerts}
              city={city}
              setCity={setCity}
            />
          )}

          {page === 'needs' && (
            <P.Needs
              needs={needs}
              go={go}
            />
          )}

          {page === 'hub' && (
            <P.Hub
              needs={needs}
              city={city}
              setCity={setCity}
              role={role}
              refresh={load}
            />
          )}

          {page === 'coord' && (
            <P.Coord
              ngos={d.ngos}
              needs={needs}
              role={role}
              refresh={load}
              go={go}
            />
          )}

          {page === 'map' && (
            <P.MapPage
              needs={needs}
              alerts={alerts}
              city={city}
              setCity={setCity}
              go={go}
            />
          )}

          {page === 'admin' && user?.role === 'admin' && (
            <P.Admin />
          )}

        </div>
      </div>
    );
  }

  // ---------------- FINAL APP LAYOUT ----------------

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <Header
        user={user}
        page={page}
        inShell={inShell}
        navItems={GUEST}
        drawerItems={user ? items : GUEST}
        onNav={navigate}
        onAuth={openAuth}
        onLogout={logout}
        q={q}
        setQ={setQ}
      />

      <div id="main">
        {view}
      </div>

      <Footer onNav={navigate} />
    </>
  );
}
