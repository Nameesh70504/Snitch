// middleware/upload.ts
import multer from "multer";

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

export const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB per image
        files: 5,                  // Maximum 5 files
    },

    fileFilter: (_req, file, callback) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(
                new Error("Only JPEG, PNG, and WebP images are allowed")
            );
        }

        callback(null, true);
    },
});
