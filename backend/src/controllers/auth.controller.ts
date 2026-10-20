import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import config from "../config/config.js";
import generateTokens from "../utils/auth.utils.js";
import type { CustomRequest } from "../middleware/auth.middleware.js";

export async function register(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name,
            email,
            passwordHash,
            role: "user",
        });

        const tokens = generateTokens(user._id, user.role);

        await sessionModel.create({
            userId: user._id,
            refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: "User registered successfully",
            token: tokens.accessToken,
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({
            message: "Internal server error during registration",
        });
    }
}

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select("+passwordHash");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const tokens = generateTokens(user._id, user.role);

        await sessionModel.create({
            userId: user._id,
            refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10),
        });

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Logged in successfully",
            token: tokens.accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Internal server error during login",
        });
    }
}

export async function refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token missing",
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET) as {
            id?: string;
            role?: string;
        };

        const userId = decoded.id;

        if (!userId) {
            return res.status(401).json({
                message: "Invalid token payload",
            });
        }

        const session = await sessionModel.findOne({ userId });

        if (!session) {
            return res.status(401).json({
                message: "Session expired or invalid",
            });
        }

        const isRefreshTokenValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);

        if (!isRefreshTokenValid) {
            await sessionModel.deleteMany({ userId });
            return res.status(401).json({
                message: "Invalid refresh token",
            });
        }

        const user = await userModel.findById(userId);
        const tokens = generateTokens(userId, user?.role || "user");

        await sessionModel.findOneAndUpdate(
            { userId },
            { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 10) },
            { upsert: true }
        );

        res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Token refreshed successfully",
            token: tokens.accessToken,
        });
    } catch (err) {
        console.error("Refresh error:", err);
        return res.status(401).json({
            message: "Invalid or expired refresh token",
        });
    }
}

export async function logout(req: Request, res: Response) {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            try {
                const decoded = jwt.decode(refreshToken) as { id?: string } | null;
                if (decoded?.id) {
                    await sessionModel.deleteMany({ userId: decoded.id });
                }
            } catch {
                // Ignore decoding errors on logout
            }
        }

        res.clearCookie("refreshToken");
        return res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({
            message: "Error during logout",
        });
    }
}