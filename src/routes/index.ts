import express from "express";

const router = express.Router();

router.get("/", (_, res) => {
    res.json({
        message: "server is healthy",
    });
});



export default router;
