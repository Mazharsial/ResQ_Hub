import {useEffect,useRef,useState} from 'react';
import {LayoutDashboard,FilePlus,Bell,BarChart3,Share2,Users,User,LogOut,Moon,Map as MapIc,ShieldCheck,Menu,X} from 'lucide-react';
import {tr} from '../i18n';
import Logo from './Logo';

const NAV=[['dashboard',LayoutDashboard,'Dashboard'],['report',FilePlus,'Report Disaster'],['alerts',Bell,'Alerts'],['needs',BarChart3,'Needs'],['relief',Share2,'Relief Coordination'],['community',Users,'Community'],['hub',ShieldCheck,'Verified Hub'],['map',MapIc,'Disaster Map'],['profile',User,'Profile']];

export default function Shell({user,route,s,set,logout,children}){
 const themes=['light','dark','contrast'];
 const [menuOpen,setMenuOpen]=useState(false);
 const menuButton=useRef(null);
 const closeMenu=()=>{setMenuOpen(false);menuButton.current?.focus()};

 useEffect(()=>{
  if(!menuOpen)return;
  const previousOverflow=document.body.style.overflow;
  const onKeyDown=e=>{if(e.key==='Escape'){setMenuOpen(false);menuButton.current?.focus()}};
  const onResize=()=>{if(window.innerWidth>800)setMenuOpen(false)};
  document.body.style.overflow='hidden';
  window.addEventListener('keydown',onKeyDown);
  window.addEventListener('resize',onResize);
  return()=>{document.body.style.overflow=previousOverflow;window.removeEventListener('keydown',onKeyDown);window.removeEventListener('resize',onResize)};
 },[menuOpen]);

 return <div className="shell">
  {menuOpen&&<button type="button" className="drawer-backdrop" aria-label="Close navigation menu" onClick={closeMenu}/>}
  <nav id="app-navigation" className={'side'+(menuOpen?' open':'')} aria-label="Primary">
   <a href="#/app/dashboard" className="logo" onClick={closeMenu}><Logo size={32}/><b>ResQHub</b></a>
   {NAV.map(([k,I,l])=><a key={k} href={'#/app/'+k} className={route==='/app/'+k?'on':''} aria-current={route==='/app/'+k?'page':undefined} onClick={closeMenu}><I size={20}/><span>{tr(l)}</span></a>)}
   {user.role==='Admin'&&['Users','Reports','Analytics','Settings'].map(l=><a key={l} href={'#/app/admin-'+l.toLowerCase()} onClick={closeMenu}><Users size={20}/><span>{l}</span></a>)}
   <button onClick={()=>{closeMenu();logout()}}><LogOut size={20}/><span>{tr('Logout')}</span></button>
  </nav>
  <div className="shell-content">
   <div className="top">
    <button ref={menuButton} type="button" className="ic mobile-menu-toggle" aria-label={menuOpen?'Close navigation menu':'Open navigation menu'} aria-expanded={menuOpen} aria-controls="app-navigation" onClick={()=>setMenuOpen(o=>!o)}>{menuOpen?<X size={20}/>:<Menu size={20}/>}</button>
    <input aria-label="Search" placeholder={tr("Search for areas, alerts…")}/>
    <div className="top-actions">
     <button className="ic" onClick={()=>set({lang:s.lang==='en'?'ur':'en'})} aria-label="Switch language">{s.lang==='en'?'اردو':'EN'}</button>
     <button className="ic" onClick={()=>set({theme:themes[(themes.indexOf(s.theme)+1)%3]})} aria-label={'Theme: '+s.theme}><Moon size={18}/></button>
     <button className="ic" onClick={()=>set({motion:!s.motion})} aria-pressed={!s.motion} aria-label="Reduce motion">{s.motion?'Motion':'Calm'}</button>
     <button className="ic" aria-label="3 notifications"><Bell size={18}/><span className="cnt">3</span></button>
     <div className="ic user-avatar" aria-label={user.name}>{user.name[0].toUpperCase()}</div>
    </div>
   </div>
   <main>{children}</main>
  </div>
 </div>
}
