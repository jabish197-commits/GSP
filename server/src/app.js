import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import fishRoutes from "./routes/fishRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import careGuideRoutes from "./routes/careGuideRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import customerAuthRoutes from "./routes/customerAuthRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const configuredOrigins = [process.env.CUSTOMER_APP_URL, process.env.ADMIN_APP_URL].filter(Boolean);
const developmentOrigins = process.env.NODE_ENV === "production" ? [] : [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];
const allowedOrigins = [...new Set([...configuredOrigins, ...developmentOrigins])];
const privateDevelopmentOrigin = /^http:\/\/(?:localhost|127\.0\.0\.1|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})(?::\d+)?$/;

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    const allowed = !origin
      || allowedOrigins.includes(origin)
      || (process.env.NODE_ENV !== "production" && privateDevelopmentOrigin.test(origin));
    callback(allowed ? null : new Error("This website origin is not allowed by CORS."), allowed);
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }));
app.use("/api/customer-auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.use("/api/chat", rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "sj-guppy-paradise-api" });
});

app.get("/", (_request, response) => {
  response.json({
    status: "ok",
    service: "sj-guppy-paradise-api",
    health: "/api/health",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/customer-auth", customerAuthRoutes);
app.use("/api/fish", fishRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/care-guides", careGuideRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
