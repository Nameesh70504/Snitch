import express from "express"
import { loginValidator, registerValidator } from "../validators/auth.validate.js";
import { login, logout, refresh, register } from "../controllers/auth.controller.js";

const router = express.Router()

router.post("/register", registerValidator, register);

router.post("/login", loginValidator, login)

router.post("/logout", logout)

router.post("/refresh", refresh)

export default router