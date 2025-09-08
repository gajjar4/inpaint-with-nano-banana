import React from "react";
import {
  Undo,
  Redo,
  Trash2,
  Download,
  Upload,
  Edit,
  Wand2,
} from "lucide-react";
import { Button } from "../ui";

interface ActionToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onUpload: () => void;
  onDownload: () => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
  className?: string;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onUpload,
  onDownload,
  onGenerate,
  isGenerating = false,
  className,
}) => {
  return (
    <div
      className={`flex gap-2 p-3 bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}
    >
      <Button
        variant="ghost"
        size="sm"
        disabled={!canUndo}
        onClick={onUndo}
        title="Undo"
      >
        <Undo size={18} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={!canRedo}
        onClick={onRedo}
        title="Redo"
      >
        <Redo size={18} />
      </Button>

      <div className="w-px bg-gray-300 mx-1" />

      <Button variant="ghost" size="sm" onClick={onUpload} title="Upload Image">
        <Upload size={18} />
      </Button>

      <Button variant="ghost" size="sm" onClick={onDownload} title="Download">
        <Download size={18} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        title="Clear All"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 size={18} />
      </Button>

      {onGenerate && (
        <>
          <div className="w-px bg-gray-300 mx-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating}
            title="Edit with AI"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Edit size={16} className="mr-1" />
            {isGenerating ? "Editing..." : "Edit"}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating}
            title="Generate with AI"
          >
            <Wand2 size={16} className="mr-1" />
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
        </>
      )}
    </div>
  );
};
