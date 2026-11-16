import { useState, useEffect } from 'react';
import {
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2,
  Clock, FileText, MapPin, Navigation, ShieldCheck,
  Upload, Users,
} from 'lucide-react';
import LiveMap from '../components/LiveMap';
import { AREA_NAMES, AREAS, submitReport } from '../api';

const PIPELINE_STAGES = [
  'Incident Intake Logged',
  'Spatial Duplicate Screening (500m / 1h)',
  'Ground Volunteer Spot-Check',
  'Approved for Centralized Relief Command Hub',
];

export default function Report({ user }) {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState({ lat: 31.621, lng: 74.285 }); // Default Shahdara
  const [form, setForm] = useState({
    type: 'Flood',
    desc: '',
    people: '',
    area: AREA_NAMES[0],
    vul: [],
    priorityNeed: 'Clean Drinking Water',
  });
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [busy, setBusy] = useState(false);

  // Automatically update pin coordinates when user selects an authentic area
  const handleAreaChange = (newArea) => {
    const matched = AREAS.find(([name]) => name === newArea);
    if (matched) {
      setPin({ lat: matched[1], lng: matched[2] });
    }
    setForm({ ...form, area: newArea });
  };

  const handleGps = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device. Please select an area or tap the map.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPin({ lat: Number(pos.coords.latitude.toFixed(4)), lng: Number(pos.coords.longitude.toFixed(4)) });
        setError('');
      },
      () => setError('GPS signal unavailable. You can tap the map directly to place the coordinate pin.'),
    );
  };

  const handleSend = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await submitReport(user, { ...form, pin });
      setResult(res);
      setStep(4);
    } catch (err) {
      setError(err.message || 'The report could not be submitted. Check network connection.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!result) return;
    const max = result.status === 'Verified' ? 3 : 2;
    const interval = setInterval(() => {
      setPipelineProgress((v) => (v < max ? v + 1 : v));
    }, 1100);
    return () => clearInterval(interval);
  }, [result]);

  const toggleVulnerable = (v) => {
    setForm({
      ...form,
      vul: form.vul.includes(v) ? form.vul.filter((x) => x !== v) : [...form.vul, v],
    });
  };

  return (
    <div className="report-page">
      <header className="app-page-heading">
        <div>
          <span className="eyebrow">Citizen &amp; Volunteer Field Intake</span>
          <h1>Submit Ground Flood Report</h1>
          <p>Provide structured incident details along Lahore’s Ravi River corridor for multi-tier verification.</p>
        </div>
      </header>

      {/* Wizard Progress Indicator */}
      <div className="report-step-indicator" aria-live="polite">
        <span className="text-xs font-bold text-gray-500">Step {Math.min(step, 3)} of 3:</span>
        <strong className="text-sm text-[#102A43]">
          {step === 1 && '1. Riverfront Location & Coordinates'}
          {step === 2 && '2. Inundation Severity & Vulnerabilities'}
          {step === 3 && '3. Review & Verification Submission'}
          {step === 4 && '4. Live Verification Pipeline'}
        </strong>
      </div>

      {error && <div className="dashboard-error" role="alert">{error}</div>}

      <div className="card report-wizard-card">
        {/* STEP 1: Map Coordinates & Area Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-sm font-bold text-[#102A43] m-0">1. Mark Riverfront Coordinate Location</h2>
              <span className="text-xs text-gray-500">Tap map or use device GPS</span>
            </div>

            <LiveMap
              height={320}
              onPick={(ll) => setPin({ lat: Number(ll.lat.toFixed(4)), lng: Number(ll.lng.toFixed(4)) })}
              markers={pin ? [{ lat: pin.lat, lng: pin.lng, label: `${form.area} Incident Pin` }] : []}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ravi River Pilot Sector</label>
                <select
                  className="f m-0"
                  value={form.area}
                  onChange={(e) => handleAreaChange(e.target.value)}
                >
                  {AREA_NAMES.map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button type="button" className="btn ghost flex-1 text-xs" onClick={handleGps}>
                  <Navigation size={14} /> Snap to My GPS
                </button>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 flex items-center justify-between">
              <span>Selected Coordinates: <strong>{pin.lat}° N, {pin.lng}° E</strong></span>
              <span className="text-emerald-700 font-semibold">Location Set</span>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                className="btn"
                disabled={!pin}
                onClick={() => setStep(2)}
              >
                Proceed to Details <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Inundation Details & Vulnerabilities */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-sm font-bold text-[#102A43] m-0">2. Inundation Details &amp; Affected Population</h2>
              <span className="text-xs text-gray-500">Demographic Profile</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Incident Category</label>
                <select
                  className="f"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="Flood">River Ravi Bank Inundation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Immediate Priority Need</label>
                <select
                  className="f"
                  value={form.priorityNeed}
                  onChange={(e) => setForm({ ...form, priorityNeed: e.target.value })}
                >
                  <option value="Clean Drinking Water">Clean Drinking Water Rations</option>
                  <option value="Food Rations">Dry Food Supply Packs</option>
                  <option value="Shelter">Family Weatherproof Tents</option>
                  <option value="Medical">Anti-Venom &amp; Medical First Aid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Estimated Affected People</label>
              <input
                className="f"
                type="number"
                min="1"
                placeholder="Number of persons impacted (e.g. 45)"
                value={form.people}
                onChange={(e) => setForm({ ...form, people: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Field Observation / Ground Notes</label>
              <textarea
                className="f"
                rows="3"
                maxLength="500"
                placeholder="Describe water depth, access road blockage, or stranded family status..."
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
              />
            </div>

            <fieldset className="border border-gray-200 rounded-xl p-3">
              <legend className="text-xs font-bold text-gray-700 px-1">Vulnerable Demographics Present</legend>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {['Infants / Children', 'Elderly Persons', 'Persons with Disabilities', 'Pregnant / Nursing Women'].map((v) => (
                  <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.vul.includes(v)}
                      onChange={() => toggleVulnerable(v)}
                    />
                    <span>{v}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500">
              <strong>Humanitarian Privacy Standard:</strong> Do not enter national identity numbers (CNIC) or private mobile numbers into public notes.
            </div>

            <div className="flex justify-between pt-3 border-t border-gray-100">
              <button type="button" className="btn ghost" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Back to Location
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  if (form.desc.trim().length < 5) {
                    setError('Please provide a brief field observation note (minimum 5 characters).');
                  } else {
                    setError('');
                    setStep(3);
                  }
                }}
              >
                Review Report <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review and Submit */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="text-sm font-bold text-[#102A43] m-0">3. Verify Ground Incident Summary</h2>
              <span className="text-xs text-emerald-700 font-semibold">Ready for Submission</span>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs text-gray-700">
              <div className="flex justify-between pb-1.5 border-b border-gray-200">
                <span className="text-gray-500">Target River Sector:</span>
                <b>{form.area}</b>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-gray-200">
                <span className="text-gray-500">Coordinates:</span>
                <b>{pin.lat}° N, {pin.lng}° E</b>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-gray-200">
                <span className="text-gray-500">Estimated People Impacted:</span>
                <b>{form.people || 'Unspecified'} Individuals</b>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-gray-200">
                <span className="text-gray-500">Immediate Supply Need:</span>
                <b>{form.priorityNeed}</b>
              </div>
              <div className="pt-1">
                <span className="text-gray-500 block mb-1">Field Observation:</span>
                <p className="m-0 bg-white p-2.5 rounded-lg border border-gray-200">{form.desc}</p>
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-gray-100">
              <button type="button" className="btn ghost" onClick={() => setStep(2)}>
                <ArrowLeft size={16} /> Edit Details
              </button>
              <button
                type="button"
                className="btn"
                disabled={busy}
                onClick={handleSend}
              >
                {busy ? 'Transmitting Incident…' : 'Submit for Multi-Tier Verification'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Live Verification Pipeline Telemetry */}
        {step === 4 && result && (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 flex-none mt-0.5" />
              <div>
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Incident Formally Registered
                </span>
                <h3 className="text-base font-extrabold text-[#102A43] m-0 mt-0.5">
                  Tracking Identifier: {result.id}
                </h3>
                <p className="text-xs text-gray-600 m-0 mt-1">
                  Your ground report for <strong>{form.area}</strong> has been logged into the ResQ Hub review engine.
                </p>
              </div>
            </div>

            {/* Pipeline Visual Stepper */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
              <span className="text-xs font-bold text-gray-700 block">Live Verification Pipeline Status:</span>
              <div className="space-y-2">
                {PIPELINE_STAGES.map((stLabel, idx) => {
                  const isDone = idx <= pipelineProgress;
                  return (
                    <div
                      key={stLabel}
                      className={`flex items-center gap-2.5 text-xs p-2 rounded-lg transition-colors ${
                        isDone ? 'bg-white border border-emerald-200 text-emerald-900 font-semibold' : 'text-gray-400 opacity-60'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-emerald-600 flex-none" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-gray-300 inline-block flex-none" />
                      )}
                      <span>{stLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <a className="btn ghost text-xs" href="#/app/dashboard">
                Return to Dashboard
              </a>
              <button
                type="button"
                className="btn text-xs"
                onClick={() => {
                  setStep(1);
                  setResult(null);
                  setPipelineProgress(0);
                  setForm({ ...form, desc: '', people: '' });
                }}
              >
                Submit Another Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
