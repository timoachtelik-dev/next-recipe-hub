"use client";

import { useState } from "react";

interface SafeImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: React.ReactNode;
}

export function SafeImage({ 
  src, 
  alt, 
  fill = false, 
  width, 
  height, 
  className,
  placeholder = null 
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Don't render if no src or if there was an error
  if (!src || hasError) {
    return placeholder ? (
      <>{placeholder}</>
    ) : (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}>
        <span className="text-sm">No Image</span>
      </div>
    );
  }

  // Check if URL is valid
  try {
    new URL(src);
  } catch {
    return placeholder ? (
      <>{placeholder}</>
    ) : (
      <div className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className}`}>
        <span className="text-sm">Invalid Image URL</span>
      </div>
    );
  }

  // Use regular img tag instead of Next.js Image to avoid hostname restrictions
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setHasError(true)}
      style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : undefined}
    />
  );
}
