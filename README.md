# ResQ Hub Pakistan – 3D Web App
React (Vite) + Express · PostgreSQL on Vercel (JSON-file storage for local development)

## Run
1. Copy `.env.example` to `.env` and set `JWT_SECRET` to a random value of at least 32 bytes.
2. Start the API: `npm run server`.
3. In another terminal, start the frontend: `npm run dev` → http://localhost:5173.

Local development stores data in `server/data.json`. On Vercel, the API uses PostgreSQL so data persists across serverless invocations. The API creates its `resq_hub_state` table on first use.

## Deploy to Vercel
1. Import the GitHub repository into Vercel. Use the repository root as the project root, `npm run build` as the build command, and `dist` as the output directory.
2. Add a PostgreSQL integration from the Vercel Marketplace, or use a compatible hosted PostgreSQL provider. Set its connection string as `POSTGRES_URL`.
3. Set `JWT_SECRET` to a randomly generated secret with at least 32 bytes. To provision the initial administrator, also set `ADMIN_EMAIL` and an `ADMIN_PASSWORD` 16–128 characters long; `ADMIN_NAME` is optional.
4. Add those variables to every Vercel environment where the app should run, then deploy. `VITE_API_URL` can remain empty because Vercel routes `/api` to the same deployment.

Do not commit real environment files or credentials. The root `.env.example` contains placeholders only.
