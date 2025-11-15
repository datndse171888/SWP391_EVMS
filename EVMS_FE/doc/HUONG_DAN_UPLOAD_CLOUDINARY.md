# Hướng dẫn chi tiết: Upload ảnh từ thiết bị lên Cloudinary

Tài liệu này hướng dẫn cách tích hợp tính năng upload ảnh từ thiết bị (máy tính, điện thoại) lên Cloudinary trong một ứng dụng Node.js/Express (Backend) và React (Frontend).

---

## 📋 Mục lục

1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt Backend](#cài-đặt-backend)
3. [Cấu hình Cloudinary](#cấu-hình-cloudinary)
4. [Tạo Middleware Upload](#tạo-middleware-upload)
5. [Tạo Route Upload](#tạo-route-upload)
6. [Tích hợp Frontend](#tích-hợp-frontend)
7. [Ví dụ sử dụng](#ví-dụ-sử-dụng)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Yêu cầu hệ thống

### Backend (Node.js/Express)
- Node.js >= 14.x
- Express.js
- Multer (để xử lý file upload)
- Cloudinary SDK
- Multer Storage Cloudinary (để tích hợp Multer với Cloudinary)

### Frontend (React)
- React
- Axios (hoặc fetch API)

---

## 📦 Cài đặt Backend

### Bước 1: Cài đặt các package cần thiết

```bash
cd BE  # hoặc thư mục backend của bạn
npm install cloudinary multer multer-storage-cloudinary dotenv
npm install --save-dev @types/multer  # Nếu dùng TypeScript
```

### Bước 2: Cấu trúc thư mục Backend

```
BE/
├── src/
│   ├── config/
│   │   └── cloudinary.ts        # File cấu hình Cloudinary
│   ├── middleware/
│   │   └── uploadImage.ts       # Middleware xử lý upload
│   ├── routes/
│   │   └── upload.ts            # Route API upload
│   └── index.ts                 # File chính của server
└── package.json
```

---

## ☁️ Cấu hình Cloudinary

### Bước 1: Tạo tài khoản Cloudinary

1. Truy cập https://cloudinary.com
2. Đăng ký tài khoản miễn phí (nếu chưa có)
3. Vào Dashboard và lấy thông tin:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Bước 2: Tạo file `.env` trong thư mục Backend

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

⚠️ **Lưu ý:** Không commit file `.env` lên Git! Thêm vào `.gitignore`

### Bước 3: Tạo file cấu hình Cloudinary

**File: `BE/src/config/cloudinary.ts`**

```typescript
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

**Giải thích:**
- Import `v2` từ cloudinary (phiên bản mới nhất)
- Load biến môi trường từ file `.env`
- Cấu hình Cloudinary với thông tin từ biến môi trường
- Export để sử dụng ở các file khác

---

## 🛠️ Tạo Middleware Upload

**File: `BE/src/middleware/uploadImage.ts`**

```typescript
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// Cấu hình storage cho multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: () => ({
    folder: "hopehub", // Tên folder trên Cloudinary (có thể đổi)
    allowed_formats: ["jpg", "jpeg", "png", "gif"], // Định dạng file được phép
  }),
});

// Tạo middleware upload
const upload = multer({ storage: storage });

export default upload;
```

**Giải thích:**
- `CloudinaryStorage`: Tích hợp Multer với Cloudinary
- `folder`: Tất cả ảnh upload sẽ được lưu trong folder này trên Cloudinary
- `allowed_formats`: Chỉ cho phép upload các định dạng ảnh này
- `multer({ storage })`: Tạo middleware để xử lý file upload

**Tùy chọn nâng cao:** Bạn có thể thêm validation kích thước file:

```typescript
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Giới hạn 5MB
  },
});
```

---

## 🚀 Tạo Route Upload

**File: `BE/src/routes/upload.ts`**

```typescript
import express from "express";
import upload from "../middleware/uploadImage";

const router = express.Router();

// Route upload ảnh
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Không có file nào được upload!" });
  }
  // req.file.path chứa URL của ảnh đã upload lên Cloudinary
  res.json({ imageUrl: req.file.path });
});

export default router;
```

**Giải thích:**
- `upload.single("image")`: Middleware xử lý upload 1 file với field name là "image"
- `req.file`: Chứa thông tin file đã upload (sau khi upload lên Cloudinary)
- `req.file.path`: URL của ảnh trên Cloudinary (dạng: `https://res.cloudinary.com/...`)
- Trả về JSON với `imageUrl` để Frontend sử dụng

