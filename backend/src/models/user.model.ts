import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: "user" | "seller";
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
        select: false,
    },
    role: {
        type: String,
        enum: ["user", "seller"],
        default: "user",
    },
});

const userModel = mongoose.model<IUser>("user", userSchema);

export default userModel;