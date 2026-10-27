import type { Response } from "express";
import productModel from "../models/product.model.js";
import cartModel from "../models/cart.model.js";
import type { CustomRequest } from "../middleware/auth.middleware.js";


export const addProductToCart = async (req: CustomRequest, res: Response) => {

    try {

        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { productId } = req.params;

        const { size: productSize, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const size = product.sizes?.find((s) => s.size === productSize);

        if (!size) {
            return res.status(400).json({ message: "Invalid size for this product" });
        }

        const qty = Number(quantity) || 1;

        if (qty > size.stock) {
            return res.status(400).json({
                message: `Insufficient stock. Available: ${size.stock}`,
            });
        }

        let cart = await cartModel.findOne({ user: user.id });

        if (!cart) {
            cart = await cartModel.create({ user: user.id, products: [] });
        }

        const productInCart = cart.products.find(
            (p) => String(p.product) === String(productId) && p.size === productSize
        );

        if (productInCart) {
            const totalQuantity = productInCart.quantity + qty;

            if (totalQuantity > size.stock) {
                return res.status(400).json({
                    message: `Insufficient stock. Available: ${size.stock}`,
                });
            }

            await cartModel.findOneAndUpdate(
                { user: user.id },
                { $set: { "products.$[elem].quantity": totalQuantity } },
                {
                    arrayFilters: [
                        { "elem.product": productId, "elem.size": productSize },
                    ],
                }
            );
        } else {
            await cartModel.findOneAndUpdate(
                { user: user.id },
                {
                    $push: {
                        products: {
                            product: productId,
                            size: productSize,
                            quantity: qty,
                        },
                    },
                }
            );
        }

        return res.status(200).json({
            message: "Product added to cart successfully",
        });
        
    } catch (error) {
        console.error("Add to cart error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const removeProductFromCart = async (req: CustomRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const { productId } = req.params;
        const { size: productSize, quantity } = req.body;

        const cart = await cartModel.findOne({ user: user.id });

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const productInCart = cart.products.find(
            (p) => String(p.product) === String(productId) && p.size === productSize
        );

        if (!productInCart) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        const removeQty = Number(quantity) || 1;

        if (productInCart.quantity <= removeQty) {
            await cartModel.findOneAndUpdate(
                { user: user.id },
                {
                    $pull: {
                        products: {
                            product: productId,
                            size: productSize,
                        },
                    },
                }
            );
        } else {
            const newQuantity = productInCart.quantity - removeQty;

            await cartModel.findOneAndUpdate(
                { user: user.id },
                { $set: { "products.$[elem].quantity": newQuantity } },
                {
                    arrayFilters: [
                        { "elem.product": productId, "elem.size": productSize },
                    ],
                }
            );
        }

        return res.status(200).json({
            message: "Product removed from cart successfully",
        });
    } catch (error) {
        console.error("Remove from cart error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getCart = async (req: CustomRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        let cart = await cartModel
            .findOne({ user: user.id })
            .populate("products.product");

        if (!cart) {
            cart = await cartModel.create({ user: user.id, products: [] });
        }

        const totalPrice = cart.products.reduce((total, item) => {
            const product = item.product as unknown as { price?: { amount?: number } };
            const amount = product?.price?.amount || 0;
            return total + amount * item.quantity;
        }, 0);

        return res.status(200).json({
            message: "Cart retrieved successfully",
            data: {
                cart,
                totalPrice,
            },
        });
    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
