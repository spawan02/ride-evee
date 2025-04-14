import { z } from "zod";

export const signInSchema = z.object({
    email: z.string(),
    password: z.string(),
});

export const userSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    password: z.string(),
    role: z.enum(["user", "admin"]).optional(),
});

export const userUpdateSchema = z.object({
    id: z.string(),
});
export const otpSchema = z.object({
    email: z.string().email("should contain only email"),
});
