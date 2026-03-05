export interface ClubResponse {
  id: number;
  publishedAt: string | null;
  createdAt: string;

  ownerName: string;
  phoneNumber: string;
  email: string;

  clubName: string;
  clubCategory: string;
  clubId: string;

  openingTime: string;
  closingTime: string;
  weekday: string;
  weekend: string;

  facilities: string[];
  services: string[];

  latitude: string;
  longitude: string;

  clubAddress: string;
  pincode: string;
  city: string;
  state: string;

  user: User;
  logo: MediaFile | null;
  clubPhotos: MediaFile[];
  club_owner_documents: ClubOwnerDocument[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  isVerified: boolean;
  verification_status: string,
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
  id: number;
  documentName: string;

  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;

  File: MediaFile;
}

export type ClubListResponse = ClubResponse[];