**Lưu ý:** Field name `"image"` phải khớp với tên field trong FormData từ Frontend.

### Tích hợp vào server chính

**File: `BE/src/index.ts`** (hoặc file server chính của bạn)

```typescript
import express from "express";
import uploadRouter from "./routes/upload";

const app = express();

// ... các middleware khác (cors, express.json, ...)

// Route upload
app.use("/api/uploads", uploadRouter);

// ... các route khác
```

---

## 🎨 Tích hợp Frontend

### Cách 1: Sử dụng Fetch API (Native JavaScript)

```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    alert("Chỉ chấp nhận file ảnh.");
    return;
  }

  // Validate file size (tối đa 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert("Kích thước file không được vượt quá 5MB.");
    return;
  }

  try {
    // Tạo FormData
    const formData = new FormData();
    formData.append("image", file); // Field name phải là "image" (khớp với backend)

    // Gửi request lên server
    const response = await fetch("http://localhost:5000/api/uploads/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Nếu cần authentication
      },
      body: formData, // Không set Content-Type, browser sẽ tự set với boundary
    });

    if (!response.ok) {
      throw new Error("Upload thất bại");
    }

    const data = await response.json();
    const imageUrl = data.imageUrl; // URL từ Cloudinary

    console.log("Ảnh đã upload:", imageUrl);
    // Sử dụng imageUrl để lưu vào database hoặc hiển thị

  } catch (error) {
    console.error("Lỗi upload:", error);
    alert("Tải ảnh lên thất bại.");
  }
};
```

### Cách 2: Sử dụng Axios (Khuyến nghị)

**Tạo file helper API: `FE/src/api/upload.ts`** (hoặc thêm vào file API chính)

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Đổi URL theo server của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để tự động thêm token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadImageApi = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file); // Field name phải là "image"

  const response = await api.post("/uploads/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Quan trọng!
    },
  });

  return response.data.imageUrl; // Trả về URL từ Cloudinary
};
```

**Sử dụng trong component:**

```typescript
import { uploadImageApi } from "../api/upload";

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate
  if (!file.type.startsWith("image/")) {
    alert("Chỉ chấp nhận file ảnh.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Kích thước file không được vượt quá 5MB.");
    return;
  }

  try {
    const imageUrl = await uploadImageApi(file);
    console.log("Ảnh đã upload:", imageUrl);
    // Sử dụng imageUrl

  } catch (error) {
    console.error("Lỗi upload:", error);
    alert("Tải ảnh lên thất bại.");
  }
};
```

---

## 💡 Ví dụ sử dụng

### Ví dụ 1: Upload Avatar (Ảnh đại diện)

```typescript
import { useState, useRef } from "react";
import { uploadImageApi } from "../api/upload";

function AvatarUpload() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadImageApi(file);
      setAvatarUrl(imageUrl);
      
      // Gọi API để lưu avatarUrl vào database
      // await updateUserProfile({ photoUrl: imageUrl });
      
      alert("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      alert("Lỗi khi upload ảnh!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div onClick={handleAvatarClick} style={{ cursor: "pointer" }}>
        <img
          src={avatarUrl || "https://via.placeholder.com/150"}
          alt="Avatar"
          style={{ width: 150, height: 150, borderRadius: "50%" }}
        />
        <p>Click để đổi ảnh</p>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />
      {isUploading && <p>Đang tải ảnh lên...</p>}
    </div>
  );
}
```

### Ví dụ 2: Upload ảnh trong Form (ví dụ: form tạo blog)

```typescript
import { useState } from "react";
import { uploadImageApi } from "../api/upload";

function CreateBlogForm() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImageApi(file);
      setFormData((prev) => ({ ...prev, imageUrl }));
    } catch (error) {
      alert("Lỗi upload ảnh!");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Gửi formData (bao gồm imageUrl) lên server
    // await createBlogApi(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Tiêu đề"
        value={formData.title}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, title: e.target.value }))
        }
      />
      <textarea
        placeholder="Nội dung"
        value={formData.content}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, content: e.target.value }))
        }
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        disabled={uploading}
      />
      {uploading && <p>Đang tải ảnh...</p>}
      {formData.imageUrl && (
        <img src={formData.imageUrl} alt="Preview" style={{ maxWidth: 200 }} />
      )}
      <button type="submit">Tạo bài viết</button>
    </form>
  );
}
```

### Ví dụ 3: Upload với Preview (Xem trước ảnh trước khi upload)

```typescript
import { useState, useRef } from "react";
import { uploadImageApi } from "../api/upload";

