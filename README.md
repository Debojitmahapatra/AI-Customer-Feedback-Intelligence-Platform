# Project LOOP

Project LOOP is a multi-tenant customer-feedback intelligence platform. Teams can collect feedback, classify it with an AI provider, explore theme analytics, ask evidence-grounded questions, and generate Voice-of-Customer (VoC) reports.

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Recharts

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

## Project Structure

```text
loop/
├── client/
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       └── services/
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── services/
├── .gitignore
├── package.json
└── README.md

## Implemented features

- JWT authentication with password hashing.
- Workspace isolation and `ADMIN`, `ANALYST`, and `VIEWER` roles.
- Manual feedback creation, editing, deletion, search, filters, and pagination.
- CSV feedback import and simulated-channel ingestion.
- AI feedback classification: sentiment, score, themes, feature area, and reclassification.
- Theme summaries, trends, spike detection, date filters, and drill-down.
- Ask LOOP: workspace-scoped feedback retrieval, grounded answers, validated citations, and saved question history.
- VoC reports: backend-calculated statistics, AI narrative validation, saved reports, evidence links, and CSV export.

## Architecture

```text
React + Vite client
        |
        v
Express API with JWT/RBAC
        |
        +--> MongoDB workspace-scoped data
        |
        +--> Configured AI provider for classification, Ask LOOP, and reports
```

Every workspace-owned API query derives ownership from the authenticated JWT user. The client never provides a trusted `workspaceId`.

## Prerequisites

- Node.js 20 or later
- npm
- MongoDB database or MongoDB Atlas cluster
- At least one configured AI provider key for AI classification, Ask LOOP, and VoC report generation

## Local setup

Install dependencies from the project root:

```bash
npm install
npm install --prefix client
npm install --prefix server
```

Create the backend environment file:

```bash
# Windows PowerShell
Copy-Item server/.env.example server/.env

# macOS/Linux
cp server/.env.example server/.env
```

Create `client/.env` manually:

```env
VITE_API_URL=http://localhost:5000/api
```

Start both applications from the root:

```bash
npm run dev
```

- Client: `http://localhost:5173`
- API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Environment variables

### Backend: `server/.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=use_a_long_random_secret
JWT_EXPIRES_IN=7d

# Select one: anthropic, gemini, groq, openrouter, top-tools-ai
AI_PROVIDER=gemini

ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=
GROQ_API_KEY=
GROQ_MODEL=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
TOP_TOOLS_AI_API_KEY=
TOP_TOOLS_AI_MODEL=
```

Only configure credentials for the chosen provider. Never commit `.env` files or use `VITE_` variables for backend secrets.

### Frontend: `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

For production, point `VITE_API_URL` at the deployed backend API, for example:

```env
VITE_API_URL=https://your-api.example.com/api
```

## Available API areas

| Area | Base path |
| --- | --- |
| Health | `GET /api/health` |
| Authentication | `/api/auth` |
| Workspace and members | `/api/workspace` |
| Feedback and ingestion | `/api/feedback` |
| Theme analytics | `/api/themes` |
| Ask LOOP | `/api/ask` |
| VoC reports | `/api/reports` |

Important report endpoints:

```text
POST /api/reports/generate
GET  /api/reports
GET  /api/reports/:reportId
GET  /api/reports/:reportId/export
```

## Validation commands

```bash
# Production frontend build
npm run build

# Client lint
npm run lint --prefix client

# Start backend in production mode
npm run start
```

There is currently no automated unit or integration test suite. Core workflows should be verified manually with test workspaces and non-sensitive demo feedback.

## Deployment notes

The project is not deployed by this repository alone. A typical deployment requires:

1. Host the React client as a static Vite build.
2. Host the Express server with Node.js support.
3. Configure MongoDB Atlas or another reachable MongoDB deployment.
4. Set backend `CLIENT_URL` to the exact deployed frontend origin.
5. Set frontend `VITE_API_URL` at build time to the deployed backend API URL.
6. Configure the selected AI provider keys only on the backend host.
7. Verify `/api/health`, login, feedback creation, theme analytics, Ask LOOP, reports, and CSV export after deployment.

The client includes a Netlify-compatible SPA redirect file at `client/public/_redirects`. No hosting account, live URL, or production deployment is included here.

## Suggested demo flow

1. Register or log in to a demonstration workspace.
2. Create feedback or import a prepared CSV.
3. Open a feedback detail and show its AI classification.
4. Open Themes to show trends and a drill-down.
5. Ask LOOP a question supported by the feedback, then open a citation.
6. Generate or open a VoC report and show its evidence-based findings.
7. Export the report as CSV.
8. Explain workspace isolation and Viewer read-only access for report generation.

## Known limitations

- AI functionality depends on the configured provider, available API quota, and provider availability.
- There is no automated test suite yet; role and cross-workspace checks require manual verification.
- The project has no verified live deployment yet.
- The frontend build completes with a bundle-size advisory warning; route-level code splitting can be considered later.
- `client/.env.example` should be populated before sharing the project with other developers.

## Security notes

- API keys and JWT secrets belong only in backend environment variables.
- Feedback, Ask LOOP retrieval, reports, and exports are scoped to the authenticated workspace.
- AI output is validated with Zod before it is persisted or displayed as report/Ask LOOP structured data.
- AI-generated evidence IDs are filtered against retrieved feedback before use.
- CSV export escapes cells to reduce spreadsheet formula-injection risk.
