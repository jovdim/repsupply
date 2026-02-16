/**
 * Client-side image compression before upload.
 * Resizes large images and compresses to target size to save Supabase storage & egress.
 * At 50,000 images: uncompressed ~125GB vs compressed ~25GB (5× savings).
 */

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const TARGET_SIZE_KB = 500;

/**
 * Compress an image file using canvas.
 * - Resizes to fit within maxWidth × maxHeight (preserving aspect ratio)
 * - Compresses to WebP (with JPEG fallback) at decreasing quality until ≤ targetSize
 * - Returns a new File object ready for upload
 */
export async function compressImage(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    targetSizeKB?: number;
  }
): Promise<File> {
  const maxW = options?.maxWidth || MAX_WIDTH;
  const maxH = options?.maxHeight || MAX_HEIGHT;
  const targetBytes = (options?.targetSizeKB || TARGET_SIZE_KB) * 1024;

  // Skip compression for small files and non-images
  if (!file.type.startsWith("image/") || file.size <= targetBytes) {
    return file;
  }

  // Load image into canvas
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  // Calculate new dimensions maintaining aspect ratio
  if (width > maxW || height > maxH) {
    const ratio = Math.min(maxW / width, maxH / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Try WebP first, fall back to JPEG
  const outputType = supportsWebP() ? "image/webp" : "image/jpeg";
  const ext = outputType === "image/webp" ? "webp" : "jpg";

  // Iteratively reduce quality until under target size
  let quality = 0.85;
  let blob: Blob;

  do {
    blob = await canvas.convertToBlob({ type: outputType, quality });
    quality -= 0.1;
  } while (blob.size > targetBytes && quality > 0.3);

  // Generate a clean filename
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const newFile = new File([blob], `${baseName}.${ext}`, { type: outputType });

  console.log(
    `[compressImage] ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(newFile.size / 1024).toFixed(0)}KB (${width}×${height}, q=${(quality + 0.1).toFixed(1)})`
  );

  return newFile;
}

/** Check if browser supports WebP encoding */
function supportsWebP(): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}
