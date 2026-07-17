"use client";

import { forwardRef, ReactNode } from "react";

// Basis default untuk layout "wallpaper" (rasio HP, card list)
export const DESIGN_WIDTH = 1080;
export const DESIGN_HEIGHT = 2340;

// Basis default untuk layout "compact" (rasio kotak/share)
export const COMPACT_DESIGN_WIDTH = 1080;
export const COMPACT_DESIGN_HEIGHT = 1080;

interface ScaledWallpaperCanvasProps {
  /** Lebar hasil export (px) */
  width?: number;
  /** Tinggi hasil export (px) */
  height?: number;
  /** Ukuran desain asli konten di dalam (sebelum di-scale). Default: 1080x2340 */
  designWidth?: number;
  designHeight?: number;
  background?: string;
  children: ReactNode;
}

const ScaledWallpaperCanvas = forwardRef<HTMLDivElement, ScaledWallpaperCanvasProps>(
  (
    {
      width,
      height,
      designWidth = DESIGN_WIDTH,
      designHeight = DESIGN_HEIGHT,
      background = "#000000",
      children,
    },
    ref
  ) => {
    // Kalau width/height tidak diisi, canvas = ukuran desain aslinya (tidak di-scale)
    const finalWidth = width ?? designWidth;
    const finalHeight = height ?? designHeight;

    const scale = finalWidth / designWidth;
    const scaledDesignHeight = designHeight * scale;
    const offsetY = (finalHeight - scaledDesignHeight) / 2;

    return (
      <div
        ref={ref}
        style={{ width: finalWidth, height: finalHeight, background }}
        className="relative overflow-hidden"
      >
        <div
          style={{
            width: designWidth,
            height: designHeight,
            transform: `translateY(${offsetY}px) scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

ScaledWallpaperCanvas.displayName = "ScaledWallpaperCanvas";
export default ScaledWallpaperCanvas;