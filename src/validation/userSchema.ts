import { z } from "zod";
export const signUpSchema = z.object({
    name: z.string(),
    email: z.string(),
    phone: z.number(),
    password: z.string(),
    type: z.enum(["admin", "user"]),
});

export const signInSchema = z.object({
    email: z.string(),
    password: z.string(),
});


export const userCreateSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    password: z.string(),
    role: z.enum(["user", "admin"])
})

export const userUpdateSchema = z.object({
    id: z.string()
})
export const otpSchema = z.object({email: z.string().email("should contain only email")})