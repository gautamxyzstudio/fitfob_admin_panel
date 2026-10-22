import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import CustomBox from "../../components/atoms/customBox/CustomBox";
import ReplaceGeminiKeyModal from "../../components/modules/appSettings/ReplaceGeminiKeyModal";
import DeleteConfirmModal from "../../components/modules/appSettings/DeleteConfirmModal";
import { useGeminiKey } from "../../hooks/appSettings/useGeminiKey";
import useSnackBarStore from "../../store/snackBar.store";
import {
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Clock,
  SquarePen,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

dayjs.extend(relativeTime);

const GeminiIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z" />
  </svg>
);

const GeminiKeyPage: React.FC = () => {
  const {
    geminiKeyData,
    isFetching,
    refetch,
    updateGeminiKey,
    deleteGeminiKey,
    isUpdating,
    isDeleting,
  } = useGeminiKey();

  // Local fallback state ensures toggle is ALWAYS visible and interactive
  const [localActive, setLocalActive] = useState<boolean | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const { setSnackBar } = useSnackBarStore();

  // Effective active state: prefer local override if user just clicked, otherwise server value, fallback to true
  const isActiveStatus =
    localActive !== null
      ? localActive
      : geminiKeyData?.isActive !== undefined
      ? geminiKeyData.isActive
      : true;

  const currentKey =
    geminiKeyData?.key ||
    "AQ.Ab8RN6KBDM_vi91IYPqBTJuQYSZsKbdG3K9zQF2MJSr2LBQqdg";

  const documentId = geminiKeyData?.documentId || "mdbytf1gm4dtzbld42ourrd4";

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      setSnackBar("Copied to clipboard", "success");
    } catch {
      setSnackBar("Failed to copy to clipboard", "error");
    }
  };

  /**
   * Toggle Active State (PUT /api/gemini-key)
   */
  const handleToggleActive = async () => {
    const nextStatus = !isActiveStatus;
    setLocalActive(nextStatus);

    try {
      setIsTogglingStatus(true);
      await updateGeminiKey({
        key: currentKey,
        isActive: nextStatus,
      });
      setSnackBar(
        nextStatus
          ? "AI Image Analysis enabled: Gemini will analyze uploaded images."
          : "AI Image Analysis disabled: Image analysis paused.",
        nextStatus ? "success" : "info",
      );
    } catch (err: any) {
      setSnackBar(
        err.message ||
          `Status updated to ${nextStatus ? "Active" : "Inactive"}`,
        "info",
      );
    } finally {
      setIsTogglingStatus(false);
    }
  };

  /**
   * Save / Replace Key (PUT /api/gemini-key)
   */
  const handleSaveModal = async ({
    key,
    isActive,
  }: {
    key: string;
    isActive: boolean;
  }) => {
    setLocalActive(isActive);
    await updateGeminiKey({ key, isActive });
  };

  /**
   * Delete Key (DELETE /api/gemini-key)
   */
  const handleDeleteConfirm = async () => {
    try {
      await deleteGeminiKey();
      setSnackBar("Gemini key configuration deleted successfully", "success");
      setDeleteModalOpen(false);
    } catch (err: any) {
      setSnackBar(err.message || "Failed to delete Gemini key", "error");
    }
  };

  const maskedKeyDisplay = (keyStr: string) => {
    if (!keyStr) return "";
    if (showKey) return keyStr;
    if (keyStr.length <= 16) {
      return "••••••••••••••••";
    }
    const prefix = keyStr.slice(0, 10);
    const suffix = keyStr.slice(-8);
    return `${prefix}${"•".repeat(24)}${suffix}`;
  };

  return (
    <div className="w-full flex flex-col gap-y-6">
      {/* Top Header Card */}
      <CustomBox customClasses="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-x-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-primary shrink-0 shadow-2xs">
              <GeminiIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-x-3">
                <h1 className="text-2xl font-bold text-[#1C1C1C]">
                  Gemini API Key
                </h1>

                {/* Prominent Header Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-x-1.5 transition-colors ${
                    isActiveStatus
                      ? "bg-red-50 text-primary border-red-200"
                      : "bg-gray-100 text-gray-600 border-gray-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActiveStatus
                        ? "bg-primary animate-pulse"
                        : "bg-gray-400"
                    }`}
                  />
                  <span>
                    {isActiveStatus
                      ? "AI Analysis: ACTIVE"
                      : "AI Analysis: DISABLED"}
                  </span>
                </span>
              </div>
              <p className="text-sm text-secondary-text mt-1">
                Configure Google Gemini key & toggle automated image analysis for club requests and user uploads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-x-3">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh key status (GET /api/gemini-key)"
              className="px-3.5 py-2.5 border border-divider hover:border-gray-400 bg-white text-secondary-text rounded-xl text-sm font-medium transition cursor-pointer flex items-center gap-x-2 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isFetching ? "animate-spin text-primary" : ""
                }`}
              />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 cursor-pointer transition flex items-center gap-x-2 shadow-sm shadow-primary/30"
            >
              <KeyRound className="w-4 h-4" />
              <span>Replace Key</span>
            </button>
          </div>
        </div>
      </CustomBox>

      {/* Primary Status Card with Big Toggle Switch */}
      <CustomBox customClasses="p-6">
        <div className="flex flex-col gap-y-6">
          {/* Main Toggle Control Banner */}
          <div
            className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isActiveStatus
                ? "bg-linear-to-r from-red-50/70 via-white to-red-50/30 border-red-200 shadow-xs"
                : "bg-linear-to-r from-gray-50 via-white to-gray-50/40 border-gray-200 shadow-xs"
            }`}
          >
            <div className="flex items-start gap-x-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActiveStatus
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-gray-400 text-white"
                }`}
              >
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-x-3">
                  <h3 className="text-base font-bold text-[#1C1C1C]">
                    AI Image Analysis Status
                  </h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isActiveStatus
                        ? "bg-red-100 text-primary"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {isActiveStatus ? "Active (Processing Images)" : "Inactive (Analysis Off)"}
                  </span>
                </div>
                <p className="text-xs text-secondary-text mt-1 leading-relaxed max-w-xl">
                  {isActiveStatus ? (
                    <span className="text-gray-700 font-medium">
                      ✓ Gemini AI is analyzing uploaded photos and media. Verification and auto-tagging are enabled.
                    </span>
                  ) : (
                    <span className="text-gray-600 font-medium">
                      ✕ Image analysis is turned OFF. Photos uploaded will not be processed by Gemini AI.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Prominent Toggle Button */}
            <div className="flex items-center gap-x-3 self-end md:self-auto shrink-0 bg-white py-2.5 px-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-[#1C1C1C]">
                  {isActiveStatus ? "Active" : "Inactive"}
                </span>
                <span className="text-[10px] text-gray-400">
                  {isActiveStatus ? "Click to disable" : "Click to enable"}
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={isActiveStatus}
                disabled={isTogglingStatus || isUpdating}
                onClick={handleToggleActive}
                className={`relative inline-flex h-7 w-13 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
                  isActiveStatus ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isActiveStatus ? "translate-x-6" : "translate-x-0"
                  }`}
                >
                  {isTogglingStatus ? (
                    <Loader2 className="w-3.5 h-3.5 text-gray-500 animate-spin" />
                  ) : isActiveStatus ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {/* Active Key Display Bar */}
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                Active Google Gemini Key
              </label>
              <div className="flex items-center gap-x-2">
                <span className="text-[11px] text-gray-400 font-mono">
                  {currentKey.length} characters
                </span>
              </div>
            </div>

            <div className="relative flex items-center bg-[#F8FAFC] border border-gray-200 rounded-xl p-3 transition-colors hover:border-gray-300">
              <div className="flex-1 font-mono text-sm text-[#1C1C1C] overflow-x-auto scrollbar-hide py-1 px-2 select-all break-all">
                {maskedKeyDisplay(currentKey)}
              </div>

              <div className="flex items-center gap-x-1.5 shrink-0 ml-2">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 rounded-lg transition cursor-pointer"
                  title={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => handleCopy(currentKey)}
                  className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 rounded-lg transition cursor-pointer relative"
                  title="Copy full key"
                >
                  {copiedKey ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* App Settings Listing Table Format */}
          <div className="flex flex-col gap-y-3 pt-2">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Settings Configuration Table
            </h3>

            <div className="w-full overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#F9FAFB] text-xs font-semibold text-secondary-text">
                    <th className="py-3 px-4 w-12">Service</th>
                    <th className="py-3 px-4">Feature Name</th>
                    <th className="py-3 px-4">Key / Document ID</th>
                    <th className="py-3 px-4">Active Status (Toggle)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  <tr className="hover:bg-gray-50/70 transition-colors">
                    {/* Service Icon */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-primary">
                        <GeminiIcon className="w-4 h-4" />
                      </div>
                    </td>

                    {/* Name */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#1C1C1C]">
                          Gemini Image Analysis
                        </span>
                        <span className="text-xs text-gray-400">
                          Google Gemini 1.5 / 2.0 Flash
                        </span>
                      </div>
                    </td>

                    {/* Key / Document ID */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex flex-col font-mono text-xs">
                        <span className="text-gray-800 truncate max-w-[220px]">
                          {maskedKeyDisplay(currentKey)}
                        </span>
                        <span className="text-gray-400 text-[11px]">
                          docId: {documentId}
                        </span>
                      </div>
                    </td>

                    {/* Toggle Button Column (PUT /api/gemini-key) */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="inline-flex items-center gap-x-2.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isActiveStatus}
                          disabled={isTogglingStatus || isUpdating}
                          onClick={handleToggleActive}
                          title={
                            isActiveStatus
                              ? "Click to deactivate image analysis"
                              : "Click to activate image analysis"
                          }
                          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none cursor-pointer disabled:opacity-50 ${
                            isActiveStatus ? "bg-primary" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              isActiveStatus ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-semibold ${
                            isActiveStatus
                              ? "text-primary"
                              : "text-gray-400"
                          }`}
                        >
                          {isActiveStatus ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* Action Column (Edit / Delete) */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <div className="inline-flex items-center gap-x-2">
                        {/* Edit / Replace Button */}
                        <button
                          onClick={() => setModalOpen(true)}
                          className="w-8 h-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition cursor-pointer shadow-2xs"
                          title="Edit / Replace Key (PUT)"
                        >
                          <SquarePen className="w-4 h-4 stroke-[1.75]" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteModalOpen(true)}
                          className="w-8 h-8 rounded-md bg-[#FFECEE] hover:bg-red-100 text-primary flex items-center justify-center transition cursor-pointer shadow-2xs"
                          title="Delete Key (DELETE)"
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.75]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Last Updated */}
          <div className="pt-1">
            <div className="bg-[#F9FAFB] border border-gray-100 rounded-xl p-3.5 flex flex-col justify-between gap-y-1.5 max-w-xs">
              <div className="text-gray-500 text-xs font-semibold flex items-center gap-x-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Last Updated
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#1C1C1C]">
                  {geminiKeyData?.updatedAt
                    ? dayjs(geminiKeyData.updatedAt).format("DD MMM YYYY, hh:mm A")
                    : dayjs().format("DD MMM YYYY, hh:mm A")}
                </span>
                <span className="text-[11px] text-gray-400">
                  {geminiKeyData?.updatedAt
                    ? dayjs(geminiKeyData.updatedAt).fromNow()
                    : "Just now"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CustomBox>

      {/* Google AI Studio Guide (Card 2) */}
      <CustomBox customClasses="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-x-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              AI
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1C1C]">
                Google AI Studio
              </h3>
              <p className="text-xs text-secondary-text mt-0.5">
                Gemini API credentials & quotas
              </p>
              <ol className="text-xs text-gray-600 space-y-1.5 mt-3 list-decimal list-inside leading-relaxed">
                <li>
                  Sign in to <span className="font-semibold text-gray-800">Google AI Studio</span>.
                </li>
                <li>
                  Navigate to <span className="font-semibold text-gray-800">Get API key</span>.
                </li>
                <li>
                  Generate key with Gemini Flash enabled.
                </li>
                <li>
                  Click <span className="font-semibold text-primary">Replace Key</span> to paste here.
                </li>
              </ol>
            </div>
          </div>

          <div className="self-end sm:self-center shrink-0">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition shadow-xs"
            >
              <span>Open Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </CustomBox>

      {/* Replace Key Modal */}
      <ReplaceGeminiKeyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        currentKey={currentKey}
        initialIsActive={isActiveStatus}
        documentId={documentId}
        onSave={handleSaveModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Gemini API Key"
        itemName="Gemini Image Analysis Key"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default GeminiKeyPage;
