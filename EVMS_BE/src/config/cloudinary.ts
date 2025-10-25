import { createRequire } from 'module';
import { env } from "./env.js";

const require = createRequire(import.meta.url);
const cloudinary = require("cloudinary");

console.log("🔧 Configuring Cloudinary...");
console.log("☁️ Cloud name:", env.cloudinaryCloudName);
console.log("🔑 API key:", env.cloudinaryApiKey ? "Present" : "Missing");
console.log("🔐 API secret:", env.cloudinaryApiSecret ? "Present" : "Missing");

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

console.log("✅ Cloudinary configured successfully");

export default cloudinary;