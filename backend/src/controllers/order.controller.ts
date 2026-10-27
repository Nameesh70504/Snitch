import type { Response } from "express";
import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
import productModel, { type IProductSize } from "../models/product.model.js";
import type { CustomRequest } from "../middleware/auth.middleware.js";
import mongoose from "mongoose";

interface PopulatedProduct {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    price: { amount: number; currency: string };
    images: { url: string }[];
    sizes: { size: string; stock: number }[];
    isPublished: boolean;
}

export const createOrder = async (req: CustomRequest, res: Response) => {

    try {
        
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const cart = await cartModel
            .findOne({ user: user.id })
            .populate<{ products: { product: PopulatedProduct; size: string; quantity: number }[] }>("products.product");

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }

        const unpublished = cart.products.filter((p) => !p.product?.isPublished);

        if (unpublished.length > 0) {
            return res.status(400).json({
                message: "Some products in the cart are not published yet",
            });
        }

        const sizeErrors: { product: mongoose.Types.ObjectId; message: string }[] = [];

        cart.products.forEach((p) => {
            const product = p.product;
            const productSize = p.size;
            const size = Array.isArray(product.sizes)
                ? product.sizes.find((s) => s.size === productSize)
                : null;

            if (!size) {
                sizeErrors.push({
                    product: product._id,
                    message: `Size ${productSize} is not available for this product`,
                });
                return;
            }

            if (size.stock < p.quantity) {
                sizeErrors.push({
                    product: product._id,
                    message: `Only ${size.stock} items available for size ${productSize}`,
                });
            }
        });

        if (sizeErrors.length > 0) {
            return res.status(400).json({
                message: "Some products have size or stock issues",
                errors: sizeErrors,
            });
        }

        await productModel.bulkWrite(
            cart.products.map((item) => ({
                updateOne: {
                    filter: {
                        _id: item.product._id,
                        "sizes.size": item.size as IProductSize["size"],
                    },
                    update: {
                        $inc: {
                            "sizes.$.stock": -item.quantity,
                        },
                    },
                },
            }))
        );

        const order = await orderModel.create({
            user: user.id,
            address: req.body.address,
            products: cart.products.map((item) => ({
                product: {
                    title: item.product.title,
                    description: item.product.description,
                    price: item.product.price,
                    image: item.product.images?.[0]?.url || "",
                    productId: item.product._id,
                },
                quantity: item.quantity,
                size: item.size,
            })),
            totalPrice: {
                amount: cart.products.reduce((total, item) => {
                    const price = item.product.price?.amount || 0;
                    return total + price * item.quantity;
                }, 0),
                currency: "INR",
            },
            status: "PLACED",
        });

        await cartModel.updateOne({ user: user.id }, { $set: { products: [] } });

        return res.status(201).json({
            message: "Order placed successfully",
            data: {
                order,
            },
        });
    } catch (error) {
        console.error("Create order error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getOrders = async (req: CustomRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const orders = await orderModel.find({ user: user.id }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Orders retrieved successfully",
            data: {
                orders,
            },
        });
    } catch (error) {
        console.error("Get orders error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const cancelOrder = async (req: CustomRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const id = typeof req.params.id === "string" ? req.params.id : (typeof req.params.orderid === "string" ? req.params.orderid : undefined);

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Valid order ID required" });
        }

        const order = await orderModel.findOne({ _id: id });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (String(order.user) !== user.id) {
            return res.status(403).json({
                message: "You are not authorized to cancel this order",
            });
        }

        if (["DELIVERED", "SHIPPED"].includes(order.status)) {
            return res.status(400).json({
                message: `Order cannot be cancelled as it is already ${order.status.toLowerCase()}`,
            });
        }

        order.status = "CANCELLED";
        await order.save();

        return res.status(200).json({
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        console.error("Cancel order error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateOrderStatus = async (req: CustomRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Authentication required" });
        }

        if (user.role !== "seller") {
            return res.status(403).json({
                message: "Only sellers can update order status",
            });
        }

        const { status } = req.body;
        const id = typeof req.params.orderid === "string" ? req.params.orderid : (typeof req.params.id === "string" ? req.params.id : undefined);

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Valid order ID required" });
        }

        const order = await orderModel.findById(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const validStatuses = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        if (order.status === "DELIVERED" || order.status === "CANCELLED") {
            return res.status(400).json({
                message: `Cannot change status once an order is ${order.status.toLowerCase()}`,
            });
        }

        order.status = status;
        await order.save();

        return res.status(200).json({
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.error("Update order status error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};