import { toPng } from "html-to-image";

export async function exportWallpaper(
  node: HTMLElement,
  filename: string = "jadwal-wallpaper.png",
  size?: { width: number; height: number }
) {
  const dataUrl = await toPng(node, {
    width: size?.width,
    height: size?.height,
    pixelRatio: 1,
    cacheBust: true,
  });

  const link = document.createElement("a");
  link.download = size
    ? `${filename.replace(/\.png$/, "")}-${size.width}x${size.height}.png`
    : filename;
  link.href = dataUrl;
  link.click();
}