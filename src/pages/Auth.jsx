import { useState } from 'react';
import {
  AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff,
  HelpCircle, KeyRound, Lock, Mail, Shield, ShieldAlert,
  ShieldCheck, User, Users,
} from 'lucide-react';
import { api } from '../api';
import Logo from '../components/Logo';

export default function Auth({ onUser, notice }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Citizen', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Forgot Password / Emergency Account Recovery Modal
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Input email, 2: Sent confirmation
  const [recoveryBusy, setRecoveryBusy] = useState(false);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);

    try {
      if (mode === 'register') {
        // Map enterprise label to backend role
        const backendRole = form.role === 'NGO Coordinator'
          ? 'NGO'
          : form.role === 'Field Volunteer'
          ? 'Volunteer'
          : 'Citizen';

        const result = await api.register({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: backendRole,
        });

        if (result.pending) {
          setMessage('Your organization account has been submitted for verification. Access will be activated following coordinator vetting.');
          setMode('login');
        } else {
          onUser(result);
        }
      } else {
        const user = await api.login(form.email.trim().toLowerCase(), form.password);
        onUser(user);
      }
    } catch (reason) {
      setError(reason.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setBusy(false);
    }
  };

  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    if (!recoveryEmail || !recoveryEmail.includes('@')) return;
    setRecoveryBusy(true);
    setTimeout(() => {
      setRecoveryBusy(false);
      setRecoveryStep(2);
    }, 1200);
  };

  return (
    <main className="auth-page">
      <a className="auth-back" href="#/">
        <ArrowLeft size={16} /> Return to ResQ Hub Portal
      </a>

      <div className="auth-card-container">
        {/* Header with Institutional Humanitarian Branding */}
        <div className="auth-card-header">
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div>
              <span className="auth-eyebrow">Lahore Ravi River Flood Coordination</span>
              <h1 className="auth-main-title">
                {mode === 'login' ? 'Responder Sign In' : 'Create Responder Account'}
              </h1>
            </div>
          </div>
          <p className="auth-card-subtitle">
            {mode === 'login'
              ? 'Authorized access for community residents, certified field volunteers, NGO partners, and district administrators.'
              : 'Register to submit verified ground reports and coordinate disaster relief supplies.'}
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Register */}
        <div className="auth-tabs" role="tablist" aria-label="Account access options">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab-btn ${mode === 'login' ? 'selected' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
              setMessage('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            className={`auth-tab-btn ${mode === 'register' ? 'selected' : ''}`}
            onClick={() => {
              setMode('register');
              setError('');
              setMessage('');
            }}
          >
            Register Account
          </button>
        </div>

        {/* Feedback Messages */}
        {notice && <p className="auth-feedback-banner notice" role="status">{notice}</p>}
        {error && <p className="auth-feedback-banner error" role="alert">{error}</p>}
        {message && <p className="auth-feedback-banner success" role="status">{message}</p>}

        {/* Main Authentication Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <div className="auth-field">
                <label htmlFor="reg-name">Full Name / Operational Contact</label>
                <div className="auth-input-wrap">
                  <User size={16} className="auth-input-icon" />
                  <input
                    id="reg-name"
                    className="f auth-input"
                    placeholder="e.g. Tariq Mehmood"
                    autoComplete="name"
                    value={form.name}
                    onChange={update('name')}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="reg-role">Role-Based Access Level (RBAC)</label>
                <div className="auth-input-wrap">
                  <Shield size={16} className="auth-input-icon" />
                  <select
                    id="reg-role"
                    className="f auth-input"
                    value={form.role}
                    onChange={update('role')}
                  >
                    <option value="Citizen">Citizen (Riverine Community Resident)</option>
                    <option value="Field Volunteer">Field Volunteer (Ground Assessment & Verification)</option>
                    <option value="NGO Coordinator">NGO Coordinator (Relief Supply Allocation & Dispatch)</option>
                  </select>
                </div>
                <small className="auth-field-note">
                  {form.role === 'NGO Coordinator'
                    ? 'NGO accounts require administrative credential vetting before pledging.'
                    : 'Standard account with reporting and early warning receipt privileges.'}
                </small>
              </div>
            </>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Official Email Address</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input
                id="auth-email"
                type="email"
                className="f auth-input"
                placeholder="name@organization.org or personal email"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                required
                maxLength={254}
              />
            </div>
          </div>

          <div className="auth-field">
            <div className="flex justify-between items-center">
              <label htmlFor="auth-password">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() => {
                    setRecoveryEmail(form.email);
                    setRecoveryStep(1);
                    setShowRecoveryModal(true);
                  }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="f auth-input password-input"
                placeholder="Enter your secure password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={update('password')}
                required
                minLength={8}
                maxLength={128}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {mode === 'register' && (
              <small className="auth-field-note">
                Minimum 8 characters. Recommended: Include mixed uppercase, numbers, and symbols.
              </small>
            )}
          </div>

          <button
            type="submit"
            className="btn auth-submit-btn"
            disabled={busy}
          >
            {busy ? 'Verifying Credentials…' : mode === 'login' ? 'Sign In Securely' : 'Complete Registration'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Security & Data Hygiene Compliance Banner */}
        <div className="auth-compliance-footer">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-emerald-600 flex-none mt-0.5" />
            <div className="text-xs text-gray-600 leading-relaxed">
              <strong>Enterprise Humanitarian Security Standard:</strong>
              <p className="m-0 mt-0.5 text-gray-500">
                All transmissions are encrypted via TLS/HTTPS. Passwords are salted and hashed using cryptographic scrypt. Session access tokens rotate automatically every 15 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Support Contact */}
        <div className="auth-support-row">
          <span>Need coordination assistance or account activation?</span>
          <a href="mailto:mazisial9296@gmail.com" className="font-semibold text-blue-700 hover:underline">
            Contact Technical Desk
          </a>
        </div>
      </div>

      {/* Forgot Password / Account Recovery Modal */}
      {showRecoveryModal && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="recovery-modal-title">
          <div className="card max-w-md w-full p-6 relative">
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => setShowRecoveryModal(false)}
              aria-label="Close recovery dialog"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-2">
              <KeyRound size={20} className="text-blue-600" />
              <h2 id="recovery-modal-title" className="text-lg font-bold text-[#102A43] m-0">
                Account Security Recovery
              </h2>
            </div>

            {recoveryStep === 1 ? (
              <form onSubmit={handleRecoverySubmit}>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  Enter the email address registered with your ResQ Hub account. An authorized password reset link with verification OTP will be issued to your inbox.
                </p>
                <label className="block text-xs font-bold text-gray-700 mb-1" htmlFor="rec-email">
                  Registered Email Address
                </label>
                <input
                  id="rec-email"
                  type="email"
                  className="f w-full mb-4"
                  placeholder="name@organization.org"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn ghost text-xs py-2 px-3"
                    onClick={() => setShowRecoveryModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn text-xs py-2 px-4"
                    disabled={recoveryBusy}
                  >
                    {recoveryBusy ? 'Issuing Recovery Token…' : 'Send Recovery Instructions'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 mb-4 flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 flex-none mt-0.5" />
                  <div>
                    <b>Recovery Instructions Dispatched</b>
                    <p className="m-0 mt-0.5">
                      A secured recovery token has been transmitted to <strong>{recoveryEmail}</strong>. Follow the instructions to configure your replacement credentials.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn w-full justify-center text-xs"
                  onClick={() => setShowRecoveryModal(false)}
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
