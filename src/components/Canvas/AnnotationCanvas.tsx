import React, { useEffect } from "react";
import { useCanvas } from "../../hooks";
import type {
  Annotation,
  MaskStroke,
  Point,
  CanvasDimensions,
} from "../../types";

interface AnnotationCanvasProps {
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
  onMouseDown?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onTouchStart?: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove?: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd?: (event: React.TouchEvent<HTMLCanvasElement>) => void;
  className?: string;
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({
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
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  className,
}) => {
  const { canvasRef, maskCanvasRef, drawOnCanvas } = useCanvas({
    dimensions,
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
  });

  // Trigger redraw when image changes
  useEffect(() => {
    drawOnCanvas();
  }, [image, drawOnCanvas]);

  return (
    <div className="relative">
      {/* Hidden mask canvas for mask operations */}
      <canvas
        ref={maskCanvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="hidden"
      />

      {/* Main annotation canvas */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className={`border border-gray-300 rounded-lg shadow-sm ${className}`}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "auto",
          touchAction: "none",
          objectFit: "contain",
        }}
      />
    </div>
  );
};
