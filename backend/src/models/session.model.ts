import mongoose, { Document, Types } from "mongoose";

export interface ISession extends Document {
    userId: Types.ObjectId;
    refreshTokenHash: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const sessionSchema = new mongoose.Schema<ISession>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        refreshTokenHash: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

const sessionModel = mongoose.model<ISession>("sessions", sessionSchema);

export default sessionModel;