import { NextFunction, Request, Response } from "express";
import jwt, { Jwt } from "jsonwebtoken";

const JWT_PASSWORD = process.env.JWT_PASSWORD || "password";

export interface JwtPayload {
    userId: string;
    role: string;
}
  
export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
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

        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            const payload = decoded as JwtPayload
            if (err)
              return res.status(403).json({ message: 'Invalid or expired token' });
            (req as any).userId = payload.userId;
            (req as any).role = payload.role
            next()
})
    
};
