import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Droplets, HandHeart, HeartPulse, Home, RefreshCw, ShieldCheck, Truck, Utensils } from 'lucide-react';
import { api } from '../api';
import { can, remaining } from '../core.js';

const INITIAL_BASELINE_NEEDS = [
  {
    id: 'ND-101',
    cat: 'Clean Drinking Water Rations',
    needed: 12500,
    delivered: 4300,
    priority: 92,
    area: 'Babu Sabu & Mehmood Booti',
  },
  {
    id: 'ND-102',
    cat: '14-Day Emergency Dry Food Rations',
    needed: 2400,
    delivered: 1100,
    priority: 88,
    area: 'Shahdara & Shahdara Town',
  },
  {
    id: 'ND-103',
    cat: 'Weatherproof Family Tarpaulins & Tents',
    needed: 850,
    delivered: 320,
    priority: 85,
    area: 'Rana Town',
  },
  {
    id: 'ND-104',
    cat: 'Essential Medical Aid & ORS Packs',
    needed: 1600,
    delivered: 750,
    priority: 95,
    area: 'Saggian & Ravi Bridge Corridor',
  },
  {
    id: 'ND-105',
    cat: 'Water Purification Chlorine Tablets',
    needed: 3500,
    delivered: 1800,
    priority: 78,
    area: 'Chung & Mohlanwal',
  },
  {
    id: 'ND-106',
    cat: 'Family Hygiene & Sanitation Kits',
    needed: 1200,
    delivered: 450,
    priority: 74,
    area: 'Manga Mandi',
  },
];

