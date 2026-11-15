# ResQ Hub Pakistan – 3D Web App
React (Vite) + react-three-fiber · Node/Express · MongoDB (Mongoose)

## Run
1. Start MongoDB locally (or use an Atlas URI).
2. Backend:  `cd server && cp .env.example .env && npm i && npm run seed && npm run dev`
3. Frontend: `cd client && npm i && npm run dev`  → http://localhost:5173

## Partner keys (demo auth)
Enter a key from `server/.env` in "Unlock partner actions":
- VOLUNTEER_KEY – confirm reports  · NGO_KEY – confirm, pledge, mark delivered · ADMIN_KEY – also publish alerts (POST /api/alerts)
A report becomes **verified** after 2 different partner roles confirm it. Aid can only be pledged on verified needs.

## Next steps
JWT + user accounts, SMS/WhatsApp/push alerts, real GeoJSON map, geolocation, admin UI, tests, deployment.
