import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { Types } from "mongoose";

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export function generateTokens(userId: string | Types.ObjectId, userRole: string): TokenPair {
    const payload = { id: String(userId), role: userRole };

    const refreshToken = jwt.sign(payload, config.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });

    const accessToken = jwt.sign(payload, config.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });

    return { accessToken, refreshToken };
}

export default generateTokens;