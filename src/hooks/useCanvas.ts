import { useRef, useCallback, useEffect } from "react";
import type { Annotation, MaskStroke, Point, CanvasDimensions } from "../types";
import { getCanvasCoordinates } from "../utils";

interface UseCanvasProps {
  dimensions: CanvasDimensions;
  annotations: Annotation[];
  maskStrokes: MaskStroke[];
  currentPath: Point[];
  isDrawing: boolean;
  activeTool: string | null;
  startPos: Point;
  currentMousePos: Point;
  selectedAnnotationId: string | null;
  isDragging?: boolean;
  dragType?: string | null;
  image?: HTMLImageElement;
  colors: {
    draw: string;
    arrow: string;
    text: string;
    mask: string;
  };
  sizes: {
    drawThickness: number;
    arrowThickness: number;
    fontSize: number;
    brushSize: number;
  };
}

export const useCanvas = ({
  dimensions,
  annotations,
  maskStrokes,
  currentPath,
  isDrawing,
  activeTool,
  startPos,
  currentMousePos,
  selectedAnnotationId,
  isDragging = false,
  dragType = null,
  image,
  colors,
  sizes,
}: UseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw everything on canvas
  const drawOnCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image first if available
    if (image) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    // Set default styles
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Draw all annotations
    annotations.forEach((annotation) => {
      const isSelected = annotation.id === selectedAnnotationId;

      if (annotation.type === "draw") {
        if (annotation.path.length > 1) {
          ctx.strokeStyle = annotation.color;
          ctx.lineWidth = annotation.thickness;
          ctx.globalAlpha = isSelected ? 0.7 : 1;

          ctx.beginPath();
          ctx.moveTo(annotation.path[0].x, annotation.path[0].y);
          annotation.path.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      } else if (annotation.type === "arrow") {
        ctx.strokeStyle = annotation.color;
        ctx.lineWidth = annotation.thickness;
        ctx.globalAlpha = isSelected ? 0.7 : 1;

        // Draw arrow line
        ctx.beginPath();
        ctx.moveTo(annotation.startX, annotation.startY);
        ctx.lineTo(annotation.endX, annotation.endY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(
          annotation.endY - annotation.startY,
          annotation.endX - annotation.startX
        );
        const headLength = 20;

        ctx.beginPath();
        ctx.moveTo(annotation.endX, annotation.endY);
        ctx.lineTo(
          annotation.endX - headLength * Math.cos(angle - Math.PI / 6),
          annotation.endY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(annotation.endX, annotation.endY);
        ctx.lineTo(
          annotation.endX - headLength * Math.cos(angle + Math.PI / 6),
          annotation.endY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();

        // Draw selection handles for arrows
        if (isSelected) {
          ctx.fillStyle = "#3b82f6";
          ctx.globalAlpha = 1;

          // Start point handle
          ctx.beginPath();
          ctx.arc(annotation.startX, annotation.startY, 6, 0, 2 * Math.PI);
          ctx.fill();

          // End point handle
          ctx.beginPath();
          ctx.arc(annotation.endX, annotation.endY, 6, 0, 2 * Math.PI);
          ctx.fill();

          // White border for handles
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(annotation.startX, annotation.startY, 6, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(annotation.endX, annotation.endY, 6, 0, 2 * Math.PI);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else if (annotation.type === "text") {
        ctx.font = `${annotation.fontSize}px Arial`;
        ctx.fillStyle = annotation.color;
        ctx.globalAlpha = isSelected ? 0.7 : 1;

        // Draw selection background for text
        if (isSelected) {
          const textMetrics = ctx.measureText(annotation.text);
          const textWidth = textMetrics.width;
          const textHeight = annotation.fontSize;

          ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
          ctx.fillRect(
            annotation.x - 4,
            annotation.y - textHeight - 2,
            textWidth + 8,
            textHeight + 6
          );

          // Selection border
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2;
          ctx.strokeRect(
            annotation.x - 4,
            annotation.y - textHeight - 2,
            textWidth + 8,
            textHeight + 6
          );

          // Reset fill style for text
          ctx.fillStyle = annotation.color;
        }

        // Draw text with shadow for better visibility
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 2;

        ctx.fillText(annotation.text, annotation.x, annotation.y);

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else if (annotation.type === "image") {
        ctx.globalAlpha = isSelected ? 0.7 : 1;

        const centerX = annotation.x + annotation.width / 2;
        const centerY = annotation.y + annotation.height / 2;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(annotation.rotation);
        ctx.drawImage(
          annotation.imageElement,
          -annotation.width / 2,
          -annotation.height / 2,
          annotation.width,
          annotation.height
        );
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    });

    // Draw current path while drawing
    if (
      currentPath.length > 1 &&
      (activeTool === "draw" || activeTool === "mask")
    ) {
      ctx.strokeStyle = activeTool === "draw" ? colors.draw : colors.mask;
      ctx.lineWidth =
        activeTool === "draw" ? sizes.drawThickness : sizes.brushSize;
      ctx.globalAlpha = 0.7;

      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw arrow preview while drawing
    if (isDrawing && activeTool === "arrow") {
      ctx.strokeStyle = colors.arrow;
      ctx.lineWidth = sizes.arrowThickness;
      ctx.globalAlpha = 0.7;

      // Draw arrow line
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(currentMousePos.x, currentMousePos.y);
      ctx.stroke();

      // Draw arrowhead
      const angle = Math.atan2(
        currentMousePos.y - startPos.y,
        currentMousePos.x - startPos.x
      );
      const headLength = 20;

      ctx.beginPath();
      ctx.moveTo(currentMousePos.x, currentMousePos.y);
      ctx.lineTo(
        currentMousePos.x - headLength * Math.cos(angle - Math.PI / 6),
        currentMousePos.y - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(currentMousePos.x, currentMousePos.y);
      ctx.lineTo(
        currentMousePos.x - headLength * Math.cos(angle + Math.PI / 6),
        currentMousePos.y - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw mask overlay
    if (maskStrokes.length > 0) {
      const maskCanvas = maskCanvasRef.current;
      if (maskCanvas) {
        const maskCtx = maskCanvas.getContext("2d");
        if (maskCtx) {
          maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
          maskCtx.globalCompositeOperation = "source-over";
          maskCtx.fillStyle = "white";

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
            maskCtx.beginPath();
            strokes.forEach((stroke) => {
              maskCtx.moveTo(stroke.x + size / 2, stroke.y);
              maskCtx.arc(stroke.x, stroke.y, size / 2, 0, 2 * Math.PI);
            });
            maskCtx.fill();
          });

          // Draw mask overlay on main canvas
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.globalCompositeOperation = "source-over";

          // Create colored overlay
          const overlayCanvas = document.createElement("canvas");
          overlayCanvas.width = maskCanvas.width;
          overlayCanvas.height = maskCanvas.height;
          const overlayCtx = overlayCanvas.getContext("2d")!;

          overlayCtx.fillStyle = colors.mask;
          overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          overlayCtx.globalCompositeOperation = "destination-in";
          overlayCtx.drawImage(maskCanvas, 0, 0);

          ctx.drawImage(overlayCanvas, 0, 0);
          ctx.restore();
        }
      }
    }
  }, [
    annotations,
    maskStrokes,
    currentPath,
    isDrawing,
    activeTool,
    startPos,
    currentMousePos,
    selectedAnnotationId,
    isDragging,
    dragType,
    image,
    colors,
    sizes,
  ]);

  // Initialize mask canvas
  useEffect(() => {
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      maskCanvas.width = dimensions.width;
      maskCanvas.height = dimensions.height;
    }
  }, [dimensions]);

  // Redraw when dependencies change
  useEffect(() => {
    drawOnCanvas();
  }, [drawOnCanvas]);

  // Get coordinates from event
  const getCoordinates = useCallback(
    (
      event:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ): Point | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return getCanvasCoordinates(event, canvas);
    },
    []
  );

  return {
    canvasRef,
    maskCanvasRef,
    getCoordinates,
    drawOnCanvas,
  };
};
