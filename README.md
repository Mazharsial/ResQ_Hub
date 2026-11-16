# ResQ Hub — Flood Alert, Community Data Collection & Relief Coordination Web Application

> **Main Punchline:** *"From Chaos to Coordination, From Need to Relief."*
> **Supporting Tagline:** *"Connecting Communities. Coordinating Relief. Building Resilience."*

**ResQ Hub** is a centralized disaster management and relief coordination web application designed specifically for **Lahore District, Punjab, Pakistan**, with an acute focus on the high-risk flood-prone settlements along the **Ravi River corridor**.

Developed for university final-year evaluation and civic-tech exhibition, ResQ Hub bridges the critical communication gap between vulnerable riverine communities, volunteer rescue teams, humanitarian NGOs, and district disaster management authorities.

---

## 1. United Nations Sustainable Development Goals (UN SDGs)
ResQ Hub directly targets three UN SDGs:
* **SDG 3: Good Health and Well-Being:** Timely early warning evacuations, prevention of water-borne epidemics, and localized medical supply routing.
* **SDG 10: Reduced Inequalities:** Accessible, multilingual alerts (Urdu/English) with speech synthesis, high-contrast modes, and prioritized assistance for persons with disabilities (PWDs), women, children, and elderly citizens.
* **SDG 11: Sustainable Cities and Communities:** Urban flood resilience along Lahore's Ravi River meander through real-time gap analysis and structured relief logistics.

---

## 2. Hyper-Localized Geographic Scope: Lahore Ravi River Corridor
ResQ Hub operates strictly within **Lahore District** across 8 vulnerable flood sectors:
1. **Shahdara & Shahdara Town** (`31.6215°N, 74.2829°E`) — High vulnerability river bend; primary residential cluster.
2. **Rana Town** (`31.6580°N, 74.2610°E`) — Critical riverine agriculture and low-income settlement.
3. **Park View City (Ravi Riverfront Belt)** (`31.4390°N, 74.1920°E`) — Low-lying river embankment edge.
4. **Manga Mandi** (`31.3120°N, 74.0710°E`) — Southern agricultural basin susceptible to severe backwater pooling.
5. **Saggian & Ravi Bridge Corridor** (`31.5950°N, 74.2980°E`) — Crucial vehicular supply corridor and bridge checkpoint.
6. **Chung & Mohlanwal** (`31.3980°N, 74.1750°E`) — High displacement risk zone along river spill channels.
7. **Babu Sabu & Mehmood Booti** (`31.5420°N, 74.2670°E`) — Urban drainage bottleneck and industrial perimeter.
8. **Kala Shah Kaku / Riverine Outskirts** (`31.7190°N, 74.2630°E`) — Upstream surge entry point into Lahore District.

---

## 3. End-to-End 7-Stage Relief Architecture
ResQ Hub implements the end-to-end humanitarian workflow:
```
[Stage 1: Early Warning Alerts]
       │ (SMS / Audio / Push Alerts to Vulnerable Citizens)
       ▼
[Stage 2: Community Distress Intake]
       │ (Citizens submit geo-tagged incident reports with demographic breakdowns)
       ▼
[Stage 3: Volunteer Field Verification]
       │ (On-ground volunteers conduct physical checks and submit verification dossiers)
       ▼
[Stage 4: 4-Tier Verification Engine]
       │ (Reported ➔ Under Verification ➔ Verified ➔ Rejected; spatial duplicate deduplication)
       ▼
[Stage 5: Centralized Relief Command Hub]
       │ (Real-time tracking: Required vs. Committed vs. Delivered supplies)
       ▼
[Stage 6: NGO Resource Allocation Portal]
       │ (Verified NGOs pledge resources with anti-overpledge safeguards)
       ▼
[Stage 7: Last-Mile Delivery & Community Feedback]
         (Audit trail tracking dispatches, field confirmation, and delivery telemetry)
```

---

## 4. Key Architectural Features

