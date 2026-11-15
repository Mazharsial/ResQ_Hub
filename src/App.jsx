import { lazy, Suspense, useEffect, useState } from 'react';
import AppRoutes from './Routes';
import Shell from './components/Shell';
import { api } from './api';

const Landing = lazy(() => import('./pages/Landing'));
const About = lazy(() => import('./pages/About'));
const Features = lazy(() => import('./pages/Features'));
const Auth = lazy(() => import('./pages/Auth'));

export default function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || '/');
  const [settings, setSettings] = useState(() => {
    const savedMotion = localStorage.getItem('resq-motion');
    return {
      theme: 'light',
      lang: 'en',
      low: false,
      motion: savedMotion === null ? !matchMedia('(prefers-reduced-motion: reduce)').matches : savedMotion === 'true',
    };
  });
  const [user, setUser] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [authNotice, setAuthNotice] = useState('');
  const [offline, setOffline] = useState(!navigator.onLine);
  const set = patch => setSettings(current => {
    const next = { ...current, ...patch };
    if (Object.hasOwn(patch, 'motion')) localStorage.setItem('resq-motion', String(next.motion));
    return next;
  });

  useEffect(() => {
    const updateRoute = () => setRoute(location.hash.slice(1) || '/');
    const online = () => setOffline(false);
    const offline = () => setOffline(true);
    addEventListener('hashchange', updateRoute);
    addEventListener('online', online);
    addEventListener('offline', offline);
    api.getSession()
      .then(setUser)
      .catch(() => {
        setAuthNotice('Your session could not be restored. Please sign in again.');
        if (location.hash.startsWith('#/app/')) location.hash = '/auth';
      })
      .finally(() => setSessionReady(true));
    return () => {
      removeEventListener('hashchange', updateRoute);
      removeEventListener('online', online);
      removeEventListener('offline', offline);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.lang = settings.lang;
    root.dir = settings.lang === 'ur' ? 'rtl' : 'ltr';
    root.dataset.motion = settings.motion ? 'on' : 'reduce';
    root.dataset.lowbw = settings.low ? 'on' : 'off';
  }, [settings]);

  const login = nextUser => {
    setUser(nextUser);
    setAuthNotice('');
    location.hash = '/app/dashboard';
  };
  const logout = async () => {
    try {
      await api.logout();
      setAuthNotice('');
      location.hash = '/';
    } catch {
      setAuthNotice('This device signed out, but the service could not confirm token revocation. Please try again when online.');
      location.hash = '/auth';
    } finally {
      setUser(null);
    }
  };

  let page;
  const sub = route.replace('/app/', '');
  const landingSection = route.match(/^\/section\/([a-z-]+)$/)?.[1];
  if (route === '/') page = <Landing s={settings} set={set} />;
  else if (landingSection) page = <Landing s={settings} set={set} section={landingSection} />;
  else if (route === '/about') page = <About s={settings} set={set} />;
  else if (route === '/features') page = <Features s={settings} set={set} />;
  else if (route === '/auth') page = <Auth onUser={login} notice={authNotice} />;
  else if (route.startsWith('/app/')) {
    if (!sessionReady) return <p className="loading-page" aria-busy="true">Checking your session…</p>;
    if (!user) {
      if (location.hash !== '#/auth') location.hash = '/auth';
      return null;
    }
    page = <Shell user={user} route={route} s={settings} set={set} logout={logout}>
      <AppRoutes sub={sub} user={user} s={settings} set={set} />
    </Shell>;
  } else page = <NotFound />;

  return <>{offline && <div className="off" role="status">You are offline. Live updates are unavailable.</div>}
    <Suspense fallback={<p className="loading-page" aria-busy="true">Loading ResQ Hub…</p>}>{page}</Suspense></>;
}

function NotFound() {
  return <main className="wrap not-found"><h1>Page not found</h1><p>This page may have moved or is not available.</p><a className="btn" href="#/">Return home</a></main>;
}
