import { useEffect } from "react";

/**
 * Proactively preloads images into the browser cache.
 */
export function useImagePreload(urls: string[]) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const preloadedImages: HTMLImageElement[] = [];

    urls.forEach((url) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
      preloadedImages.push(img);
    });

    // Keep references to images for the duration of the component lifecycle
    return () => {
      preloadedImages.forEach((img) => {
        img.src = ""; // Clear src to help garbage collection
      });
    };
  }, [urls]);
}
