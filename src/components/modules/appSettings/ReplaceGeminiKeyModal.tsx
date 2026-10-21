import React, { useEffect, useState } from "react";
import { Dialog } from "@mui/material";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  X,
  AlertTriangle,
  ClipboardPaste,
  Sparkles,
} from "lucide-react";
import useSnackBarStore from "../../../store/snackBar.store";

interface ReplaceGeminiKeyModalProps {
  open: boolean;
  onClose: () => void;
  currentKey?: string;
  initialIsActive?: boolean;
  documentId?: string;
  onSave: (payload: { key: string; isActive: boolean }) => Promise<void>;
}

const ReplaceGeminiKeyModal: React.FC<ReplaceGeminiKeyModalProps> = ({
  open,
  onClose,
  currentKey,
  initialIsActive = true,
  onSave,
}) => {
  const [keyInput, setKeyInput] = useState("");
  const [isActive, setIsActive] = useState(initialIsActive);
  const [showKey, setShowKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { setSnackBar } = useSnackBarStore();

  useEffect(() => {
    if (open) {
      setKeyInput("");
      setIsActive(initialIsActive);
      setShowKey(false);
      setErrorMessage("");
      setIsSubmitting(false);
    }
  }, [open, initialIsActive]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setKeyInput(text.trim());
        setErrorMessage("");
      }
    } catch {
      setSnackBar("Unable to access clipboard. Please paste manually.", "info");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = keyInput.trim();

    if (!trimmedKey) {
      setErrorMessage("Gemini API key is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      await onSave({ key: trimmedKey, isActive });
      setSnackBar("Gemini API key updated successfully", "success");
      onClose();
    } catch (err: any) {
      const msg = err.message || "Failed to replace Gemini API key";
      setErrorMessage(msg);
      setSnackBar(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          padding: "28px 24px",
          maxWidth: 520,
          borderRadius: "20px",
          boxShadow: "0 10px 40px 0 rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-primary">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1C1C1C]">
                Replace Gemini API Key
              </h3>
              <p className="text-xs text-secondary-text">
                Update key and image analysis status for backend AI services
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Callout */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-x-3 text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div className="text-xs leading-relaxed">
            <span className="font-semibold">Immediate Effect: </span>
            Replacing this key will immediately update all AI operations.
            Make sure the key is valid and has Gemini API quotas enabled.
          </div>
        </div>

        {/* Current Key Indicator (if available) */}
        {currentKey && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Current Key Active
            </span>
            <span className="font-mono text-xs text-gray-600 truncate">
              {currentKey.slice(0, 12)}...{currentKey.slice(-10)}
            </span>
          </div>
        )}

        {/* Key Input Section */}
        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#1C1C1C]">
              New Gemini API Key <span className="text-primary">*</span>
            </label>
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center gap-x-1 text-xs text-primary font-medium hover:underline cursor-pointer"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste from clipboard</span>
            </button>
          </div>

          <div className="relative flex items-center">
            <input
              type={showKey ? "text" : "password"}
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              placeholder="e.g. AIzaSy..."
              autoFocus
              className={`w-full font-mono text-sm px-3.5 py-3 pr-20 bg-white border rounded-xl outline-none transition focus:ring-2 focus:ring-primary/20 ${
                errorMessage
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-primary"
              }`}
            />
            <div className="absolute right-2 flex items-center gap-x-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <span className="text-xs text-red-500 font-medium">
              {errorMessage}
            </span>
          )}
        </div>

        {/* Active Status Switch */}
        <div className="flex flex-col p-3.5 bg-[#F9FAFB] rounded-xl border border-gray-100 gap-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[#1C1C1C] flex items-center gap-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI Image Analysis
              </span>
              <span className="text-[11px] text-gray-400">
                {isActive
                  ? "Enabled: System analyzes uploaded images with Gemini"
                  : "Disabled: Image analysis is paused"}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer ${
                isActive ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="text-[11px] text-gray-400">
          Payload: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 font-mono">{"{ data: { key: \"...\", isActive: " + isActive + " } }"}</code>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-x-3 w-full pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !keyInput.trim()}
            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 cursor-pointer transition flex items-center justify-center gap-x-2 shadow-sm"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? "Replacing Key..." : "Replace Key"}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex-1 bg-[#F4F4F5] text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 cursor-pointer transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default ReplaceGeminiKeyModal;
