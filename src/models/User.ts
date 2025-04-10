import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: "user" | "admin";
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
});

export default model<IUser>("User", UserSchema);