### A. 3D Perspective River Topography & 4D Temporal Flood Simulator
* **Interactive 3D Terrain View:** Real-time canvas simulation of the Ravi River meander through Lahore, complete with orbital yaw/pitch control.
* **4D Temporal Stepper (T-00h to T+48h):** Move through time to observe river discharge swell from nominal (21,500 cusecs) to peak flood surge (84,200 cusecs), visually expanding water spill polygons across vulnerable sectors.

### B. Interactive 3D Card Tilts
* Cards across the landing page and dashboards utilize perspective depth transformation (`transform: perspective(1000px) rotateX(...) rotateY(...)`) responsive to cursor and touch position, with automatic motion reduction for accessibility (`prefers-reduced-motion`).

### C. Real-Time Humanitarian Operations Feed
* Live operational stream featuring filter tabs (`All Updates`, `Emergency Alerts`, `Verified Needs`, `Aid Dispatched`), sector badges, and real-time activity tracking.

### D. Multi-Tier Verification Engine & Anti-Overpledge Algorithm
* Reports are categorized into a 4-state pipeline: `Reported`, `Under Verification`, `Verified`, `Rejected`.
* Dual-source independent confirmation prevents false alarms.
* NGO pledging safeguards strictly prevent cumulative commitments from exceeding verified demand (`tryPledge()`).

### E. Accessible Early Warning System
* Audio text-to-speech synthesis in both English and Urdu.
* High-contrast mode and large-typography toggles for low-vision and non-literate community members.

---

## 5. Technology Stack
* **Frontend:** React 18 (Vite 5), React Router DOM, Lucide Icons, Leaflet (OpenStreetMap tile layer).
* **Backend:** Node.js, Express, JSON Web Tokens (JWT), `node:crypto` (`scryptSync` salted hashing), `pg` (PostgreSQL client).
* **Styling:** Custom CSS Design System enforcing institutional deep navy (`#102A43`), humanitarian cyan (`#1769AA`, `#258BCB`), emerald verification (`#15966B`), and warning amber (`#D97706`).
* **Deployment:** Vercel Serverless Functions (`/api/*`) + Vercel PostgreSQL persistence, with seamless local JSON-file fallback (`server/data.json`).

---

## 6. Getting Started (Local Development)

### Prerequisites
* Node.js v18+ (tested on Node v20/v24)
* npm v9+

### Installation
1. Clone the repository and navigate to the project root:
   ```bash
   cd resq-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   A sample `.env.example` is provided. Copy it to `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure `JWT_SECRET` contains a secure string of at least 32 characters.

4. Run unit test suite:
   ```bash
   npm test
   ```
   *Verifies 10 core algorithmic tests: multi-source verification, duplicate detection, over-pledge prevention, and role access control.*

5. Start the backend API:
   ```bash
   npm run server
   ```
   *API will start on `http://localhost:4000`.*

6. In a separate terminal, start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will launch on `http://localhost:5173`.*

7. Build for production:
   ```bash
   npm run build
   ```

---

## 7. Role-Based Access Control (RBAC) & Accounts

The app does not ship with public demo accounts. Users can register as a Citizen, Volunteer, or NGO from the `/auth` page. To provision the initial administrator, configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the server environment; use a unique, strong password and never commit real credentials.

---

## 8. Deployment to Vercel (Production)

1. Connect the GitHub repository to **Vercel**.
2. Settings:
   * **Framework Preset:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
3. Environment Variables in Vercel Project Settings:
   * `JWT_SECRET`: Random string (min 32 characters).
   * `POSTGRES_URL`: Connection string from Vercel Postgres or Supabase / Neon.
4. Vercel automatically routes:
   * `/api/*` to `api/index.js` (Express backend serverless adapter).
   * All other routes to `dist/index.html` (Single Page Application).

---

## 9. Direct Contact & Rescue Coordination

* **Project Facilitator & Team Lead:** Mazhar Ali (`mazisial9296@gmail.com`)
* **Emergency Coordination Hotline:** `+92 304 433 5771`
* **District Flood Emergency:** Dial **Rescue 1122**
