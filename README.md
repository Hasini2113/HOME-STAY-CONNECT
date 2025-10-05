# Homestay Connect — Full-stack Deployable

This bundle contains a ready-to-run frontend (Vite + React + Tailwind) and a backend (Node/Express + MongoDB).
It includes authentication (bcrypt + JWT) and a simple bookings API.

## Quick start (local)
Requirements: Node 18+, npm, MongoDB running locally (or provide MONGO_URI)

1. Clone or unzip this project.
2. Start backend:
   ```bash
   cd backend
   cp .env.example .env
   # edit .env if needed
   npm install
   node server.js
   ```
3. Seed sample listings (optional):
   ```bash
   curl -X POST http://localhost:4000/api/seed
   ```
4. Start frontend:
   ```bash
   cd ../frontend
   npm install
   npx tailwindcss -i ./src/styles.css -o ./src/tailwind-output.css --watch
   npm run dev
   ```
   Alternatively with Vite + Tailwind recommended setup (see Tailwind docs).

The frontend expects the backend at `/api`. For local dev, use a proxy in Vite config or run frontend with `DEV_SERVER` proxy environment.

## Deployment suggestions
- **Frontend:** Deploy to Vercel / Netlify using standard Vite build. Set the build command `npm run build` and publish directory `dist`.
- **Backend:** Deploy to Render / Railway / Fly.io / Heroku. Set environment variables `MONGO_URI` and `JWT_SECRET`. Start command `node server.js`.
- Optionally use Docker Compose to run both services together.

## Notes
- This template uses MongoDB models. If you prefer Postgres, replace Mongoose models and use Sequelize/TypeORM or plain pg client. I can provide a Postgres version on request.
- Security: change JWT_SECRET, add rate limiting, input validation, CORS origins in production.
