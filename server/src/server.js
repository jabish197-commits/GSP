import http from "node:http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import { configureSocket } from "./config/socket.js";

const port = Number(process.env.PORT || 5000);
const server = http.createServer(app);
const configuredOrigins = [process.env.CUSTOMER_APP_URL, process.env.ADMIN_APP_URL].filter(Boolean);
const developmentOrigins = process.env.NODE_ENV === "production" ? [] : [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];
const origins = [...new Set([...configuredOrigins, ...developmentOrigins])];

const io = new Server(server, { cors: { origin: origins, credentials: true } });
configureSocket(io);

async function startApi() {
  try {
    await connectDatabase();
    server.listen(port, () => console.log(`API running on port ${port}`));
  } catch (error) {
    console.error("Unable to connect to MongoDB Atlas:", error.message);
    console.log("Retrying the database connection in 10 seconds...");
    setTimeout(startApi, 10_000);
  }
}

startApi();
