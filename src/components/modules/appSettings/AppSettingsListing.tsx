import React, { useState } from "react";
import CustomBox from "../../atoms/customBox/CustomBox";
import DefineTypeModal from "./DefineTypeModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import type {
  FacilityOrClubTypeItem,
  FacilityOrClubTypePayload,
} from "../../../api/appSettings/appSettings.types";
import useSnackBarStore from "../../../store/snackBar.store";
import { Plus, SquarePen, Trash2, Image as ImageIcon } from "lucide-react";

interface AppSettingsListingProps {
  title: string;
  nameColumnHeader: string; // e.g. "Name" or "Club type"
  items: FacilityOrClubTypeItem[];
  isLoading: boolean;
  maxFileSizeMB: number; // 10 for Facilities, 2 for Club Types
  modalTitleAdd: string; // "Add Club Facility" or "Define Club Type"
  modalTitleEdit: string; // "Edit Club Facility" or "Define Club Type"
  nameLabel: string; // "Facilities" or "Club Type"
  onCreate: (payload: FacilityOrClubTypePayload) => Promise<any>;
  onUpdate: (
    docId: string,
    payload: Partial<FacilityOrClubTypePayload>,
  ) => Promise<any>;
  onDelete: (docId: string) => Promise<any>;
}

const AppSettingsListing: React.FC<AppSettingsListingProps> = ({
  title,
  nameColumnHeader,
  items,
  isLoading,
  maxFileSizeMB,
  modalTitleAdd,
  modalTitleEdit,
  nameLabel,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FacilityOrClubTypeItem | null>(
    null,
  );

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] =
    useState<FacilityOrClubTypeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { setSnackBar } = useSnackBarStore();

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: FacilityOrClubTypeItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleOpenDelete = (item: FacilityOrClubTypeItem) => {
    const isDeletable =
      (item.clubOwners ?? 0) === 0 && (item.pendingClubOwners ?? 0) === 0;

    if (!isDeletable) {
      setSnackBar(
        `Cannot delete "${item.name}": It is assigned to ${item.clubOwners || 0} club owner(s) and ${item.pendingClubOwners || 0
        } pending club owner(s).`,
        "warning",
      );
      return;
    }

    setDeletingItem(item);
    setDeleteModalOpen(true);
  };

  const handleToggleActive = async (item: FacilityOrClubTypeItem) => {
    const hasClubOwners =
      (item.clubOwners ?? 0) > 0 || (item.pendingClubOwners ?? 0) > 0;

    if (item.isActive && hasClubOwners) {
      setSnackBar(
        `Cannot deactivate "${item.name}": It is currently assigned to ${item.clubOwners || 0
        } club owner(s) and ${item.pendingClubOwners || 0} pending club owner(s).`,
        "warning",
      );
      return;
    }

    try {
      setTogglingId(item.documentId);
      const updatedStatus = !item.isActive;
      await onUpdate(item.documentId, {
        name: item.name,
        isActive: updatedStatus,
      });
      setSnackBar(
        `"${item.name}" is now ${updatedStatus ? "Active" : "Inactive"}`,
        "success",
      );
    } catch (err: any) {
      setSnackBar(err.message || "Failed to update status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSave = async ({
    name,
    logoId,
    isActive,
  }: {
    name: string;
    logoId?: number | null;
    isActive: boolean;
  }) => {
    if (editingItem) {
      // Update existing item
      const payload: Partial<FacilityOrClubTypePayload> = {
        name,
        isActive,
      };
      if (logoId !== undefined) {
        payload.logo = logoId;
      }

      await onUpdate(editingItem.documentId, payload);
      setSnackBar(`${nameLabel} updated successfully`, "success");
    } else {
      // Create new item
      const payload: FacilityOrClubTypePayload = {
        name,
        isActive,
        ...(logoId !== undefined ? { logo: logoId } : {}),
      };

      await onCreate(payload);
      setSnackBar(`${nameLabel} created successfully`, "success");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      setIsDeleting(true);
      await onDelete(deletingItem.documentId);
      setSnackBar(`${nameLabel} deleted successfully`, "success");
      setDeleteModalOpen(false);
      setDeletingItem(null);
    } catch (err: any) {
      setSnackBar(err.message || "Failed to delete item", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <CustomBox customClasses="p-6 h-full flex flex-col gap-y-4">
      {/* Top Header */}
      <div className="flex justify-between items-center pb-2">
        <h2 className="text-xl font-bold text-[#1C1C1C]">{title}</h2>
        <button
          onClick={handleOpenAdd}
          className="bg-primary hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-x-1.5 shadow-sm transition-all duration-200 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="w-full flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-[#F2F2F2] text-[#6B7280] text-sm font-medium">
              <th className="py-3 px-4 rounded-l-xl w-24">Icon</th>
              <th className="py-3 px-4">{nameColumnHeader}</th>
              <th className="py-3 px-4 w-32">Status</th>
              <th className="py-3 px-4 text-right rounded-r-xl w-28">Action</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100">
            {isLoading && items.length === 0 ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-40 h-4 bg-gray-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-16 h-4 bg-gray-200 rounded" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex gap-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-md" />
                      <div className="w-8 h-8 bg-gray-200 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))
            ) : items.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={4} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-y-2">
                    <ImageIcon className="w-10 h-10 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">
                      No {title.toLowerCase()} found
                    </p>
                    <p className="text-xs text-gray-400">
                      Click "+ Add New" to add your first {nameLabel.toLowerCase()}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              items.map((item) => {
                const isDeletable =
                  (item.clubOwners ?? 0) === 0 &&
                  (item.pendingClubOwners ?? 0) === 0;

                return (
                  <tr
                    key={item.documentId}
                    className="hover:bg-gray-50/70 transition-colors duration-150"
                  >
                    {/* Icon Column */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                        {item.logo ? (
                          <img
                            src={item.logo}
                            alt={item.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              // Fallback on broken image link
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    </td>

                    {/* Name Column */}
                    <td className="py-3.5 px-4 align-middle">
                      <span className="text-sm font-medium text-[#1C1C1C]">
                        {item.name}
                      </span>
                    </td>

                    {/* Status Column with Active/Inactive Toggle */}
                    <td className="py-3.5 px-4 align-middle">
                      {(() => {
                        const hasClubOwners =
                          (item.clubOwners ?? 0) > 0 ||
                          (item.pendingClubOwners ?? 0) > 0;
                        const cannotDeactivate =
                          item.isActive && hasClubOwners;

                        return (
                          <div className="inline-flex items-center gap-x-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={item.isActive}
                              disabled={
                                togglingId === item.documentId ||
                                cannotDeactivate
                              }
                              onClick={() => handleToggleActive(item)}
                              title={
                                cannotDeactivate
                                  ? `Cannot deactivate: Assigned to ${item.clubOwners || 0
                                  } club owner(s) and ${item.pendingClubOwners || 0
                                  } pending owner(s)`
                                  : item.isActive
                                    ? "Click to deactivate"
                                    : "Click to activate"
                              }
                              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${item.isActive ? "bg-green-500" : "bg-gray-300"
                                } ${cannotDeactivate
                                  ? "cursor-not-allowed opacity-60"
                                  : togglingId === item.documentId
                                    ? "opacity-50 cursor-wait"
                                    : "cursor-pointer"
                                }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.isActive
                                    ? "translate-x-4"
                                    : "translate-x-0"
                                  }`}
                              />
                            </button>
                            <span
                              className={`text-xs font-semibold ${item.isActive
                                  ? "text-green-600"
                                  : "text-gray-400"
                                }`}
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4 align-middle text-right">
                      <div className="inline-flex items-center gap-x-2.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="w-8 h-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition cursor-pointer shadow-2xs"
                          title="Edit"
                        >
                          <SquarePen className="w-4 h-4 stroke-[1.75]" />
                        </button>

                        {/* Delete Button (Active only when clubOwner and pendingClubOwner is 0) */}
                        <button
                          onClick={() => handleOpenDelete(item)}
                          disabled={!isDeletable}
                          className={`w-8 h-8 rounded-md flex items-center justify-center transition ${isDeletable
                              ? "bg-[#FFECEE] hover:bg-red-100 text-primary cursor-pointer"
                              : "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                            }`}
                          title={
                            isDeletable
                              ? "Delete"
                              : `Cannot delete: Assigned to ${item.clubOwners || 0
                              } club owner(s) and ${item.pendingClubOwners || 0
                              } pending owner(s)`
                          }
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.75]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Define/Edit Modal */}
      <DefineTypeModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? modalTitleEdit : modalTitleAdd}
        nameLabel={nameLabel}
        maxFileSizeMB={maxFileSizeMB}
        initialData={
          editingItem
            ? {
              name: editingItem.name,
              logo: editingItem.logo,
              isActive: editingItem.isActive,
              clubOwners: editingItem.clubOwners,
              pendingClubOwners: editingItem.pendingClubOwners,
            }
            : null
        }
        onSave={handleSave}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingItem(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${nameLabel}`}
        itemName={deletingItem?.name}
        isDeleting={isDeleting}
      />
    </CustomBox>
  );
};

export default AppSettingsListing;
