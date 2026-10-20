import { validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation errors",
            errors: errors.array(),
        });
    }

    next();
};
