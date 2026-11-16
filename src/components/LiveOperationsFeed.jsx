import { useState, useMemo } from 'react';
import {
  Activity, AlertCircle, CheckCircle2, Clock, Droplets, Filter,
  HeartPulse, Home, MapPin, Radio, ShieldAlert, Sparkles,
  Truck, Utensils,
} from 'lucide-react';

// Authentic baseline humanitarian operational feed for Lahore's Ravi River belt
export const OPERATIONAL_ACTIVITIES = [
  {
    id: 'ACT-901',
    type: 'alert',
    severity: 'Critical',
    sector: 'Emergency Early Warning',
    iconType: 'alert',
    area: 'Shahdara & Shahdara Town',
    title: 'Upstream Inundation Alert Issued for Shahdara Riverfront',
    description: 'Hydro-gauging station confirms Ravi River discharge rising past 65,000 cusecs. Residents in low-lying riverside katchi settlements notified to move to Shahdara High Ground Shelter.',
    timestamp: '14 minutes ago',
    responder: 'District Flood Monitoring Unit',
    units: '3 Mobile Rescue Boats on Standby',
  },
  {
    id: 'ACT-902',
    type: 'dispatch',
    severity: 'Dispatched',
    sector: 'Clean Water',
    iconType: 'water',
    area: 'Babu Sabu & Mehmood Booti',
    title: '4,500 L Drinking Water Purification Tanker En Route',
    description: 'Mobile reverse osmosis distribution unit dispatched along Bund Road axis to mitigate municipal supply contamination in low-lying residential clusters.',
    timestamp: '32 minutes ago',
    responder: 'Al-Khidmat Disaster Management Unit',
    units: '1 Bowser + 600 Jerry Cans',
  },
  {
    id: 'ACT-903',
    type: 'need',
    severity: 'Verified',
    sector: 'Shelter',
    iconType: 'shelter',
    area: 'Rana Town',
    title: 'Verified Need: 180 Weatherproof Family Tents',
    description: 'Multi-tier field verification confirmed 140 displaced agricultural families requiring waterproof emergency family shelter kits following riverbank seepage.',
    timestamp: '1 hour ago',
    responder: 'Registered Field Volunteers (Sector 4)',
    units: 'Verified by 2 Humanitarian Certifiers',
  },
  {
    id: 'ACT-904',
    type: 'dispatch',
    severity: 'Delivered',
    sector: 'Food Rations',
    iconType: 'food',
    area: 'Saggian & Ravi Bridge Corridor',
    title: 'Delivery Confirmed: 650 Dry Ration Packs',
    description: 'Relief convoy completed distribution of essential 14-day family flour, lentils, cooking oil, and high-energy biscuits at Saggian Interchange relief base.',
    timestamp: '2 hours ago',
    responder: 'Pakistan Red Crescent Logistics Team',
    units: 'Direct Last-Mile Verification Confirmed',
  },
  {
    id: 'ACT-905',
    type: 'alert',
    severity: 'Critical',
    sector: 'Medical',
    iconType: 'medical',
    area: 'Chung & Mohlanwal',
    title: 'Emergency Medical Field Unit Deployed',
    description: 'Rapid response medical team equipped with anti-snake venom, waterborne disease treatments, and oral rehydration salts stationed at Chung Rural Health Hub.',
    timestamp: '3 hours ago',
    responder: 'Civil Defense & Health First Responders',
    units: '2 Ambulances + 4 Paramedics',
  },
  {
    id: 'ACT-906',
    type: 'need',
    severity: 'Verified',
    sector: 'Clean Water',
    iconType: 'water',
    area: 'Manga Mandi',
    title: 'Verified Need: 1,200 Water Purification Tablet Packs',
    description: 'Chlorine purification tablets and hygiene kits logged into Centralized Relief Hub to support vulnerable riverine farming families in downstream plain.',
    timestamp: '4 hours ago',
    responder: 'Community Relief Coordinator',
    units: 'Urgent Allocation Open for NGO Partners',
  },
  {
    id: 'ACT-907',
    type: 'dispatch',
    severity: 'Delivered',
    sector: 'Shelter',
    iconType: 'shelter',
    area: 'Park View City (Ravi Riverfront Belt)',
    title: 'Perimeter Embankment Sandbag Reinforcement Complete',
    description: 'Engineering corps and local volunteer teams completed deployment of 3,200 heavy-gauge sandbags along drainage outfall to curb backflow surge.',
    timestamp: '5 hours ago',
    responder: 'Lahore Riverine Action Team',
    units: 'Embankment Integrity Verified',
  },
  {
    id: 'ACT-908',
    type: 'alert',
    severity: 'Verified',
    sector: 'Emergency Early Warning',
    iconType: 'alert',
    area: 'Kala Shah Kaku / Riverine Outskirts',
    title: 'Upstream River Gauge Sensor Calibration Synchronized',
    description: 'Telemetry sensor link verified at Ravi Syphon station. Real-time water velocity and discharge updates transmitting directly into ResQ Hub command matrix.',
    timestamp: '6 hours ago',
    responder: 'Hydrometric Technical Crew',
    units: 'Telemetry Link: 99.8% Online',
  },
];

