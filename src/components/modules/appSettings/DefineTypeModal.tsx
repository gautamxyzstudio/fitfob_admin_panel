import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@mui/material";
import { CloudUpload, Loader2, X } from "lucide-react";
import useSnackBarStore from "../../../store/snackBar.store";
import { uploadFileApi } from "../../../api/appSettings/appSettingsApi";

interface DefineTypeModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  nameLabel: string;
  maxFileSizeMB: number;
  initialData?: {
    name: string;
    logo?: string | null;
    isActive?: boolean;
    clubOwners?: number;
    pendingClubOwners?: number;
  } | null;
  submitButtonLabel?: string;
  onSave: (payload: {
    name: string;
    logoId?: number | null;
    isActive: boolean;
  }) => Promise<void>;
}

const DefineTypeModal: React.FC<DefineTypeModalProps> = ({
  open,
  onClose,
  title,
  nameLabel,
  maxFileSizeMB,
  initialData,
  submitButtonLabel,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevOpenRef = useRef(false);
  const { setSnackBar } = useSnackBarStore();

  useEffect(() => {
    // Only initialize form fields when the modal transitions from closed to open
    if (open && !prevOpenRef.current) {
      setName(initialData?.name || "");
      setIsActive(
        initialData?.isActive !== undefined ? initialData.isActive : true,
      );
      setSelectedFile(null);
      setPreviewUrl(initialData?.logo || null);
      setErrorMessage("");
      setIsSubmitting(false);
    }
    prevOpenRef.current = open;
  }, [open, initialData]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    if (file.size > maxFileSizeMB * 1024 * 1024) {
      setErrorMessage(`File size must not exceed ${maxFileSizeMB}MB`);
      setSnackBar(`File size must not exceed ${maxFileSizeMB}MB`, "error");
      return;
    }

    setErrorMessage("");
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage(`${nameLabel} name is required`);
      return;
    }

    try {
      setIsSubmitting(true);
      let logoId: number | null | undefined = undefined;

      if (selectedFile) {
        // Upload the new file to get media id
        const uploadResult = await uploadFileApi(selectedFile);
        logoId = uploadResult.id;
      } else if (!previewUrl && initialData?.logo) {
        // Logo was previously present and user explicitly removed it
        logoId = null;
      }

      await onSave({
        name: name.trim(),
        logoId,
        isActive,
      });

      onClose();
    } catch (err: any) {
      const msg = err.message || "Failed to save changes";
      setErrorMessage(msg);
      setSnackBar(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasClubOwners =
    (initialData?.clubOwners ?? 0) > 0 ||
    (initialData?.pendingClubOwners ?? 0) > 0;
  const canDeactivate = !hasClubOwners;

  const handleToggleStatus = () => {
    if (isActive && !canDeactivate) {
      setSnackBar(
        `Cannot deactivate ${nameLabel.toLowerCase()}: Assigned to ${
          initialData?.clubOwners || 0
        } club owner(s) and ${initialData?.pendingClubOwners || 0} pending owner(s).`,
        "warning",
      );
      return;
    }
    setIsActive(!isActive);
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
          maxWidth: 480,
          borderRadius: "20px",
          boxShadow: "0 10px 40px 0 rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
        {/* Modal Title */}
        <h3 className="text-xl font-bold text-[#1C1C1C]">{title}</h3>

        {/* Icon Drop Zone Section */}
        <div className="flex flex-col gap-y-1.5">
          <label className="text-xs font-medium text-gray-500">Icon</label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full border border-dashed rounded-xl p-3.5 flex items-center justify-between transition-colors duration-200 ${
              isDragging
                ? "border-primary bg-red-50/50"
                : "border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center gap-x-3 overflow-hidden pr-2">
              {previewUrl ? (
                <div className="relative w-10 h-10 shrink-0 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute -top-1 -right-1 bg-white text-gray-500 hover:text-red-600 rounded-full shadow p-0.5"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-10 h-10 shrink-0 flex items-center justify-center text-primary">
                  <CloudUpload className="w-8 h-8 stroke-[1.5]" />
                </div>
              )}

              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {selectedFile
                    ? selectedFile.name
                    : "Select a file or drag and drop here"}
                </span>
                <span className="text-[11px] text-gray-400">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : `JPG, PNG or PDF, file size no more than ${maxFileSizeMB}MB`}
                </span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) =>
                handleFileChange(e.target.files ? e.target.files[0] : null)
              }
              accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 px-3.5 py-1.5 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Select file
            </button>
          </div>
        </div>

        {/* Name Input */}
        <div className="flex flex-col gap-y-1.5">
          <label className="text-xs font-medium text-gray-500">{nameLabel}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder={`Enter ${nameLabel.toLowerCase()} name`}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-primary transition"
          />
          {errorMessage && (
            <span className="text-xs text-red-500 mt-1">{errorMessage}</span>
          )}
        </div>

        {/* Active Status Switch */}
        <div className="flex flex-col p-3.5 bg-[#F9FAFB] rounded-xl border border-gray-100 gap-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-[#1C1C1C]">Active Status</span>
              <span className="text-[11px] text-gray-400">
                {isActive
                  ? "Active: available for clubs and users"
                  : "Inactive: hidden from selections"}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={handleToggleStatus}
              title={
                isActive && !canDeactivate
                  ? `Cannot deactivate: assigned to ${
                      initialData?.clubOwners || 0
                    } club owner(s) and ${
                      initialData?.pendingClubOwners || 0
                    } pending owner(s)`
                  : undefined
              }
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? "bg-primary" : "bg-gray-300"
              } ${
                isActive && !canDeactivate
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          {isActive && !canDeactivate && (
            <span className="text-[11px] text-amber-600 font-medium">
              Cannot deactivate: Assigned to {initialData?.clubOwners || 0} club owner(s) and {initialData?.pendingClubOwners || 0} pending owner(s).
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-x-3 w-full pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 cursor-pointer transition flex items-center justify-center gap-x-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{submitButtonLabel || (initialData ? "Update" : "Save change")}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="flex-1 bg-[#F4F4F5] text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default DefineTypeModal;
