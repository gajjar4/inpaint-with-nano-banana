import React from "react";
import { ColorPicker, Slider } from "../ui";
import type { ToolType } from "../../types";

interface PropertiesPanelProps {
  activeTool: ToolType;
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
  onColorChange: (tool: string, color: string) => void;
  onSizeChange: (property: string, size: number) => void;
  className?: string;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  activeTool,
  colors,
  sizes,
  onColorChange,
  onSizeChange,
  className,
}) => {
  if (!activeTool) {
    return (
      <div
        className={`p-4 bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}
      >
        <p className="text-sm text-gray-500 text-center">
          Select a tool to see properties
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-4 bg-white rounded-lg shadow-lg border border-gray-200 space-y-4 ${className}`}
    >
      <h3 className="text-sm font-medium text-gray-700 capitalize">
        {activeTool} Properties
      </h3>

      {activeTool === "draw" && (
        <>
          <ColorPicker
            label="Color"
            value={colors.draw}
            onChange={(color) => onColorChange("draw", color)}
          />
          <Slider
            label="Thickness"
            value={sizes.drawThickness}
            onChange={(value) => onSizeChange("drawThickness", value)}
            min={1}
            max={20}
          />
        </>
      )}

      {activeTool === "arrow" && (
        <>
          <ColorPicker
            label="Color"
            value={colors.arrow}
            onChange={(color) => onColorChange("arrow", color)}
          />
          <Slider
            label="Thickness"
            value={sizes.arrowThickness}
            onChange={(value) => onSizeChange("arrowThickness", value)}
            min={1}
            max={20}
          />
        </>
      )}

      {activeTool === "text" && (
        <>
          <ColorPicker
            label="Color"
            value={colors.text}
            onChange={(color) => onColorChange("text", color)}
          />
          <Slider
            label="Font Size"
            value={sizes.fontSize}
            onChange={(value) => onSizeChange("fontSize", value)}
            min={12}
            max={72}
          />
        </>
      )}

      {activeTool === "mask" && (
        <>
          <ColorPicker
            label="Color"
            value={colors.mask}
            onChange={(color) => onColorChange("mask", color)}
          />
          <Slider
            label="Brush Size"
            value={sizes.brushSize}
            onChange={(value) => onSizeChange("brushSize", value)}
            min={10}
            max={100}
          />
        </>
      )}
    </div>
  );
};