function ImageUploadWithPreview() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Tạo preview từ file local (chưa upload)
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload lên Cloudinary
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImageApi(file);
      setImageUrl(url);
      alert("Upload thành công!");
    } catch (error) {
      alert("Upload thất bại!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <button onClick={() => fileInputRef.current?.click()}>
        Chọn ảnh
      </button>

      {preview && (
        <div>
          <p>Preview (từ file local):</p>
          <img src={preview} alt="Preview" style={{ maxWidth: 300 }} />
        </div>
      )}

      {imageUrl && (
        <div>
          <p>Ảnh đã upload (từ Cloudinary):</p>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: 300 }} />
        </div>
      )}

      {uploading && <p>Đang tải lên...</p>}
    </div>
  );
}
```

---

## 🔍 Troubleshooting

### Lỗi 1: "Cannot find module 'multer-storage-cloudinary'"

**Giải pháp:**
```bash
npm install multer-storage-cloudinary
```

### Lỗi 2: "Cloudinary config error"

**Nguyên nhân:** Thiếu hoặc sai thông tin trong file `.env`

**Giải pháp:**
- Kiểm tra file `.env` có đủ 3 biến: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Đảm bảo không có khoảng trắng thừa hoặc dấu ngoặc kép không cần thiết
- Restart server sau khi sửa `.env`

### Lỗi 3: "Cannot read property 'path' of undefined"

**Nguyên nhân:** File không được upload thành công hoặc field name không khớp

**Giải pháp:**
- Kiểm tra field name trong FormData phải là `"image"` (khớp với `upload.single("image")`)
- Kiểm tra định dạng file có trong `allowed_formats`
- Kiểm tra kích thước file không vượt quá giới hạn

### Lỗi 4: CORS Error khi upload từ Frontend

**Giải pháp:** Thêm domain của Frontend vào CORS config trong Backend:

```typescript
// BE/src/index.ts
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite
      "http://localhost:3000", // Create React App
      // Thêm domain của bạn
    ],
    credentials: true,
  })
);
```

### Lỗi 5: "Request entity too large"

**Nguyên nhân:** File quá lớn

**Giải pháp:**
- Tăng giới hạn trong multer config:
  ```typescript
  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
  });
  ```
- Hoặc validate ở Frontend trước khi upload

---

## 📝 Checklist khi áp dụng vào project mới

- [ ] Cài đặt các package: `cloudinary`, `multer`, `multer-storage-cloudinary`, `dotenv`
- [ ] Tạo tài khoản Cloudinary và lấy thông tin: Cloud Name, API Key, API Secret
- [ ] Tạo file `.env` với 3 biến môi trường Cloudinary
- [ ] Tạo file `config/cloudinary.ts` để cấu hình Cloudinary
- [ ] Tạo file `middleware/uploadImage.ts` để cấu hình multer
- [ ] Tạo file `routes/upload.ts` với route `/upload`
- [ ] Tích hợp route vào server chính (`app.use("/api/uploads", uploadRouter)`)
- [ ] Tạo API helper ở Frontend để gọi upload API
- [ ] Test upload ảnh từ Frontend
- [ ] Validate file type và size ở Frontend
- [ ] Xử lý error và loading state

---

## 🎯 Tóm tắt Flow hoạt động

```
1. User chọn file ảnh từ thiết bị
   ↓
2. Frontend tạo FormData và gửi POST request đến /api/uploads/upload
   ↓
3. Backend nhận request, middleware multer xử lý file
   ↓
4. File được upload lên Cloudinary thông qua multer-storage-cloudinary
   ↓
5. Cloudinary trả về URL của ảnh
   ↓
6. Backend trả về { imageUrl: "https://res.cloudinary.com/..." }
   ↓
7. Frontend nhận URL và sử dụng (lưu vào database, hiển thị, ...)
```

---

## 🔗 Tài liệu tham khảo

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Multer Storage Cloudinary](https://www.npmjs.com/package/multer-storage-cloudinary)

---

**Chúc bạn tích hợp thành công! 🎉**

