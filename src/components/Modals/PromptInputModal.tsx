import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui";

interface PromptInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  title?: string;
  placeholder?: string;
  initialValue?: string;
}

export const PromptInputModal: React.FC<PromptInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Enter Prompt",
  placeholder = "Describe what you want to generate...",
  initialValue = "",
}) => {
  const [prompt, setPrompt] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-[13vh] left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl shadow-2xl p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />

            <Button type="submit" disabled={!prompt.trim()}>
              Generate
            </Button>

            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
