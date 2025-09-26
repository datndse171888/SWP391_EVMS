import mongoose from "mongoose";
import { env } from "./env.js";
export async function connectDB() {
    const uri = env.mongoUri;
    if (!uri) {
        throw new Error("Thiếu biến môi trường MONGODB_URI");
    }
    await mongoose.connect(uri, { dbName: env.dbName });
    console.log("Đã kết nối MongoDB");
}
export async function disconnectDB() {
    await mongoose.connection.close();
    console.log("Đã đóng kết nối MongoDB");
}
