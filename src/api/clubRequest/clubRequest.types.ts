/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ClubOwnerActivityLog {
  id?: string | number;
  createdAt: string;
  description: string;
  entityName: string;
  actionType: string;
  clubOwnerDocumentId: string;
}

export interface ClubPhotoItem {
  id?: number | string;
  documentId?: string;
  imageInfo?: string;
  url?: string;
  images?: MediaFile[];
  [key: string]: any;
}

export interface ClubResponse {
  id: number;
  documentId?: string;
  publishedAt: string | null;
  createdAt: string;
  ownerName: string;
  phoneNumber: string;
  email: string;
  clubName: string;
  clubCategory: string;
  clubId: string;
  openingTime?: string;
  closingTime?: string;
  weekday?: string;
  weekend?: string;
  weekdayScheduling?: SchedulingMap | string | null;
  weekendScheduling?: SchedulingMap | string | null;
  scheduling?: SchedulingMap | string | null;
  everyday?: ScheduleDayTiming | string | null;

  facilities?: string[];
  services?: string[];
  club_facilities?: any[];
  club_services?: any[];
  latitude?: string;
  longitude?: string;
  clubAddress?: string;
  pincode?: string;
  city?: string;
  state?: string;
  user?: User;
  logo?: MediaFile | string | null;
  club_photos?: ClubPhotoItem[];
  club_owner_documents?: ClubOwnerDocument[];
  currentStep?: number;
  sendNotifications?: boolean;
  
  [key: string]: any;
}

export interface ScheduleDayTiming {
  openingTime?: string;
  closingTime?: string;
}

export type SchedulingMap = {
  [day: string]: ScheduleDayTiming | undefined;
};

export interface User {
  id: number;
  username: string;
  email: string;
  isVerified: boolean;
  verification_status: string;
}
export interface MediaFile {
  id: number;
  name: string;

  formats: {
    thumbnail?: MediaFormat;
  };

  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;

  provider: string;
  folderPath: string;

  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  locale: string | null;
}
export interface MediaFormat {
  url: string;
  hash: string;
  mime: string;
  name: string;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export interface ClubOwnerDocument {
  id?: number;
  documentId?: string;
  documentName: string;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
  File?: MediaFile;
  [key: string]: any;
}

export type ClubListResponse = ClubResponse[];
