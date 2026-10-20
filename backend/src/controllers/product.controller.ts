import productModel from "../models/product.model.js";
import { uploadFile } from "../service/storage.service.js";
import type { Request, Response } from "express";
import mongoose from "mongoose";

export type UserRole = "user" | "seller";

export interface AuthenticatedUser {
    _id: string;
    role: UserRole;
}

export interface CustomRequest extends Request {
    user?: AuthenticatedUser;
}

// ---------------------- CREATE PRODUCT ----------------------
export async function createProduct(req: CustomRequest, res: Response) {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (user.role !== "seller") {
            return res.status(403).json({
                message: "Only sellers can create products",
            });
        }

        const { title, description, price } = req.body;

        const rawCategories = req.body.categories;
        const categories = Array.isArray(rawCategories)
            ? rawCategories
            : typeof rawCategories === "string"
            ? [rawCategories]
            : [];

        const rawSizes = req.body.sizes;
        const sizes = Array.isArray(rawSizes)
            ? rawSizes
            : rawSizes?.size
            ? [rawSizes]
            : [];

        const files = req.files as Express.Multer.File[] | undefined;

        if (!files || files.length === 0) {
            return res.status(400).json({
                message: "At least one image is required",
            });
        }

        const urls = await Promise.all(
            files.map(async (file, index) => {
                const fileName = `${new mongoose.Types.ObjectId()}-${file.originalname}`;
                const response = await uploadFile(file.buffer.toString("base64"), fileName);

                return {
                    url: response.url,
                    imagekitId: response.fileId,
                    order: String(index + 1),
                };
            })
        );

        const product = await productModel.create({
            title,
            description,
            price: {
                amount: price?.amount ?? 0,
                currency: price?.currency ?? "INR",
            },
            categories,
            sizes,
            images: urls,
            seller: user._id,
            isPublished: false,
        });

        return res.status(201).json({
            message: "Product created successfully",
            product,
        });
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
}

// ---------------------- UPDATE PRODUCT ----------------------
export async function updateProduct(req: CustomRequest, res: Response) {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (user.role !== "seller") {
            return res.status(403).json({
                message: "Only sellers can update products",
            });
        }

        const { id } = req.params;

        if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        const existingProduct = await productModel.findOne({
            _id: id,
            seller: user._id,
        });

        if (!existingProduct) {
            return res.status(404).json({
                message: "Product not found or unauthorized",
            });
        }

        const { title, description, price, categories, sizes } = req.body;
        const setFields: Record<string, unknown> = {};

        if (title !== undefined) setFields.title = title;
        if (description !== undefined) setFields.description = description;
        if (categories !== undefined) setFields.categories = categories;

        if (price?.amount !== undefined && price?.currency !== undefined) {
            setFields.price = { amount: price.amount, currency: price.currency };
        }

        if (sizes?.size !== undefined && sizes?.stock !== undefined) {
            setFields.sizes = { size: sizes.size, stock: sizes.stock };
        }

        const files = req.files as Express.Multer.File[] | undefined;

        if (existingProduct.images.length + (files?.length ?? 0) > 5) {
            return res.status(400).json({
                message: "Maximum 5 images allowed per product",
            });
        }

        let newImages: { url: string; imagekitId: string; order: string }[] = [];

        if (files && files.length > 0) {
            newImages = await Promise.all(
                files.map(async (file, index) => {
                    const fileName = `${new mongoose.Types.ObjectId()}-${file.originalname}`;
                    const response = await uploadFile(file.buffer.toString("base64"), fileName);

                    return {
                        url: response.url,
                        imagekitId: response.fileId,
                        order: String(existingProduct.images.length + index + 1),
                    };
                })
            );
        }

        if (Object.keys(setFields).length === 0 && newImages.length === 0) {
            return res.status(400).json({
                message: "No product changes provided",
            });
        }

        const updateOperations: {
            $set?: Record<string, unknown>;
            $push?: { images: { $each: typeof newImages } };
        } = {};

        if (Object.keys(setFields).length > 0) {
            updateOperations.$set = setFields;
        }

        if (newImages.length > 0) {
            updateOperations.$push = {
                images: { $each: newImages },
            };
        }

        const updatedProduct = await productModel.findOneAndUpdate(
            { _id: id, seller: user._id },
            updateOperations,
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
}

// ---------------------- DELETE PRODUCT IMAGE ----------------------
export async function deleteProduct(req: CustomRequest, res: Response) {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (user.role !== "seller") {
            return res.status(403).json({
                message: "Only sellers can delete product images",
            });
        }

        const { id, imageId } = req.params;

        if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid product ID",
            });
        }

        if (!imageId || typeof imageId !== "string" || !mongoose.Types.ObjectId.isValid(imageId)) {
            return res.status(400).json({
                message: "Invalid image ID",
            });
        }

        const product = await productModel.findOne({ _id: id, seller: user._id });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or unauthorized",
            });
        }

        const updatedProduct = await productModel.findOneAndUpdate(
            { _id: id, seller: user._id },
            {
                $pull: {
                    images: { _id: imageId },
                },
            },
            { new: true }
        );

        return res.status(200).json({
            message: "Image deleted successfully",
            product: updatedProduct,
        });
    } catch (error) {
        console.error("Error deleting product image:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
}

// ---------------------- TOGGLE PUBLISH PRODUCT ----------------------
export async function togglePublishProduct(req: CustomRequest, res: Response) {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (user.role !== "seller") {
            return res.status(403).json({
                message: "Only sellers can change product status",
            });
        }

        const { id } = req.params;

        if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Product ID is required and must be a valid MongoDB object ID",
            });
        }

        const product = await productModel.findOne({ _id: id, seller: user._id });

        if (!product) {
            return res.status(404).json({
                message: "Product not found or unauthorized",
            });
        }

        product.isPublished = !product.isPublished;
        await product.save();

        return res.status(200).json({
            message: `Product ${product.isPublished ? "published" : "unpublished"} successfully`,
            product,
        });
    } catch (error) {
        console.error("Error toggling product publish status:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
}

// ---------------------- GET PRODUCTS BY SELLER ----------------------
export async function getProductBySeller(req: CustomRequest, res: Response) {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        if (user.role !== "seller") {
            return res.status(403).json({
                message: "Only sellers can view their products",
            });
        }

        const products = await productModel.find({
            seller: user._id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Products fetched successfully",
            data: {
                products,
            },
        });
    } catch (error) {
        console.error("Error fetching seller products:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error instanceof Error ? error.message : error,
        });
    }
}
