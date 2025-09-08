import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button, Input, ColorPicker } from "../ui";

interface TextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, color: string, fontSize: number) => void;
  initialText?: string;
  initialColor?: string;
  initialFontSize?: number;
  isEditing?: boolean;
}

export const TextInputModal: React.FC<TextInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialText = "",
  initialColor = "#000000",
  initialFontSize = 16,
  isEditing = false,
}) => {
  const [text, setText] = useState(initialText);
  const [color, setColor] = useState(initialColor);
  const [fontSize, setFontSize] = useState(initialFontSize);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setColor(initialColor);
      setFontSize(initialFontSize);
    }
  }, [isOpen, initialText, initialColor, initialFontSize]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim(), color, fontSize);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-[13vh] left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing ? "Edit Text" : "Add Text"}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
              autoFocus
              className="flex-1"
            />

            <div className="flex items-center gap-2">
              <ColorPicker value={color} onChange={setColor} />

              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="px-2 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
                <option value={24}>24px</option>
                <option value={28}>28px</option>
                <option value={32}>32px</option>
                <option value={36}>36px</option>
                <option value={48}>48px</option>
              </select>

              <Button type="submit" disabled={!text.trim()}>
                {isEditing ? "Update" : "Add"}
              </Button>

              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
