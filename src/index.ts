import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
const PORT = 3000;

app.use(cors());
dotenv.config();
app.use(express.json());
app.use("/", router);

mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
