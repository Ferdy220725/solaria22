export interface WallpaperSize {
  id: string;
  label: string;
  width: number;
  height: number;
}

// Rasio HP — pakai layout card (list biasa)
export const WALLPAPER_SIZES: WallpaperSize[] = [
  { id: "default", label: "Default (1080 x 2340)", width: 1080, height: 2340 },
  { id: "fhd", label: "Full HD (1080 x 1920)", width: 1080, height: 1920 },
  { id: "hd-plus", label: "HD+ (1080 x 2400)", width: 1080, height: 2400 },
  { id: "iphone-13-14", label: "iPhone 13/14 (1170 x 2532)", width: 1170, height: 2532 },
  { id: "iphone-15-16", label: "iPhone 15/16 (1179 x 2556)", width: 1179, height: 2556 },
  { id: "iphone-pro-max", label: "iPhone Pro Max (1284 x 2778)", width: 1284, height: 2778 },
  { id: "samsung-s", label: "Samsung S-series (1440 x 3200)", width: 1440, height: 3200 },
  { id: "custom", label: "Custom", width: 1080, height: 2340 },
];

// Rasio kotak/share — otomatis pakai CompactScheduleLayout
export const SHARE_SIZES: WallpaperSize[] = [
  { id: "square", label: "Persegi 1:1 (1080 x 1080)", width: 1080, height: 1080 },
  { id: "portrait-4-5", label: "Portrait 4:5 (1080 x 1350)", width: 1080, height: 1350 },
  { id: "portrait-3-4", label: "Portrait 3:4 (1080 x 1440)", width: 1080, height: 1440 },
  { id: "portrait-4-6", label: "Portrait 4:6 (1080 x 1620)", width: 1080, height: 1620 },
  { id: "share-custom", label: "Custom", width: 1080, height: 1080 },
];

export const DEFAULT_WALLPAPER_SIZE = WALLPAPER_SIZES[0];
export const DEFAULT_SHARE_SIZE = SHARE_SIZES[0];

/** Helper: cek apakah sebuah size (by id) termasuk kategori "share" (compact layout) */
export function isShareSizeId(id: string): boolean {
  return SHARE_SIZES.some((s) => s.id === id);
}