import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import cors from "cors";
import mongoose from "mongoose";
import { setupSwaggerDocs } from "./swagger/swagger";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
dotenv.config();
app.use(express.json());
app.use("/api", router);

setupSwaggerDocs(app);
mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Swagger documentation is available at http://localhost:${PORT}/docs`);
  });