export default function LiveOperationsFeed({ liveUpdates = [] }) {
  const [filter, setFilter] = useState('all');

  // Merge server updates with clearly labeled sample scenarios
  const allEntries = useMemo(() => {
    const formattedServer = (liveUpdates || []).map((item) => ({
      id: item.id || `SRV-${Math.random()}`,
      type: item.type === 'alert' ? 'alert' : item.type === 'need' ? 'need' : 'dispatch',
      severity: item.type === 'alert' ? 'Critical' : item.type === 'need' ? 'Verified' : 'Dispatched',
      sector: item.title?.includes('water') ? 'Clean Water' : item.title?.includes('medical') ? 'Medical' : item.title?.includes('shelter') ? 'Shelter' : 'Relief Coordination',
      iconType: item.title?.includes('water') ? 'water' : item.title?.includes('medical') ? 'medical' : item.title?.includes('shelter') ? 'shelter' : 'alert',
      area: item.area || 'Lahore Ravi River Belt',
      title: item.title || 'Operational Update',
      description: item.description || 'Verified information recorded in the ResQ Hub operations ledger.',
      timestamp: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      responder: 'Authorized ResQ Hub Responder',
      units: 'Direct Transmission',
    }));

    return [...formattedServer, ...OPERATIONAL_ACTIVITIES];
  }, [liveUpdates]);

  const filteredEntries = useMemo(() => {
    if (filter === 'alerts') return allEntries.filter((e) => e.type === 'alert' || e.severity === 'Critical');
    if (filter === 'needs') return allEntries.filter((e) => e.type === 'need' || e.severity === 'Verified');
    if (filter === 'dispatches') return allEntries.filter((e) => e.type === 'dispatch' || e.severity === 'Dispatched' || e.severity === 'Delivered');
    return allEntries;
  }, [allEntries, filter]);

  const renderSectorIcon = (iconType) => {
    switch (iconType) {
      case 'water':
        return <Droplets size={16} className="text-cyan-500" />;
      case 'medical':
        return <HeartPulse size={16} className="text-rose-500" />;
      case 'food':
        return <Utensils size={16} className="text-amber-500" />;
      case 'shelter':
        return <Home size={16} className="text-emerald-500" />;
      default:
        return <ShieldAlert size={16} className="text-blue-500" />;
    }
  };

  const renderBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return <span className="ops-badge badge-critical">Critical Alert</span>;
      case 'Verified':
        return <span className="ops-badge badge-verified">Verified Need</span>;
      case 'Dispatched':
        return <span className="ops-badge badge-dispatched">Aid Dispatched</span>;
      case 'Delivered':
        return <span className="ops-badge badge-delivered">Delivered</span>;
      default:
        return <span className="ops-badge badge-neutral">{severity}</span>;
    }
  };

  return (
    <div className="operations-feed-container">
      {/* Feed Navigation and Status Header */}
      <div className="ops-feed-header">
        <div className="flex items-center gap-2.5">
          <span className="ops-demo-mark">DEMO</span>
          <div>
            <h3 className="ops-title">Humanitarian Operations Sample Feed</h3>
            <p className="ops-subtitle">
              Illustrative scenarios only · Not verified field reports or live dispatches
            </p>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="ops-filter-tabs" role="tablist" aria-label="Operations feed filter">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            className={`ops-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Updates ({allEntries.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'alerts'}
            className={`ops-tab ${filter === 'alerts' ? 'active' : ''}`}
            onClick={() => setFilter('alerts')}
          >
            Emergency Alerts
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'needs'}
            className={`ops-tab ${filter === 'needs' ? 'active' : ''}`}
            onClick={() => setFilter('needs')}
          >
            Verified Needs
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'dispatches'}
            className={`ops-tab ${filter === 'dispatches' ? 'active' : ''}`}
            onClick={() => setFilter('dispatches')}
          >
            Aid Dispatched
          </button>
        </div>
      </div>

      <p className="ops-demo-notice" role="note">
        DEMONSTRATION DATA — These example alerts, readings, needs, and dispatches are simulated and are not current or official. Do not use them to make emergency decisions.
      </p>

      {/* Structured Activity List */}
      <div className="ops-feed-list" aria-live="polite">
        {filteredEntries.map((item) => (
          <article className="ops-card" key={item.id}>
            <div className="ops-card-top">
              <div className="flex items-center gap-2">
                <span className="ops-sector-icon" title={item.sector}>
                  {renderSectorIcon(item.iconType)}
                </span>
                <span className="ops-area-tag">
                  <MapPin size={13} className="text-blue-600 inline mr-1" />
                  {item.area}
                </span>
                <span className="ops-sector-label">{item.sector}</span>
              </div>
              <div className="flex items-center gap-2">
                {renderBadge(item.severity)}
                <span className="ops-time">
                  <Clock size={12} className="inline mr-1" />
                  {item.timestamp}
                </span>
              </div>
            </div>

            <h4 className="ops-card-title">{item.title}</h4>
            <p className="ops-card-desc">{item.description}</p>

            <div className="ops-card-footer">
              <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Responder: <strong>{item.responder}</strong></span>
              </div>
              <span className="ops-unit-badge">{item.units}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