export default function Needs({ page, user }) {
  const [needs, setNeeds] = useState(INITIAL_BASELINE_NEEDS);
  const [pledges, setPledges] = useState([]);
  const [needId, setNeedId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      const [nextNeeds, nextPledges] = await Promise.all([api.needs(), api.pledges()]);
      if (Array.isArray(nextNeeds) && nextNeeds.length > 0) {
        setNeeds(nextNeeds);
        setNeedId((current) => current || nextNeeds[0]?.id || '');
      } else {
        setNeeds(INITIAL_BASELINE_NEEDS);
        setNeedId((current) => current || INITIAL_BASELINE_NEEDS[0]?.id || '');
      }
      if (Array.isArray(nextPledges)) setPledges(nextPledges);
    } catch {
      setNeeds(INITIAL_BASELINE_NEEDS);
      setNeedId(INITIAL_BASELINE_NEEDS[0].id);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const needSummary = useMemo(() => needs.map((need) => ({
    ...need,
    remaining: remaining(need, pledges),
  })), [needs, pledges]);

  const submitPledge = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const result = await api.createPledge(user, needId, amount);
      if (!result.ok) throw new Error(result.error || 'The pledge could not be recorded.');
      setMessage('Your relief commitment has been registered in the operations ledger.');
      setAmount('');
      await refresh();
    } catch (reason) {
      setError(reason.message || 'The pledge could not be recorded.');
    } finally {
      setBusy(false);
    }
  };

  const advance = async (pledgeId) => {
    setError('');
    try {
      await api.advancePledge(user, pledgeId);
      await refresh();
    } catch (reason) {
      setError(reason.message || 'Delivery status could not be updated.');
    }
  };

  const getCategoryIcon = (cat = '') => {
    const lower = cat.toLowerCase();
    if (lower.includes('water')) return <Droplets size={18} className="text-cyan-500" />;
    if (lower.includes('food') || lower.includes('ration')) return <Utensils size={18} className="text-amber-500" />;
    if (lower.includes('tent') || lower.includes('shelter')) return <Home size={18} className="text-emerald-500" />;
    return <HeartPulse size={18} className="text-rose-500" />;
  };

  return (
    <div className="needs-page">
      <header className="app-page-heading">
        <div>
          <span className="eyebrow">{page === 'needs' ? 'Community Command Matrix' : 'Vetted Partner Portal'}</span>
          <h1>{page === 'needs' ? 'Centralized Relief Needs Hub' : 'Relief Allocation & Dispatch'}</h1>
          <p>Real-time supply gap analysis across Lahore’s Ravi River flood-affected settlements.</p>
        </div>
      </header>

      {error && <div className="dashboard-error" role="alert">{error}</div>}
      {message && <p className="auth-success" role="status">{message}</p>}

      {page === 'needs' ? (
        <>
          <div className="needs-grid">
            {needSummary.map((need) => {
              const committed = Math.max(0, need.needed - (need.delivered || 0) - need.remaining);
              const progress = need.needed ? Math.min(100, (((need.delivered || 0) + committed) / need.needed) * 100) : 0;
              return (
                <article className="need-card" key={need.id}>
                  <div className="need-card-heading">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(need.cat)}
                      <h2 className="text-sm font-bold text-[#102A43] m-0">{need.cat}</h2>
                    </div>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800">
                      Priority {need.priority || 75}
                    </span>
                  </div>

                  {need.area && <p className="need-area">{need.area}</p>}

                  <div className="my-3">
                    <div className="flex items-baseline justify-between">
                      <b className="text-xl font-extrabold text-[#102A43]">
                        {need.remaining.toLocaleString()}
                      </b>
                      <span className="text-xs text-gray-500">
                        of {need.needed.toLocaleString()} needed
                      </span>
                    </div>

                    <div className="bar mt-2">
                      <i style={{ width: `${progress}%`, background: 'var(--primary)' }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>{committed.toLocaleString()} committed</span>
                    <span className="text-emerald-700 font-semibold">{(need.delivered || 0).toLocaleString()} delivered</span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="help-panel">
            <div>
              <span className="eyebrow text-blue-200">Relief Allocation</span>
              <h2>Pledge humanitarian supplies through a verified NGO account.</h2>
              <p>Direct resource commitment is protected by strict anti-overpledge algorithmic limits.</p>
            </div>
            <a className="btn bg-white text-[#102A43] hover:bg-gray-100" href="#/app/relief">
              Access Partner Dispatch <Truck size={17} />
            </a>
          </div>
        </>
      ) : (
        <>
          <div className="needs-overview-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">Relief Dispatch Protocol</span>
                <h2>Humanitarian Partner Commitments</h2>
              </div>
              <RefreshCw size={19} className="text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mb-0">
              Approved relief organizations can commit supplies against active shortages along the Ravi River. Pledges are tracked through Committed → Dispatched → Delivered status.
            </p>
          </div>

          {can(user.role, 'pledge') && (
            <form className="pledge-form" onSubmit={submitPledge}>
              <h2>Register Humanitarian Relief Commitment</h2>
              <div className="space-y-3 mt-3">
                <label>
                  Verified Sector Need
                  <select
                    className="f"
                    value={needId}
                    onChange={(event) => setNeedId(event.target.value)}
                    required
                  >
                    {needSummary.map((need) => (
                      <option key={need.id} value={need.id}>
                        {need.cat} ({need.area}) — {need.remaining.toLocaleString()} remaining deficit
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Commitment Quantity
                  <input
                    className="f"
                    type="number"
                    min="1"
                    placeholder="Enter units to pledge (e.g. 200)"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    required
                  />
                </label>

                <button className="btn" disabled={busy || !needId}>
                  {busy ? 'Registering Commitment…' : 'Record Official NGO Commitment'}
                </button>
              </div>
            </form>
          )}

          <section className="pledges-panel mt-6">
            <h2 className="text-base font-bold text-[#102A43] mb-3">
              Active Logistics Timeline &amp; Dispatches
            </h2>
            {pledges.length === 0 ? (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-500">
                Active relief dispatches will appear here upon registration. Use the commitment form above to pledge supplies.
              </div>
            ) : (
              pledges.map((pledge) => (
                <article className="pledge-row" key={pledge.id}>
                  <div>
                    <b>Pledge {pledge.id} — Need Ref: {pledge.needId}</b>
                    <p className="text-xs text-gray-600 mt-1">
                      {Number(pledge.amount).toLocaleString()} Units · Status: <span className="font-bold text-blue-700">{pledge.status}</span>
                    </p>
                  </div>
                  {can(user.role, 'delivery') && ['Committed', 'Dispatched'].includes(pledge.status) && (
                    <button className="btn ghost text-xs py-1.5 px-3" onClick={() => advance(pledge.id)}>
                      Advance Status → {pledge.status === 'Committed' ? 'Mark Dispatched' : 'Confirm Delivery'}
                    </button>
                  )}
                </article>
              ))
            )}
          </section>
        </>
      )}
    </div>
  );
}
