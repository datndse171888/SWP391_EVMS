import express from "express";
import upload from "../middleware/uploadImage.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Upload single image with authentication
router.post("/upload", authMiddleware, upload.single("image"), (req, res) => {
  try {
    console.log("🚀 Upload endpoint called");
    console.log("👤 User:", req.user?.id);
    
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ 
        success: false,
        message: "Không có file nào được upload!" 
      });
    }

    // CloudinaryStorage returns the URL in req.file.path
    // It contains the full Cloudinary URL (usually secure HTTPS URL)
    // The file object may also have url, secure_url properties
    const fileObj = req.file as any;
    const imageUrl = fileObj.secure_url || fileObj.url || req.file.path;
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error("❌ Invalid image URL from Cloudinary:", fileObj);
      return res.status(500).json({ 
        success: false,
        message: "Không thể lấy URL ảnh từ Cloudinary" 
      });
    }
    
    console.log("✅ File uploaded successfully to Cloudinary");
    console.log("📊 File details:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: imageUrl,
      allProps: Object.keys(fileObj)
    });
    
    res.json({ 
      success: true,
      imageUrl: imageUrl 
    });
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ 
      success: false,
      message: "Lỗi khi upload ảnh: " + (error.message || "Unknown error") 
    });
  }
});

export default router;
