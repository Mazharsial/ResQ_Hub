import {LayoutDashboard,FilePlus,Bell,BarChart3,Share2,Users,User,LogOut,Moon,Map as MapIc,ShieldCheck} from 'lucide-react';import {tr} from '../i18n';import Logo from './Logo';import {PublicFooter} from './PublicLayout';
const NAV=[['dashboard',LayoutDashboard,'Dashboard'],['report',FilePlus,'Report Disaster'],['alerts',Bell,'Alerts'],['needs',BarChart3,'Needs'],['relief',Share2,'Relief Coordination'],['community',Users,'Community'],['hub',ShieldCheck,'Verified Hub'],['map',MapIc,'Disaster Map'],['profile',User,'Profile']];
export default function Shell({user,route,s,set,logout,children}){const themes=['light','dark','contrast'];
 return(<div className="shell"><nav className="side" aria-label="Primary"><a href="#/app/dashboard" className="logo"><Logo size={32}/><b>ResQHub</b></a>
 {NAV.map(([k,I,l])=><a key={k} href={'#/app/'+k} className={route==='/app/'+k?'on':''} aria-current={route==='/app/'+k?'page':undefined}><I size={20}/><span>{tr(l)}</span></a>)}
 {user.role==='Admin'&&['Users','Reports','Analytics','Settings'].map(l=><a key={l} href={'#/app/admin-'+l.toLowerCase()}><Users size={20}/><span>{l}</span></a>)}
 <button onClick={logout}><LogOut size={20}/><span>{tr('Logout')}</span></button></nav>
 <div><div className="top"><input aria-label="Search" placeholder={tr("Search for areas, alerts…")}/>
 <button className="ic" onClick={()=>set({lang:s.lang==='en'?'ur':'en'})} aria-label="Switch language">{s.lang==='en'?'اردو':'EN'}</button>
 <button className="ic" onClick={()=>set({theme:themes[(themes.indexOf(s.theme)+1)%3]})} aria-label={'Theme: '+s.theme}><Moon size={18}/></button>
 <button className="ic" onClick={()=>set({motion:!s.motion})} aria-pressed={!s.motion} aria-label="Reduce motion">{s.motion?'Motion':'Calm'}</button>
 <button className="ic" aria-label="Notifications"><Bell size={18}/></button><div className="ic" style={{display:'grid',placeItems:'center'}} aria-label={user.name}>{user.name[0].toUpperCase()}</div></div>
 <main>{children}</main><PublicFooter/></div></div>)}
