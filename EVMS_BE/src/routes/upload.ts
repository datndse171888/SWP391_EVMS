import express from "express";
import upload from "../middleware/uploadImage.js";

const router = express.Router();

router.post("/upload", upload.single("image"), (req, res) => {
  console.log("🚀 Upload endpoint called");
  console.log("📁 Request body:", req.body);
  console.log("📁 Request file:", req.file);
  console.log("🔑 Authorization header:", req.headers.authorization);
  console.log("🌐 Request headers:", req.headers);
  console.log("📋 Content-Type:", req.headers['content-type']);
  
  if (!req.file) {
    console.log("❌ No file uploaded");
    return res.status(400).json({ message: "Không có file nào được upload!" });
  }

  console.log("✅ File uploaded successfully:", req.file.path);
  console.log("📊 File details:", {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    encoding: req.file.encoding,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path
  });
  
  res.json({ imageUrl: req.file.path });
});

export default router;
