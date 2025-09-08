import React from "react";
import { Button } from "../ui";
import type { ToolType } from "../../types";

interface ToolButtonProps {
  tool: ToolType;
  activeTool: ToolType;
  onSelect: (tool: ToolType) => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  className?: string;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  tool,
  activeTool,
  onSelect,
  icon,
  label,
  disabled = false,
  className,
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      active={activeTool === tool}
      disabled={disabled}
      onClick={() => onSelect(tool)}
      className={className}
      title={label}
    >
      <div className="flex flex-col items-center gap-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
    </Button>
  );
};
