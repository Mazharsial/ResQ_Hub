import {lazy} from 'react';import Dashboard from './pages/Dashboard';
const L={report:lazy(()=>import('./pages/Report')),alerts:lazy(()=>import('./pages/Alerts')),hub:lazy(()=>import('./pages/Hub')),needs:lazy(()=>import('./pages/Needs')),relief:lazy(()=>import('./pages/Needs')),community:lazy(()=>import('./pages/Misc')),profile:lazy(()=>import('./pages/Misc')),map:lazy(()=>import('./pages/MapAdmin')),admin:lazy(()=>import('./pages/MapAdmin'))};
export default function AppRoutes({sub,user,s,set}){if(sub==='dashboard')return<div className="pg"><Dashboard user={user}/></div>;const k=sub.startsWith('admin')?'admin':sub;const C=L[k];
 if(!C)return<div className="card" style={{margin:24}}><h2>404</h2><a className="btn" href="#/app/dashboard">Back to dashboard</a></div>;
 if(k==='admin'&&user.role!=='Admin')return<div className="card" style={{margin:24}} role="alert">Admins only.</div>;
 return<div className="pg"><C page={k} user={user} s={s} set={set}/></div>}
