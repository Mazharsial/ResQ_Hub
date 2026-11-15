import { useEffect, useMemo, useState } from 'react';
import { HandHeart, RefreshCw, Truck } from 'lucide-react';
import { api } from '../api';
import { can, remaining } from '../core.js';

export default function Needs({ page, user }) {
  const [needs, setNeeds] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [needId, setNeedId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const [nextNeeds, nextPledges] = await Promise.all([api.needs(), api.pledges()]);
    setNeeds(nextNeeds);
    setPledges(nextPledges);
    setNeedId(current => current || nextNeeds[0]?.id || '');
  };
  useEffect(() => {
    refresh().catch(reason => setError(reason.message || 'Needs information could not be loaded.'));
  }, []);

  const needSummary = useMemo(() => needs.map(need => ({
    ...need,
    remaining: remaining(need, pledges),
  })), [needs, pledges]);

  const submitPledge = async event => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      const result = await api.createPledge(user, needId, amount);
      if (!result.ok) throw new Error(result.error || 'The pledge could not be recorded.');
      setMessage('Your commitment has been recorded.');
      setAmount('');
      await refresh();
    } catch (reason) {
      setError(reason.message || 'The pledge could not be recorded.');
    } finally {
      setBusy(false);
    }
  };

  const advance = async pledgeId => {
    setError('');
    try {
      await api.advancePledge(user, pledgeId);
      await refresh();
    } catch (reason) {
      setError(reason.message || 'Delivery status could not be updated.');
    }
  };

  return <div className="needs-page">
    <header className="app-page-heading"><div><span className="eyebrow">{page === 'needs' ? 'Community overview' : 'Partner workspace'}</span><h1>{page === 'needs' ? 'Needs dashboard' : 'Relief coordination'}</h1><p>Current information published to the ResQ Hub service.</p></div></header>
    {error && <div className="dashboard-error" role="alert">{error}</div>}
    {page === 'needs' ? <>
      {!needSummary.length ? <div className="empty-panel"><span><HandHeart size={22} /></span><h2>No verified needs have been published</h2><p>Verified requests will appear here after they are reviewed and added by an authorized coordinator.</p></div> :
        <div className="needs-grid">{needSummary.map(need => {
          const committed = Math.max(0, need.needed - (need.delivered || 0) - need.remaining);
          const progress = need.needed ? Math.min(100, ((committed + (need.delivered || 0)) / need.needed) * 100) : 0;
          return <article className="need-card" key={need.id}><div className="need-card-heading"><h2>{need.cat}</h2><span>{need.priority ? `Priority ${need.priority}` : 'Open request'}</span></div>
            {need.area && <p className="need-area">{need.area}</p>}
            <p>{need.remaining.toLocaleString()} remaining</p><div className="bar"><i style={{ width: `${progress}%`, background: 'var(--primary)' }} /></div>
            <small>{committed.toLocaleString()} committed · {(need.delivered || 0).toLocaleString()} delivered</small>
          </article>;
        })}</div>}
      <div className="help-panel"><div><span className="eyebrow">Take part</span><h2>Offer support through a verified partner account.</h2><p>Relief commitments are limited to approved NGO accounts.</p></div><a className="btn" href="#/auth">Partner sign in <Truck size={17} /></a></div>
    </> : <>
      <div className="needs-overview-panel"><div className="panel-heading"><div><span className="eyebrow">Response network</span><h2>Needs and partner commitments</h2></div><RefreshCw size={19} /></div>
        <p>As reports and verified needs are published, this workspace shows commitments and their delivery status.</p>
        {!pledges.length && <div className="compact-empty">No partner commitments have been recorded.</div>}
      </div>
      {can(user.role, 'pledge') && <form className="pledge-form" onSubmit={submitPledge}>
        <h2>Record a relief commitment</h2>
        {!needSummary.length ? <p>There are no verified needs to pledge against.</p> : <>
          <label>Verified need<select className="f" value={needId} onChange={event => setNeedId(event.target.value)} required>{needSummary.map(need => <option key={need.id} value={need.id}>{need.cat} · {need.remaining.toLocaleString()} remaining</option>)}</select></label>
          <label>Commitment amount<input className="f" type="number" min="1" value={amount} onChange={event => setAmount(event.target.value)} required /></label>
          <button className="btn" disabled={busy || !needId}>{busy ? 'Recording…' : 'Record commitment'}</button>
        </>}
        {message && <p className="auth-success" role="status">{message}</p>}
      </form>}
      {!!pledges.length && <section className="pledges-panel"><h2>Commitment and delivery timeline</h2>{pledges.map(pledge => <article className="pledge-row" key={pledge.id}>
        <div><b>{pledge.needId}</b><p>{Number(pledge.amount).toLocaleString()} · {pledge.status}</p></div>
        {can(user.role, 'delivery') && ['Committed', 'Dispatched'].includes(pledge.status) && <button className="btn ghost" onClick={() => advance(pledge.id)}>Advance status</button>}
      </article>)}</section>}
    </>}
  </div>;
}
