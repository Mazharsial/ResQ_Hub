import {lazy,Suspense,useEffect,useState} from 'react';import AppRoutes from './Routes';import Shell from './components/Shell';
const Public=lazy(()=>import('./pages/Public')),Landing=lazy(()=>import('./pages/Landing')),Auth=lazy(()=>import('./pages/Auth')),Dashboard=lazy(()=>import('./pages/Dashboard'));
const T={en:{tag:'Connect. Support. Recover.',login:'Login',report:'Report Emergency',learn:'Learn More'},ur:{tag:'جڑیں۔ مدد کریں۔ بحال ہوں۔',login:'لاگ اِن',report:'ہنگامی رپورٹ',learn:'مزید جانیں'}};
const STAGE={report:2,alerts:2,needs:3,relief:3,community:3,profile:3};
export default function App(){const [route,setRoute]=useState((location.hash.slice(1).split('?')[0]||'/'));const [s,setS]=useState({theme:'light',lang:'en',low:false,motion:!matchMedia('(prefers-reduced-motion: reduce)').matches});const [user,setUser]=useState(()=>{try{return JSON.parse(sessionStorage.getItem('u'))}catch{return null}});const [off,setOff]=useState(!navigator.onLine);
 const set=p=>setS(o=>({...o,...p}));
 useEffect(()=>{const f=()=>setRoute((location.hash.slice(1).split('?')[0]||'/'));const on=()=>setOff(false),of=()=>setOff(true);addEventListener('hashchange',f);addEventListener('online',on);addEventListener('offline',of);return()=>{removeEventListener('hashchange',f);removeEventListener('online',on);removeEventListener('offline',of)}},[]);
 useEffect(()=>{const d=document.documentElement;d.dataset.theme=s.theme;d.lang=s.lang;d.dir=s.lang==='ur'?'rtl':'ltr';d.dataset.motion=s.motion?'on':'reduce';d.dataset.lowbw=s.low?'on':'off'},[s]);
 document.documentElement.lang=s.lang;
 const login=u=>{try{sessionStorage.setItem('u',JSON.stringify(u))}catch{}setUser(u);location.hash='/app/dashboard'};const logout=()=>{try{sessionStorage.removeItem('u')}catch{}setUser(null);location.hash='/'};
 let page;const sub=route.replace('/app/','');
 if(route==='/')page=<Landing t={T[s.lang]}/>;else if(['/about','/features','/contact'].includes(route))page=<Public page={route.slice(1)}/>;else if(route==='/auth')page=<Auth onUser={login}/>;
 else if(route.startsWith('/app/')){if(!user){location.hash='/auth';return null}
  page=<Shell user={user} route={route} s={s} set={set} logout={logout}><AppRoutes sub={sub} user={user} s={s} set={set}/></Shell>}
 else page=<NotFound/>;
 return(<>{off&&<div className="off" role="status">You are offline. Showing the last loaded data.</div>}
 <Suspense fallback={<p style={{padding:24}} aria-busy="true">Loading…</p>}>{page}</Suspense><div className="badge">Pilot dataset</div></>)}
function NotFound(){return<main className="wrap" style={{textAlign:'center',padding:60}}><h1>404</h1><p>We could not find that page, but help is still close.</p><a className="btn" href="#/">Back home</a></main>}
