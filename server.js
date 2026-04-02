
import express from "express";
import cors from "cors";
import "dotenv/config";
import indexRoutes from "./Routes/index.routes.js";
import connectDB from "./Config/db.js";
import { errorHandler } from "./Middleware/error.middleware.js";
import './Workers/csvWorker.js';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json()); 

app.use("/api/v1", indexRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});