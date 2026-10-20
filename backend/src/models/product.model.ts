import mongoose, { Document, Types } from "mongoose";

export interface IProductImage {
    imagekitId: string;
    url: string;
    order: string;
}

export interface IProductSize {
    size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
    stock: number;
}

export interface IProductPrice {
    amount: number;
    currency: "INR" | "USD" | "EUR" | "CAD";
}

export interface IProduct extends Document {
    title: string;
    description: string;
    price: IProductPrice;
    categories: string[];
    images: IProductImage[];
    sizes: IProductSize[];
    seller: Types.ObjectId;
    isPublished: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const productSchema = new mongoose.Schema<IProduct>(
    {
        title: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 100,
        },
        description: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 1000,
        },
        price: {
            amount: {
                type: Number,
                required: true,
                min: 0,
            },
            currency: {
                type: String,
                required: true,
                enum: ["INR", "USD", "EUR", "CAD"],
            },
        },
        categories: [
            {
                type: String,
                required: true,
            },
        ],
        images: [
            {
                imagekitId: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
                order: {
                    type: String,
                    required: true,
                },
            },
        ],
        sizes: [
            {
                size: {
                    type: String,
                    required: true,
                    enum: ["XS", "S", "M", "L", "XL", "XXL"],
                },
                stock: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        isPublished: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const productModel = mongoose.model<IProduct>("products", productSchema);

export default productModel;