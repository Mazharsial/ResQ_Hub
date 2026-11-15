import { useState } from 'react';
import { api } from './api.js';

// EDIT HERE: your real contact details
const INFO = { email: 'hussnainnaz18@gmail.com', phone: '+92 328 8086451', place: 'Superior University, Lahore, Punjab', hours: 'Monday to Friday, 9am to 5pm' };

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', subject: 'General question', message: '' }), [state, setState] = useState('idle'), [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const send = async (e) => {
    e.preventDefault(); setState('sending'); setErr('');
    try { await api('/contact', 'POST', f); setState('done'); } catch (x) { setErr(x.message); setState('idle'); }
  };
  return (<div className="page">
    <div className="pghero"><div><h1>Contact us</h1><p>Questions, NGO partnerships or volunteering? Send a message and we will reply.</p></div></div>
    <section className="wrap contactgrid">
      {state === 'done'
        ? <div className="cform"><h2>Message sent</h2><p>Thank you. We will reply to {f.email}.</p><button className="primary" onClick={() => { setF({ name: '', email: '', subject: 'General question', message: '' }); setState('idle'); }}>Send another message</button></div>
        : <form className="form cform" onSubmit={send}>
          <label>Your name<input required maxLength="80" value={f.name} onChange={set('name')} autoComplete="name" /></label>
          <label>Email address<input required type="email" maxLength="120" value={f.email} onChange={set('email')} autoComplete="email" /></label>
          <label>Subject<select value={f.subject} onChange={set('subject')}><option>General question</option><option>NGO partnership</option><option>Volunteer with us</option><option>Report a problem with the site</option></select></label>
          <label>Message<textarea required rows="5" maxLength="1000" value={f.message} onChange={set('message')} /></label>
          {err && <p role="alert" className="err">{err}</p>}
          <button className="primary" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message'}</button></form>}
      <div className="cinfo">
        <div className="ccard"><h3>Email</h3><p><a href={`mailto:${INFO.email}`}>{INFO.email}</a></p></div>
        <div className="ccard"><h3>Phone</h3><p><a href={`tel:${INFO.phone.replace(/\s/g, '')}`}>{INFO.phone}</a></p><p className="muted">{INFO.hours}</p></div>
        <div className="ccard"><h3>Where we are</h3><p>{INFO.place}</p></div>
        <div className="ccard urgent"><h3>In an emergency</h3><p>Do not wait for a reply. Call Rescue <a href="tel:1122">1122</a> or Edhi <a href="tel:115">115</a>.</p></div>
      </div>
    </section>
  </div>);
}