import { lazy } from 'react';
import Dashboard from './pages/Dashboard';

const pages = {
  report: lazy(() => import('./pages/Report')),
  alerts: lazy(() => import('./pages/Alerts')),
  hub: lazy(() => import('./pages/Hub')),
  needs: lazy(() => import('./pages/Needs')),
  relief: lazy(() => import('./pages/Needs')),
  community: lazy(() => import('./pages/Misc')),
  profile: lazy(() => import('./pages/Misc')),
  map: lazy(() => import('./pages/MapAdmin')),
  admin: lazy(() => import('./pages/MapAdmin')),
};

export default function AppRoutes({ sub, user, s, set }) {
  if (sub === 'dashboard') return <div className="app-content" key={sub}><Dashboard user={user} /></div>;
  const key = sub.startsWith('admin') ? 'admin' : sub;
  const Page = pages[key];
  if (!Page) return <div className="app-content" key={sub}><div className="card"><h2>Page not found</h2><a className="btn" href="#/app/dashboard">Back to dashboard</a></div></div>;
  if (key === 'admin' && user.role !== 'Admin') return <div className="app-content" key={sub}><div className="card" role="alert">Administrator access is required.</div></div>;
  return <div className="app-content" key={sub}><Page page={key} user={user} s={s} set={set} /></div>;
}
