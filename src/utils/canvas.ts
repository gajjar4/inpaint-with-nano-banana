import type { Point, CanvasDimensions } from "../types";

/**
 * Get canvas coordinates from mouse/touch event
 */
export const getCanvasCoordinates = (
  event:
    | React.MouseEvent<HTMLCanvasElement>
    | React.TouchEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): Point => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  let clientX: number, clientY: number;

  if ("touches" in event) {
    // Touch event
    const touch = event.touches[0] || event.changedTouches[0];
    clientX = touch.clientX;
    clientY = touch.clientY;
  } else {
    // Mouse event
    clientX = event.clientX;
    clientY = event.clientY;
  }

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
    timestamp: Date.now(),
  };
};

/**
 * Get canvas coordinates from client coordinates
 */
export const getCanvasCoordinatesFromClient = (
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement
): Point => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
    timestamp: Date.now(),
  };
};

/**
 * Calculate distance between two points
 */
export const getDistance = (point1: Point, point2: Point): number => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
};

/**
 * Interpolate points between two positions for smooth drawing
 */
export const interpolatePoints = (
  from: Point,
  to: Point,
  step: number = 5
): Point[] => {
  const distance = getDistance(from, to);
  const points: Point[] = [];

  if (distance < step) {
    return [to];
  }

  const steps = Math.ceil(distance / step);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    points.push({
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
      timestamp: Date.now(),
    });
  }

  return points;
};

/**
 * Convert canvas to base64 data URL
 */
export const canvasToDataURL = (
  canvas: HTMLCanvasElement,
  quality: number = 0.8
): string => {
  return canvas.toDataURL("image/png", quality);
};

/**
 * Load image from URL or File
 */
export const loadImage = (source: string | File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));

    if (typeof source === "string") {
      img.src = source;
    } else {
      const url = URL.createObjectURL(source);
      img.src = url;
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
    }
  });
};

/**
 * Calculate optimal canvas dimensions while maintaining aspect ratio
 */
export const calculateCanvasDimensions = (
  imageWidth: number,
  imageHeight: number,
  maxWidth: number = 1200,
  maxHeight: number = 800
): CanvasDimensions => {
  const aspectRatio = imageWidth / imageHeight;

  let width = imageWidth;
  let height = imageHeight;

  // Scale down if too large
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
};

/**
 * Create a mask canvas from mask strokes
 */
export const createMaskCanvas = (
  maskStrokes: { x: number; y: number; size: number }[],
  canvasDimensions: CanvasDimensions
): HTMLCanvasElement => {
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = canvasDimensions.width;
  maskCanvas.height = canvasDimensions.height;

  const ctx = maskCanvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  ctx.fillStyle = "white";
  ctx.globalCompositeOperation = "source-over";

  // Group strokes by size for better performance
  const strokesBySize = new Map<number, typeof maskStrokes>();
  maskStrokes.forEach((stroke) => {
    if (!strokesBySize.has(stroke.size)) {
      strokesBySize.set(stroke.size, []);
    }
    strokesBySize.get(stroke.size)!.push(stroke);
  });

  // Draw each size group in one path operation
  strokesBySize.forEach((strokes, size) => {
    ctx.beginPath();
    strokes.forEach((stroke) => {
      ctx.moveTo(stroke.x + size / 2, stroke.y);
      ctx.arc(stroke.x, stroke.y, size / 2, 0, 2 * Math.PI);
    });
    ctx.fill();
  });

  return maskCanvas;
};
