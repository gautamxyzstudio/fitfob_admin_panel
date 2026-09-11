export interface FacilityOrClubTypeItem {
  documentId: string;
  name: string;
  logo: string | null;
  isActive: boolean;
  clubOwners?: number;
  pendingClubOwners?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacilityOrClubTypePayload {
  name: string;
  isActive: boolean;
  logo?: number | null;
}

export interface UploadFileResponse {
  id: number;
  url: string;
  name?: string;
}
