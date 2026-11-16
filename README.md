# ResQ Hub Pakistan (Stage 1 of 5)
Proposed platform. ALL data is SAMPLE DATA.
## Run
    npm install
    npm run dev      # open http://localhost:5173
Run frontend and API together: `npm start`. Copy `.env.example` to `.env` and set ADMIN_EMAIL and ADMIN_PASSWORD (otherwise a one-time admin password is printed on first start). Other users register in the app.
## Logo slots (swap with real files later)
- src/components/Logo.jsx  -> project compass logo (replace SVG with <img src="/logo.png">)
- src/pages/Landing.jsx `PARTNERS` array -> Superior University, British Council, CMACED, SEP, govt crest
## Stages
1 design system, shell, landing, auth, dashboard (this) | 2 report wizard, alerts, hub | 3 needs, relief, community | 4 map, admin | 5 backend, PWA, tests

## Backend (server/)
    npm run server    # http://localhost:4000, copy .env.example to .env
    npm run seed      # reset data. Registered users are stored in server/data.json (passwords hashed with scrypt).
Endpoints: POST /api/auth/{login,register,refresh}; GET /api/{alerts,needs,reports,events(SSE),users}; POST /api/{reports,pledges,alerts}; POST /api/reports/:id/moderate, /api/pledges/:id/advance, /api/users/:id/approve.
Roles, validation, rate limit (5 reports/min) and core rules (src/core.js) are enforced server-side. Storage is a JSON file; to move to SQLite/PostgreSQL replace load/save with queries (same shapes).
The React app still uses the mock src/api.js; only the live Dashboard broadcast feed uses the server when VITE_API_URL is set.
Free hosting: frontend on Vercel/Netlify (`npm run build`), API on Render/Railway free tier.
