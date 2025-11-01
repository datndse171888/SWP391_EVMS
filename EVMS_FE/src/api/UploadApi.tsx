import { api } from '../utils/Axios';

/**
 * Compress and resize image before upload
 * Optimized for fast upload by reducing file size significantly
 * @param file - Original image file
 * @param maxWidth - Maximum width (default: 800 for avatar, 1920 for others)
 * @param maxHeight - Maximum height (default: 800 for avatar, 1920 for others)
 * @param quality - Image quality 0-1 (default: 0.7 for better compression)
 * @param maxFileSizeKB - Maximum file size in KB (default: 500KB)
 * @returns Compressed File
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.6,
  maxFileSizeKB: number = 300
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const originalSizeKB = file.size / 1024;
    console.log(`📸 Compressing image: ${originalSizeKB.toFixed(2)}KB -> target: ${maxWidth}x${maxHeight}, max ${maxFileSizeKB}KB`);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const originalDimensions = { width, height };

        // Always resize to fit within max dimensions (for avatar, always resize)
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        if (ratio < 1 || width > maxWidth || height > maxHeight) {
          width = width * ratio;
          height = height * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Use better image rendering for quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG for better compression (smaller file size)
        const outputType = 'image/jpeg';
        
        const compressRecursive = (q: number): void => {
          if (q < 0.3) {
            // If quality is too low, just accept the current size
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                    type: outputType,
                    lastModified: Date.now(),
                  });
                  const finalSizeKB = blob.size / 1024;
                  console.log(`✅ Compressed: ${originalDimensions.width}x${originalDimensions.height} -> ${width}x${height}, ${originalSizeKB.toFixed(2)}KB -> ${finalSizeKB.toFixed(2)}KB`);
                  resolve(compressedFile);
                } else {
                  reject(new Error('Failed to compress image'));
                }
              },
              outputType,
              0.3
            );
            return;
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const fileSizeKB = blob.size / 1024;
                
                // If file is still too large and quality can be reduced more, try again
                if (fileSizeKB > maxFileSizeKB && q > 0.3) {
                  const newQuality = Math.max(0.3, q - 0.1);
                  console.log(`🔄 File too large (${fileSizeKB.toFixed(2)}KB), reducing quality to ${newQuality}`);
                  compressRecursive(newQuality);
                } else {
                  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                    type: outputType,
                    lastModified: Date.now(),
                  });
                  const finalSizeKB = blob.size / 1024;
                  console.log(`✅ Compressed: ${originalDimensions.width}x${originalDimensions.height} -> ${width}x${height}, ${originalSizeKB.toFixed(2)}KB -> ${finalSizeKB.toFixed(2)}KB`);
                  resolve(compressedFile);
                }
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            outputType,
            q
          );
        };
        
        compressRecursive(quality);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

export const uploadImageApi = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await api.post<{ success: boolean; imageUrl: string }>('/uploads/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data && response.data.imageUrl) {
      return response.data.imageUrl;
    } else {
      throw new Error('No imageUrl in response');
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    const errorMessage = error?.response?.data?.message || 'Failed to upload image';
    throw new Error(errorMessage);
  }
};

export const uploadMultipleImagesApi = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageApi(file));
  return Promise.all(uploadPromises);
};
