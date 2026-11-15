import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '../api';
import Logo from '../components/Logo';

export default function Auth({ onUser, notice }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Citizen' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const update = key => event => setForm(current => ({ ...current, [key]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      if (mode === 'register') {
        const result = await api.register(form);
        if (result.pending) {
          setMessage('Your organization account has been submitted for review. Access to partner tools will be available after approval.');
          setMode('login');
        } else {
          onUser(result);
        }
      } else {
        onUser(await api.login(form.email, form.password));
      }
    } catch (reason) {
      setError(reason.message || 'We could not complete that request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <a className="auth-back" href="#/">← Back to ResQ Hub</a>
      <section className="auth-card">
        <div className="auth-heading">
          <Logo size={48} />
          <div><span className="eyebrow">ResQ Hub Pakistan</span><h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1></div>
        </div>
        <p className="auth-intro">{mode === 'login' ? 'Sign in to your ResQ Hub workspace.' : 'Join the community workspace. Administrator access is managed separately.'}</p>
        <div className="auth-tabs" role="tablist" aria-label="Account options">
          <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'selected' : ''} onClick={() => { setMode('login'); setError(''); setMessage(''); }}>Sign in</button>
          <button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'selected' : ''} onClick={() => { setMode('register'); setError(''); setMessage(''); }}>Create account</button>
        </div>
        {notice && <p className="auth-notice" role="status">{notice}</p>}
        <form onSubmit={submit}>
          {mode === 'register' && <>
            <label htmlFor="full-name">Full name</label>
            <input id="full-name" className="f" autoComplete="name" value={form.name} onChange={update('name')} required minLength={2} maxLength={100} />
            <label htmlFor="account-role">Account type</label>
            <select id="account-role" className="f" value={form.role} onChange={update('role')}>
              <option>Citizen</option><option>Volunteer</option><option>NGO</option>
            </select>
          </>}
          <label htmlFor="email">Email address</label>
          <input id="email" className="f" type="email" autoComplete="email" value={form.email} onChange={update('email')} required maxLength={254} />
          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input id="password" className="f" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={update('password')} required minLength={8} maxLength={128} />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {mode === 'register' && <p className="auth-help">Use at least 8 characters. Choose a unique password you do not use elsewhere.</p>}
          {error && <p className="err auth-feedback" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="btn auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in securely' : 'Create account'}</button>
        </form>
        <div className="auth-security"><ShieldCheck size={18} /><span>Password credentials are handled by the ResQ Hub API. Production deployments must use HTTPS.</span></div>
        <p className="auth-contact">Need help? <a href="mailto:mazisial9296@gmail.com">Contact the ResQ Hub team</a>.</p>
      </section>
    </main>
  );
}
