import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { addProductToCart, removeProductFromCart, getCart } from "../controllers/cart.controller.js";
import { addToCartValidator, removeFromCartValidator } from "../validators/cart.validator.js";

const router = express.Router();

router.get("/", authenticate, getCart);

router.post("/:productId", authenticate, addToCartValidator, addProductToCart);

router.delete("/:productId", authenticate, removeFromCartValidator, removeProductFromCart);

export default router;
