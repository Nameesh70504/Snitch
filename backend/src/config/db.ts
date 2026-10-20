import mongoose from "mongoose"
import config from "./config.js"

export async function connectToDB() {
    await mongoose.connect(config.MONGO_URI).then(() => { console.log("db connected successfully") })
        .catch(() => { console.log("db not connected") })
}