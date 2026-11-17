import {Mail,MessageCircle,MapPin} from 'lucide-react';import Logo from './Logo';import {CONTACT as C} from '../config';
const NAV=[['Home','/'],['About','/about'],['Features','/features'],['Contact','/contact']];
export default function Layout({children}){return(<>
 <header className="pub-h"><div className="wrap row" style={{justifyContent:'space-between',padding:'12px 20px'}}><a href="#/" className="row" style={{gap:10}}><Logo size={36}/><b>ResQHub</b></a>
 <nav className="row" aria-label="Main" style={{gap:4}}>{NAV.map(([l,h])=><a key={h} className="nl" href={'#'+h}>{l}</a>)}<a className="btn ghost" href="#/auth">Login</a><a className="btn" href="#/auth?register">Register</a></nav></div></header>
 {children}
 <footer className="foot"><div className="wrap"><div className="fg"><div><div className="row" style={{gap:10,marginBottom:12}}><Logo size={36}/><b style={{color:'#fff'}}>ResQHub</b></div><p>Connecting warnings, needs and relief. A flood alert and relief coordination platform for communities along the Ravi river in Lahore.</p></div>
 <div><h4>Platform</h4>{NAV.map(([l,h])=><div key={h}><a href={'#'+h}>{l}</a></div>)}<div><a href="#/auth">Login</a></div></div>
 <div><h4>Contact</h4><div className="row" style={{gap:8}}><MapPin size={16}/>{C.address}</div>{C.email&&<div className="row" style={{gap:8}}><Mail size={16}/><a href={'mailto:'+C.email}>{C.email}</a></div>}{C.whatsapp&&<div className="row" style={{gap:8}}><MessageCircle size={16}/><a href={'https://wa.me/'+C.whatsapp}>WhatsApp</a></div>}{C.phone&&<div><a href={'tel:'+C.phone}>{C.phone}</a></div>}<div><a href="#/contact">Send us a message</a></div></div></div>
 <p className="fn"><b>Emergency?</b> ResQ Hub supports, and does not replace, official emergency services. Call Rescue 1122 (Punjab).</p><p className="fn">© {new Date().getFullYear()} ResQHub. Built by BS Computer Science students, Lahore.</p></div></footer></>)}
