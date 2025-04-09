import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { userCreateSchema, userUpdateSchema } from "../validation/userSchema";
import { hashPassword } from "../utils";
import User, { IUser } from "../models/User";

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        if ((req as any).role !== "admin") {
            res.status(403).json({
                message: "Forbidden: admin access required",
            });
            return;
        }
        const users: IUser[] = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await User.findById({ id: req.params.id });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if ((req as any).role !== "admin" && user.id !== (req as any).userId) {
            res.status(403).json({
                message: "Forbidden: insufficient permissions",
            });
            return;
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        if ((req as any).role !== "admin") {
            res.status(403).json({
                message: "Forbidden: admin access required",
            });
            return;
        }
        const validation = userCreateSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(404).json({
                message: "Error",
            });
            return;
        }
        const { name, email, phone, password, role } = validation.data;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role,
        });
        newUser.save();

        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const validation = userUpdateSchema.safeParse(req.params.id);
    if (!validation.success) {
        res.status(404).json({
            message: "Error",
        });
        return;
    }
    const { id } = validation.data;
    try {
        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if ((req as any).role !== "admin" && user.id !== (req as any).userId) {
            res.status(403).json({
                message: "Forbidden: insufficient permissions",
            });
            return;
        }

        const { name, email, phone, password, role: newRole } = req.body;
        const hashedPassword = await hashPassword(password);
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (password) user.password = hashedPassword;
        if (newRole && (req as any).role === "admin") user.role = newRole;
        user.save();
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        if ((req as any).role !== "admin") {
            res.status(403).json({
                message: "Forbidden: admin access required",
            });
            return;
        }
        const validation = userUpdateSchema.safeParse(req.params.id);
        if (!validation.success) {
            res.status(400).json("Error Id required");
            return;
        }
        const { id } = validation.data;
        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        await user.deleteOne({ _id: id });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: (err as Error).message });
    }
};
