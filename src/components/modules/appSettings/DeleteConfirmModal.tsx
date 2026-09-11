import React from "react";
import { Dialog } from "@mui/material";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  itemName?: string;
  isDeleting?: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  itemName,
  isDeleting = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        "& .MuiPaper-root": {
          padding: "28px 24px",
          borderRadius: "20px",
          boxShadow: "0 10px 40px 0 rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          alignItems: "center",
        },
      }}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-primary mb-3">
        <Trash2 className="w-6 h-6" />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-xs text-gray-500 mb-6">
        Are you sure you want to delete{" "}
        {itemName ? <span className="font-semibold text-gray-700">"{itemName}"</span> : "this item"}
        ? This action cannot be undone.
      </p>

      <div className="flex flex-row gap-x-3 w-full">
        <button
          type="button"
          disabled={isDeleting}
          onClick={onConfirm}
          className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 cursor-pointer transition flex items-center justify-center gap-x-2"
        >
          {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Delete</span>
        </button>

        <button
          type="button"
          disabled={isDeleting}
          onClick={onClose}
          className="flex-1 bg-[#F4F4F5] text-gray-700 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 cursor-pointer transition"
        >
          Cancel
        </button>
      </div>
    </Dialog>
  );
};

export default DeleteConfirmModal;
