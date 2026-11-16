// Hyper-localized Geographic Intelligence for Lahore's Ravi River Flood-Prone Belt
// Operational boundaries, hydrologic river path, and vulnerability matrix

export const CENTER = [31.57, 74.28];

// High-resolution polyline for River Ravi traversing Lahore District from upstream (Kala Shah Kaku) to downstream (Manga Mandi)
export const RAVI = [
  [31.752, 74.298], // Upstream Syphon corridor / Kala Shah Kaku outskirts
  [31.712, 74.285], // Kala Shah Kaku riverine bend
  [31.668, 74.272], // Rana Town riverbank
  [31.635, 74.288], // Shahdara Town / Old Ravi Bridge approach
  [31.605, 74.296], // Saggian & Ravi Bridge Corridor
  [31.565, 74.262], // Babu Sabu floodplain & Bund Road junction
  [31.528, 74.238], // Mohlanwal / Thokar Niaz Baig riverfront
  [31.475, 74.205], // Chung riverine zone
  [31.435, 74.178], // Park View City riverfront belt
  [31.378, 74.135], // Shamke Bhattian river plain
  [31.312, 74.068], // Manga Mandi downstream gauge
];

// 8 Mandatory Authentic Areas along Lahore's Ravi River corridor
export const AREAS = [
  ['Shahdara & Shahdara Town', 31.621, 74.285, 'Critical Risk', 3800, 'Dense riverine residential settlement directly downstream of Ravi railway bridge.'],
  ['Rana Town', 31.642, 74.268, 'High Inundation Risk', 2100, 'Low-lying agricultural-urban fringe on the northern Ravi bank.'],
  ['Park View City (Ravi Riverfront Belt)', 31.438, 74.195, 'Moderate Surge Risk', 1850, 'Southwestern riverfront expansion zone prone to backwater inundation.'],
  ['Manga Mandi', 31.305, 74.072, 'High Vulnerability', 2900, 'Downstream convergence zone receiving prolonged river discharge.'],
  ['Saggian & Ravi Bridge Corridor', 31.595, 74.298, 'Critical Chokepoint', 4200, 'Key vehicular logistics corridor linking northern Lahore with flood relief routes.'],
  ['Chung & Mohlanwal', 31.392, 74.168, 'High Inundation Risk', 3100, 'Riparian farming and residential belt vulnerable to embankment seepage.'],
  ['Babu Sabu & Mehmood Booti', 31.562, 74.258, 'Severe Floodplain Risk', 5400, 'Critical Bund Road drainage outfall and low-elevation settlements.'],
  ['Kala Shah Kaku / Riverine Outskirts', 31.718, 74.275, 'Early Inundation Zone', 1600, 'Northern entry gateway for upstream flood surges entering Lahore district.'],
];

export const AREA_NAMES = AREAS.map(([name]) => name);

// Designated Humanitarian Shelters along the Lahore Ravi Belt
export const SHELTERS = [
  { name: 'Shahdara High Ground Shelter', lat: 31.628, lng: 74.298, capacity: 650, status: 'Active' },
  { name: 'Saggian Interchange Relief Base', lat: 31.598, lng: 74.308, capacity: 900, status: 'Active' },
  { name: 'Babu Sabu Emergency Community Center', lat: 31.558, lng: 74.268, capacity: 1100, status: 'Operational' },
  { name: 'Chung Rural Health & Evacuation Hub', lat: 31.396, lng: 74.175, capacity: 450, status: 'Standby' },
  { name: 'Manga Mandi Government Relief Camp', lat: 31.310, lng: 74.078, capacity: 800, status: 'Active' },
  { name: 'Mehmood Booti Safe Elevation Depot', lat: 31.618, lng: 74.375, capacity: 500, status: 'Operational' },
];

// Verified Relief Distribution & Logistics Points
export const RELIEF = [
  { name: 'Ravi Syphon Logistics Command', lat: 31.745, lng: 74.292, sector: 'Command & Dispatch' },
  { name: 'Shahdara Ration Distribution Post', lat: 31.618, lng: 74.288, sector: 'Food Rations & Water' },
  { name: 'Saggian Medical Aid Station', lat: 31.592, lng: 74.295, sector: 'Mobile Medical Unit' },
  { name: 'Babu Sabu Relief Staging Area', lat: 31.568, lng: 74.255, sector: 'Emergency Shelter & Tents' },
  { name: 'Mohlanwal Community Kitchen', lat: 31.405, lng: 74.172, sector: 'Cooked Meals & Water Filtration' },
];

// Hydrological Gauging Telemetry for River Ravi (Lahore Sector)
export const HYDRO_TELEMETRY = [
  { station: 'Ravi Syphon (Upstream)', normalLevelM: 4.2, currentLevelM: 6.8, warningLevelM: 6.5, dangerLevelM: 7.8, dischargeCusecs: 48500, trend: 'Rising' },
  { station: 'Shahdara Railway Bridge', normalLevelM: 3.8, currentLevelM: 5.9, warningLevelM: 5.5, dangerLevelM: 7.0, dischargeCusecs: 51200, trend: 'Rising' },
  { station: 'Saggian Corridor Gauge', normalLevelM: 3.5, currentLevelM: 5.2, warningLevelM: 5.0, dangerLevelM: 6.6, dischargeCusecs: 49800, trend: 'Stable' },
  { station: 'Balloki Barrage (Downstream)', normalLevelM: 4.0, currentLevelM: 5.7, warningLevelM: 6.0, dangerLevelM: 7.5, dischargeCusecs: 46200, trend: 'Controlled' },
];
