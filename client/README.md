# ResQHub Pakistan – 3D web app (React + Node + MongoDB)
## Run
1. MongoDB running locally (or Atlas URI in `server/.env`)
2. `cd server && cp .env.example .env` (set a long JWT_SECRET) `&& npm i && npm run seed && npm run dev`
3. `cd client && npm i && npm run dev` → http://localhost:5173
Seeded admin: admin@resqhub.pk / Admin@12345 (change it!)
## Roles
Anyone can register as citizen. Volunteer/NGO signups wait for admin approval (Admin dashboard → Partner approvals).
Volunteer/NGO confirm reports (2 confirmations = Verified) · NGO pledges aid & marks delivered · Admin sees stats and approves partners.
## Not built yet
Google/Microsoft login, photo upload, Community & Profile pages, Relief Centers/Shelters data, SMS/WhatsApp/push alerts, real Pakistan GeoJSON, tests.
