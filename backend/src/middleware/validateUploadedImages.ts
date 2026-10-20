// middleware/validateUploadedImages.ts
import type {
    Request,
    Response,
    NextFunction,
} from "express";

export function validateUploadedImages(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
        return res.status(400).json({
            message: "At least one image is required",
        });
    }

    next();
}