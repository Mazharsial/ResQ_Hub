import { useEffect, useState } from 'react';
export const Logo = ({ dark }) => <span className={'logo' + (dark ? ' dark' : '')}><svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#1a56db" /><path d="M20 8 8 19h4v11h16V19h4L20 8zm0 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-5 12c0-3 2-4 5-4s5 1 5 4z" fill="#fff" /></svg><b>ResQHub<br /><small>Pakistan</small></b></span>;

// One responsive header for every screen. Desktop: inline nav. Mobile: hamburger + full-screen drawer.
export default function Header({ user, page, navItems, drawerItems, inShell, onNav, onAuth, onLogout, q, setQ }) {
  const [open, setOpen] = useState(false);
  useEffect(() => { const k = (e) => e.key === 'Escape' && setOpen(false); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  useEffect(() => setOpen(false), [page]);
  const go = (k) => { setOpen(false); onNav(k); };
  const search = <input className="hsearch" type="search" aria-label="Search areas and alerts" placeholder="Search areas, alerts…" value={q} onChange={(e) => setQ(e.target.value)} />;
  return (<header className="hdr"><div className="hdr-in">
    <button className="logo-btn" onClick={() => go(user ? 'dashboard' : 'landing')} aria-label="ResQHub Pakistan, home"><Logo /></button>
    {!inShell && <nav className="hnav" aria-label="Site">{navItems.map(([k, l]) => <button key={k} onClick={() => go(k)}>{l}</button>)}</nav>}
    {inShell && <div className="hgrow">{search}</div>}
    <div className="hact">{user ? <><span className="av" title={user.name}>{user.name[0]}</span><button className="ghost" onClick={onLogout}>Logout</button></>
      : <><button className="ghost" onClick={() => onAuth('login')}>Login</button><button className="primary" onClick={() => onAuth('register')}>Register</button></>}</div>
    <button className="burger" aria-expanded={open} aria-controls="drawer" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}><span /><span /><span /></button></div>
    {open && <div id="drawer" className="drawer" role="dialog" aria-label="Menu">
      {user && inShell && search}
      <nav aria-label="Menu">{drawerItems.map(([k, l]) => <button key={k} aria-current={page === k ? 'page' : undefined} onClick={() => go(k)}>{l}</button>)}</nav>
      <div className="dact">{user ? <button className="ghost" onClick={() => { setOpen(false); onLogout(); }}>Logout</button> : <><button className="ghost" onClick={() => onAuth('login')}>Login</button><button className="primary" onClick={() => onAuth('register')}>Register</button></>}</div></div>}
  </header>);
}