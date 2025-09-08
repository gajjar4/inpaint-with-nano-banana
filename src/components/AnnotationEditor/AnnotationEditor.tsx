import React, { useState, useRef, useCallback } from "react";
import { Upload, Undo, Redo, Trash2, Download, Zap, Lasso } from "lucide-react";
import { useAnnotations } from "../../hooks";
import { AnnotationCanvas } from "../Canvas";
import { DrawingToolbar, PropertiesPanel } from "../Toolbar";
import { TextInputModal, PromptInputModal } from "../Modals";
import {
  loadImage,
  calculateCanvasDimensions,
  canvasToDataURL,
} from "../../utils";
import { APIClient } from "../../api";
import type { GenerationRequest } from "../../api";
import type { AnnotationConfig } from "../../types";

interface AnnotationEditorProps {
  apiClient?: APIClient;
  config?: Partial<AnnotationConfig>;
  className?: string;
  onImageGenerated?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

const defaultConfig: AnnotationConfig = {
  colors: {
    draw: "#000000",
    arrow: "#ef4444",
    text: "#000000",
    mask: "#3b82f6",
  },
  defaultSizes: {
    drawThickness: 3,
    arrowThickness: 3,
    fontSize: 16,
    brushSize: 30,
  },
  canvas: {
    maxWidth: 1200,
    maxHeight: 800,
    backgroundColor: "#ffffff",
  },
};

export const AnnotationEditor: React.FC<AnnotationEditorProps> = ({
  apiClient,
  config: userConfig = {},
  className,
  onImageGenerated,
  onError,
}) => {
  const config = { ...defaultConfig, ...userConfig };
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [colors, setColors] = useState(config.colors);
  const [sizes, setSizes] = useState(config.defaultSizes);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modals
  const [showTextModal, setShowTextModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Mask state
  const [maskPrompt, setMaskPrompt] = useState("");

  // Image overlay
  const overlayImageInputRef = useRef<HTMLInputElement>(null);

  // Annotations hook
  const {
    annotations,
    maskStrokes,
    activeTool,
    isDrawing,
    currentPath,
    selectedAnnotationId,
    isDragging,
    dragType,
    canUndo,
    canRedo,
    startPos,
    currentMousePos,
    setActiveTool,
    startDrawing,
    continueDrawing,
    endDrawing,
    addTextAnnotation,
    addImageAnnotation,
    updateTextAnnotation,
    clearAll,
    clearMaskStrokes,
    startDragging,
    continueDragging,
    stopDragging,
    undo,
    redo,
  } = useAnnotations();

  // Handle image upload
  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const img = await loadImage(file);
        const newDimensions = calculateCanvasDimensions(
          img.width,
          img.height,
          config.canvas.maxWidth,
          config.canvas.maxHeight
        );

        setImage(img);
        setDimensions(newDimensions);
        clearAll();
      } catch (error) {
        onError?.("Failed to load image");
        console.error("Failed to load image:", error);
      }
    },
    [config.canvas, clearAll, onError]
  );

  // Handle overlay image upload
  const handleOverlayImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        const img = await loadImage(file);

        // Calculate default size (30% of canvas size)
        const maxSize = Math.min(dimensions.width, dimensions.height) * 0.3;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxSize;
            height = maxSize / aspectRatio;
          } else {
            height = maxSize;
            width = maxSize * aspectRatio;
          }
        }

        // Position at center of canvas
        const x = (dimensions.width - width) / 2;
        const y = (dimensions.height - height) / 2;

        addImageAnnotation(x, y, width, height, img);
        setActiveTool(null); // Deselect tool after adding image
      } catch (error) {
        onError?.("Failed to load overlay image");
        console.error("Failed to load overlay image:", error);
      }
    },
    [dimensions, addImageAnnotation, setActiveTool, onError]
  );

  // Handle canvas mouse events
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      const point = { x, y, timestamp: Date.now() };

      // Handle tool-specific actions first
      if (activeTool === "text") {
        setEditingTextId(null);
        setTextPosition({ x, y });
        setShowTextModal(true);
        return;
      }

      if (activeTool === "image") {
        // Trigger image upload
        overlayImageInputRef.current?.click();
        return;
      }

      if (activeTool === "prompt") {
        // Open prompt modal
        setShowPromptModal(true);
        return;
      }

      // Try to start dragging existing annotations first
      const didStartDrag = startDragging(point);
      if (didStartDrag) {
        // Check if it's a text annotation for potential editing
        const textAnn = annotations.find(
          (ann) => ann.id === selectedAnnotationId && ann.type === "text"
        );
        if (textAnn && event.detail === 2) {
          // Double click
          setEditingTextId(textAnn.id);
          setTextPosition({ x: (textAnn as any).x, y: (textAnn as any).y });
          setShowTextModal(true);
          stopDragging();
          return;
        }
        return;
      }

      // If no dragging started and we have a drawing tool, start drawing
      if (
        activeTool === "draw" ||
        activeTool === "arrow" ||
        activeTool === "mask"
      ) {
        startDrawing(point);
      }
    },
    [
      activeTool,
      annotations,
      selectedAnnotationId,
      startDragging,
      startDrawing,
      stopDragging,
    ]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      const point = { x, y, timestamp: Date.now() };

      if (isDragging) {
        continueDragging(point);
        return;
      }

      if (isDrawing) {
        continueDrawing(point);
        return;
      }
    },
    [isDrawing, isDragging, continueDrawing, continueDragging]
  );

  const handleMouseUp = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = event.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
      const point = { x, y, timestamp: Date.now() };

      if (isDragging) {
        stopDragging();
        return;
      }

      if (isDrawing) {
        const color = colors[activeTool as keyof typeof colors] || "#000000";
        const thickness =
          activeTool === "draw"
            ? sizes.drawThickness
            : activeTool === "arrow"
            ? sizes.arrowThickness
            : activeTool === "mask"
            ? sizes.brushSize
            : 3;

        endDrawing(point, color, thickness);
        return;
      }
    },
    [isDrawing, isDragging, activeTool, colors, sizes, endDrawing, stopDragging]
  );

  // Handle text submission
  const handleTextSubmit = useCallback(
    (text: string, color: string, fontSize: number) => {
      if (editingTextId) {
        // Update existing text
        updateTextAnnotation(editingTextId, { text, color, fontSize });
        setEditingTextId(null);
      } else {
        // Add new text
        addTextAnnotation(
          textPosition.x,
          textPosition.y,
          text,
          color,
          fontSize
        );
      }
      setShowTextModal(false);
    },
    [textPosition, addTextAnnotation, editingTextId, updateTextAnnotation]
  );

  // Open text modal immediately when text tool is selected
  React.useEffect(() => {
    if (activeTool === "text" && !showTextModal && !editingTextId) {
      // Set default position to center of canvas
      setTextPosition({
        x: dimensions.width / 2,
        y: dimensions.height / 2,
      });
      setShowTextModal(true);
    }
  }, [activeTool, showTextModal, editingTextId, dimensions]);

  // Open prompt modal immediately when prompt tool is selected
  React.useEffect(() => {
    if (activeTool === "prompt" && !showPromptModal) {
      setShowPromptModal(true);
    }
  }, [activeTool, showPromptModal]);

  // Handle color changes
  const handleColorChange = useCallback((tool: string, color: string) => {
    setColors((prev) => ({ ...prev, [tool]: color }));
  }, []);

  // Handle size changes
  const handleSizeChange = useCallback((property: string, size: number) => {
    setSizes((prev) => ({ ...prev, [property]: size }));
  }, []);

  // Handle download
  const handleDownload = useCallback(() => {
    // Create a temporary canvas to combine image and annotations
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = dimensions.width;
    tempCanvas.height = dimensions.height;

    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = config.canvas.backgroundColor;
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw image if exists
    if (image) {
      ctx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
    }

    // The actual annotation drawing would be handled by the canvas component
    // For now, we'll just download the current state
    const dataUrl = canvasToDataURL(tempCanvas);
    const link = document.createElement("a");
    link.download = "annotated-image.png";
    link.href = dataUrl;
    link.click();
  }, [dimensions, image, config.canvas.backgroundColor]);

  // Handle AI generation
  const handleGenerate = useCallback(
    async (prompt: string) => {
      if (!apiClient || !image) {
        onError?.("API client not configured or no image loaded");
        return;
      }

      setIsGenerating(true);

      try {
        // Create canvas with current image
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = dimensions.width;
        tempCanvas.height = dimensions.height;

        const ctx = tempCanvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");

        ctx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
        const imageData = canvasToDataURL(tempCanvas);

        // Use mask strokes directly for Nano Banana API
        const maskData = maskStrokes.length > 0 ? maskStrokes : undefined;

        const request: GenerationRequest = {
          imageData,
          maskData,
          prompt,
          strength: 0.8,
          guidance: 7.5,
          steps: 20,
        };

        const response = await apiClient.generateImage(request);

        if (response.success && response.result) {
          onImageGenerated?.(response.result.output);

          // Load the generated image
          const generatedImg = await loadImage(response.result.output);
          setImage(generatedImg);
          clearMaskStrokes(); // Clear mask after generation
        } else {
          throw new Error(response.error?.message || "Generation failed");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Generation failed";
        onError?.(errorMessage);
        console.error("Generation failed:", error);
      } finally {
        setIsGenerating(false);
      }
    },
    [
      apiClient,
      image,
      dimensions,
      maskStrokes,
      onImageGenerated,
      onError,
      clearMaskStrokes,
    ]
  );

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">
          Annotation Editor
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 p-4 bg-white border-r border-gray-200 space-y-4">
          <DrawingToolbar
            activeTool={activeTool}
            onToolSelect={(tool) => {
              if (tool === activeTool) {
                // Toggle off if clicking the same tool
                setActiveTool(null);
                if (tool === "mask") {
                  // Clear mask state when deactivating
                  setMaskPrompt("");
                }
              } else {
                setActiveTool(tool);
              }
            }}
            isMaskToolActive={activeTool === "mask"}
            isGenerating={isGenerating}
          />

          <PropertiesPanel
            activeTool={activeTool}
            colors={colors}
            sizes={sizes}
            onColorChange={handleColorChange}
            onSizeChange={handleSizeChange}
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 min-h-0 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="w-full h-full flex items-center justify-center max-w-6xl mx-auto">
            {image ? (
              <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 p-4 max-w-full max-h-full">
                <AnnotationCanvas
                  dimensions={dimensions}
                  annotations={annotations}
                  maskStrokes={maskStrokes}
                  currentPath={currentPath}
                  isDrawing={isDrawing}
                  activeTool={activeTool}
                  startPos={startPos}
                  currentMousePos={currentMousePos}
                  selectedAnnotationId={selectedAnnotationId}
                  isDragging={isDragging}
                  dragType={dragType}
                  image={image}
                  colors={colors}
                  sizes={sizes}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-300 rounded-xl bg-white/50 backdrop-blur-sm">
                <Upload size={48} className="text-slate-400 mb-4" />
                <p className="text-slate-500 mb-4 text-lg">No image loaded</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg"
                >
                  Upload Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Toolbar - Main Actions */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4">
        <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl p-3">
          <div className="flex gap-3 items-center justify-center">
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-lg"
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Upload</span>
            </button>

            {/* Undo/Redo */}
            <div className="flex gap-2">
              <button
                onClick={undo}
                disabled={!canUndo || isGenerating}
                className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-xl transition-all duration-200 text-sm font-medium"
              >
                <Undo size={16} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo || isGenerating}
                className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-xl transition-all duration-200 text-sm font-medium"
              >
                <Redo size={16} />
              </button>
            </div>

            {/* Clear */}
            <button
              onClick={clearAll}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 py-2.5 bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-red-700 rounded-xl transition-all duration-200 text-sm font-medium"
            >
              <Trash2 size={16} />
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={!image || isGenerating}
              className="flex items-center gap-2 px-3 py-2.5 bg-green-100 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-green-700 rounded-xl transition-all duration-200 text-sm font-medium"
            >
              <Download size={16} />
            </button>

            {/* Generate/Edit Button */}
            <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-xl p-[1px] shadow-xl">
              <button
                onClick={() => {
                  if (
                    activeTool === "mask" &&
                    maskStrokes.length > 0 &&
                    maskPrompt.trim()
                  ) {
                    // Use mask prompt directly
                    if (apiClient) {
                      handleGenerate(maskPrompt);
                    } else {
                      // Demo mode - show what would happen
                      alert(
                        `Demo Mode: Would generate with mask prompt: "${maskPrompt}"`
                      );
                    }
                  } else {
                    if (apiClient) {
                      setShowPromptModal(true);
                    } else {
                      // Demo mode - show what would happen
                      alert(
                        "Demo Mode: Would open prompt modal for AI generation"
                      );
                    }
                  }
                }}
                disabled={
                  !image ||
                  isGenerating ||
                  (activeTool === "mask" &&
                    (maskStrokes.length === 0 || !maskPrompt.trim()))
                }
                className="w-full font-bold py-2.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-blue-600 whitespace-nowrap text-sm"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    {activeTool === "mask" ? "Edit Mask" : "Edit"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <input
        ref={overlayImageInputRef}
        type="file"
        accept="image/*"
        onChange={handleOverlayImageUpload}
        className="hidden"
      />

      {/* Modals */}
      <TextInputModal
        isOpen={showTextModal}
        onClose={() => {
          setShowTextModal(false);
          setEditingTextId(null);
          setActiveTool(null); // Deselect tool when closing
        }}
        onSubmit={handleTextSubmit}
        initialText={
          editingTextId
            ? (annotations.find((a) => a.id === editingTextId) as any)?.text ||
              ""
            : ""
        }
        initialColor={
          editingTextId
            ? (annotations.find((a) => a.id === editingTextId) as any)?.color ||
              colors.text
            : colors.text
        }
        initialFontSize={
          editingTextId
            ? (annotations.find((a) => a.id === editingTextId) as any)
                ?.fontSize || sizes.fontSize
            : sizes.fontSize
        }
        isEditing={!!editingTextId}
      />

      <PromptInputModal
        isOpen={showPromptModal}
        onClose={() => {
          setShowPromptModal(false);
          setActiveTool(null); // Deselect tool when closing
        }}
        onSubmit={(prompt) => {
          if (apiClient) {
            handleGenerate(prompt);
          } else {
            // Demo mode - show what would happen
            alert(`Demo Mode: Would generate with prompt: "${prompt}"`);
            setShowPromptModal(false);
            setActiveTool(null);
          }
        }}
        title="Generate with AI"
        placeholder="Describe what you want to generate or edit..."
      />

      {/* Mask Prompt Modal */}
      {activeTool === "mask" && (
        <div className="fixed bottom-[13vh] left-1/2 transform -translate-x-1/2 z-50 w-full max-w-3xl px-4">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Lasso size={16} />
                <span className="font-medium">
                  {maskStrokes.length > 0
                    ? "Edit Selected Area"
                    : "Paint to Select Area"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={maskPrompt}
                  onChange={(e) => setMaskPrompt(e.target.value)}
                  placeholder={
                    maskStrokes.length > 0
                      ? "Describe how to change the selected area..."
                      : "First paint an area to select, then describe changes..."
                  }
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={maskStrokes.length === 0}
                  autoFocus
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      maskStrokes.length > 0 &&
                      maskPrompt.trim()
                    ) {
                      e.preventDefault();
                      if (apiClient) {
                        handleGenerate(maskPrompt);
                      } else {
                        // Demo mode - show what would happen
                        alert(
                          `Demo Mode: Would generate with mask prompt: "${maskPrompt}"`
                        );
                      }
                    }
                  }}
                />

                <div className="flex items-center gap-2">
                  {maskStrokes.length > 0 && (
                    <button
                      onClick={() => {
                        clearMaskStrokes();
                        setMaskPrompt("");
                      }}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all duration-200 font-medium text-sm"
                    >
                      Clear
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setActiveTool(null);
                      setMaskPrompt("");
                      clearMaskStrokes();
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
