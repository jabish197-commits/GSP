import app from "../src/app.js";
import connectDatabase from "../src/config/database.js";

export default async function handler(request, response) {
  try {
    await connectDatabase();
    return app(request, response);
  } catch (error) {
    console.error("API database connection failed:", error.message);
    return response.status(503).json({
      message: "The database is temporarily unavailable.",
    });
  }
}
