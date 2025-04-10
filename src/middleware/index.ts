import { NextFunction, Request, Response } from "express";
import jwt, { Jwt } from "jsonwebtoken";

export interface JwtPayload {
    userId: string;
    role: string;
}
const JWT_PASSWORD = process.env.JWT_PASSWORD || "secret1323"

export const userMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const header = req.header("authorization");
    // console.log(header);
    const token = header?.split(" ")[1];

    // console.log(token);
    if (!token) {
        res.status(403).json({
            message: "Invalid token",
        });
        return;
    }

    jwt.verify(token, JWT_PASSWORD, (err, decoded) => {
        const payload = decoded as JwtPayload;
        if (err){
            res.status(403).json({ message: "Invalid or expired token" });
            return
        }
        (req as any).userId = payload.userId;
        (req as any).role = payload.role;
        next();
    });
};
