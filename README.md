# Ecommerce + Chat

Standalone production-style scaffold for:

- `frontend`: React + TypeScript + Vite
- `backend`: Node.js + Express + TypeScript

This is intentionally not an npm workspace or monorepo setup. Each app has its own `package.json`, dependencies, scripts, and deployment lifecycle.

## Local Setup

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

## Deployment Shape

- Deploy `frontend` to Vercel.
- Deploy `backend` to EC2.
- Use environment variables to connect them.

The frontend should call the backend through `VITE_API_BASE_URL`.
The backend should allow the frontend through `CLIENT_URL`.
