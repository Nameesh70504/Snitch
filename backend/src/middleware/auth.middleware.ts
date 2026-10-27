import config from "../config/config.js";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
    id: string;
    _id: string;
    role: "user" | "seller";
}

export interface CustomRequest extends Request {
    user?: AuthUser;
}

export async function authenticate(req: CustomRequest, res: Response, next: NextFunction) {
    
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.accessToken;

    if (!token) {
        return res.status(401).json({
            message: "Authentication token missing",
        });
    }

    try {
        const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET || config.JWT_SECRET) as {
            id?: string;
            _id?: string;
            role?: "user" | "seller";
        };

        const userId = decoded.id || decoded._id;

        if (!userId) {
            return res.status(401).json({
                message: "Invalid token payload",
            });
        }

        req.user = {
            id: userId,
            _id: userId,
            role: decoded.role || "user",
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
            error: error instanceof Error ? error.message : "Unauthorized",
        });
    }
}
