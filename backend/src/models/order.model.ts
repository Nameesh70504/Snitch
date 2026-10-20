import mongoose, { Document, Types } from "mongoose"

export interface IOrderAddress {
    state: string;
    city: string;
    street: string;
    house: string;
    zip: string;
}

export interface IOrderProductSnapshot {
    title: string;
    description: string;
    price: { amount: number; currency: string };
    image: string;
    productId: Types.ObjectId;
}

export interface IOrderItem {
    product: IOrderProductSnapshot;
    quantity: number;
    size: string;
}

export interface IOrderPrice {
    amount: number;
    currency: string;
}

export type OrderStatus = "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface IOrder extends Document {
    user: Types.ObjectId;
    address: IOrderAddress;
    products: IOrderItem[];
    totalPrice: IOrderPrice;
    status: OrderStatus;
    createdAt?: Date;
    updatedAt?: Date;
}

const orderSchema = new mongoose.Schema<IOrder>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    address: {
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        house: {
            type: String,
            required: true
        },
        zip: {
            type: String,
            required: true
        }
    },
    products: [
        {
            product: {
                title: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    required: true
                },
                price: {
                    amount: {
                        type: Number,
                        required: true
                    },
                    currency: {
                        type: String,
                        required: true
                    }
                },
                image: {
                    type: String,
                    required: true
                },
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                }
            },
            quantity: {
                type: Number,
                required: true
            },
            size: {
                type: String,
                required: true
            }
        }
    ],
    totalPrice: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        required: true,
        enum: [ "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED" ],
        default: "PLACED"
    }
}, { timestamps: true })

const orderModel = mongoose.model<IOrder>("Order", orderSchema)

export default orderModel