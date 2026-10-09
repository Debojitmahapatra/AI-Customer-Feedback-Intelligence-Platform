import dotenv from "dotenv";
import app from "./app.js";
import connectDatabase from "./config/db.js";

dotenv.config();

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`LOOP API running on http://localhost:${port}`);
    console.log("Client URL:", process.env.CLIENT_URL || "http://localhost:5173");
  });
};

startServer();