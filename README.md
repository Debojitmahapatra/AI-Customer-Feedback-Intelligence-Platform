# LOOP

AI Customer-Feedback Intelligence Platform

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

Local Setup
1. Install the root dependencies:
   npm install
2. Install frontend dependencies:
   cd client
   npm install
3. Install backend dependencies:
   cd ../server
   npm install
4. Create local environment files from the example files:
   cp .env.example .env
5. Add a valid MongoDB connection string to server/.env.
Environment Variables
Server
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
ANTHROPIC_API_KEY=your_anthropic_api_key
NODE_ENV=development
Client
VITE_API_URL=http://localhost:5000/api
Running the Application
From the project root:
npm run dev
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health endpoint: http://localhost:5000/api/health