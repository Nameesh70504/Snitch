import mongoose, { Document, Types } from "mongoose";

export interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
    size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
}

export interface ICart extends Document {
    user: Types.ObjectId;
    products: ICartItem[];
}

const cartSchema = new mongoose.Schema<ICart>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    products: [ {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        size: {
            type: String,
            required: true,
            enum: [ "XS", "S", "M", "L", "XL", "XXL" ]
        }
    } ]
})

const cartModel = mongoose.model<ICart>("carts", cartSchema)

export default cartModel;