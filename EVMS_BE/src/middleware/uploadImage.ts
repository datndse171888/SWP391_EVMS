import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

console.log("🔧 Setting up Cloudinary storage...");

// Cấu hình storage cho multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: () => ({
    folder: "evms", // Thay đổi tên folder nếu muốn
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  }),
});

console.log("✅ Cloudinary storage configured");

// Tạo middleware upload
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    console.log("📁 File filter called for:", file.originalname);
    console.log("📁 File mimetype:", file.mimetype);
    console.log("📁 File fieldname:", file.fieldname);
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      console.log("✅ File type allowed");
      cb(null, true);
    } else {
      console.log("❌ File type not allowed:", file.mimetype);
      cb(new Error('Chỉ chấp nhận file ảnh JPG, PNG, GIF, WEBP!') as any, false);
    }
  }
});

console.log("✅ Multer upload middleware created");

export default upload;
