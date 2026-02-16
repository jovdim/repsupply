"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

interface ImageWithSkeletonProps extends Omit<ImageProps, "onLoad"> {
  /** Extra class on the skeleton shimmer */
  skeletonClassName?: string;
}

/**
 * Drop-in replacement for next/image that shows a shimmer skeleton
 * while the image is loading, then fades in smoothly.
 */
export function ImageWithSkeleton({
  className = "",
  skeletonClassName = "",
  alt,
  ...props
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {/* Skeleton shimmer — visible until image loads */}
      {!loaded && (
        <div
          className={`absolute inset-0 bg-white/[0.03] animate-pulse ${skeletonClassName}`}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />
        </div>
      )}
      <Image
        {...props}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}
