import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { createProduct, deleteProduct, togglePublishProduct, updateProduct } from "../controllers/product.controller.js";
import multer from "multer";
import { createProductValidator, updateProductValidator } from "../validators/product.validate.js";
import type { Request, Response } from "express";
import type { NextFunction } from "express";
import { validateUploadedImages } from "../middleware/validateUploadedImages.js";

const upload = multer({
    storage: multer.memoryStorage(),
})

const router = express.Router()

router.post("/", authenticate, upload.array("images", 5),
    (req: Request, res: Response, next: NextFunction) => {

        console.log("req.body", req.body)
        console.log(req.body.sizes)

        if (req.body.sizes) {
            req.body.sizes = JSON.parse(req.body.sizes);

        }

        if (req.body.categories) {
            req.body.categories = JSON.parse(req.body.categories)
        }

        if (req.body.price) {
            req.body.price = JSON.parse(req.body.price)
        }
        next()
    },
    validateUploadedImages,
    
    createProductValidator,
    createProduct
)

router.patch("/update/:id", updateProductValidator, authenticate, upload.array("images", 5),
    (req: Request, res: Response, next: NextFunction) => {

        console.log("req.body", req.body)
        console.log(req.body.sizes)

        if (req.body.sizes) {
            req.body.sizes = JSON.parse(req.body.sizes)
        }

        if (req.body.categories) {
            req.body.categories = JSON.parse(req.body.categories)
        }

        if (req.body.price) {
            req.body.price = JSON.parse(req.body.price)
        }

        next();

    },
    updateProductValidator,
    updateProduct
)

router.delete("/image/:id/:imageId", authenticate, deleteProduct)

router.patch("/publish/:id", authenticate, togglePublishProduct)

export default router;