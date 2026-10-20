import dotenv from "dotenv"
dotenv.config();
function requireVariable(key: string): string {

    const value = process.env[key];

    if (!value) {
        throw new Error(`Environment variable ${key} is required`);
    }

    return value;
}

const config = {
    MONGO_URI: requireVariable("MONGO_URI"),
    JWT_SECRET: requireVariable("JWT_SECRET"),
    REFRESH_TOKEN_SECRET: requireVariable("REFRESH_TOKEN_SECRET"),
    ACCESS_TOKEN_SECRET: requireVariable("ACCESS_TOKEN_SECRET"),
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY || process.env.IMAGEKIT_PUBLICK_KEY || "",
    IMAGEKIT_PRIVATE_KEY: requireVariable("IMAGEKIT_PRIVATE_KEY"),
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT || "",
    RAZORPAY_KEY_ID: requireVariable("RAZORPAY_KEY_ID"),
    RAZORPAY_KEY_SECRET: requireVariable("RAZORPAY_KEY_SECRET"),
};

export default Object.freeze(config);