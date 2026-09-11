export interface MediaFile {
  id?: number;
  documentId?: string;
  name?: string;
  url?: string;
  width?: number;
  height?: number;
  mime?: string;
  formats?: {
    thumbnail?: {
      url: string;
      width?: number;
      height?: number;
    };
  };
}

export interface ClientListItem {
  id: number;
  documentId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  clientId: string;
  read_by_admins?: number[] | null;
  selfieUpload?: MediaFile | null;
  isRead?: boolean;
  createdAt: string;
  location?: string;
  status?: string;
  user?: {
    id?: number;
    blocked?: boolean;
    verification_status?: string;
  };
}

export interface LocalMembershipPlan {
  id: number;
  documentId?: string;
  planName?: string;
  price?: number;
  monthDuration?: number;
  description?: string;
  isActive?: boolean;
  validUpto?: string;
}

export interface ClubOwnerSummary {
  id: number;
  documentId?: string;
  ownerName?: string;
  phoneNumber?: string;
  email?: string;
  clubName?: string;
  facilities?: string[];
  services?: string[];
  latitude?: string;
  longitude?: string;
  clubAddress?: string;
  pincode?: string;
  city?: string;
  state?: string;
  clubCategory?: string;
}

export interface LocalSubscription {
  id: number;
  documentId?: string;
  membershipType?: string;
  startDate?: string;
  endDate?: string;
  subscriptionStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  local_membership_plan?: LocalMembershipPlan | null;
  club_owner?: ClubOwnerSummary | null;
}

export interface ClientCheckin {
  id: number;
  documentId?: string;
  subscriptionType?: string;
  checkinTime?: string;
  checkoutTime?: string | null;
  createdAt?: string;
  club_owner?: ClubOwnerSummary | null;
}

export interface ClientUser {
  id: number;
  documentId?: string;
  username?: string;
  email?: string;
  confirmed?: boolean;
  blocked?: boolean;
  verification_status?: string;
  rejection_reason?: string | null;
  role?: {
    id?: number;
    name?: string;
    type?: string;
  };
}

export interface ClientDetailResponse {
  id: number;
  documentId: string;
  name: string;
  gender?: string;
  email: string;
  phoneNumber?: string;
  weight?: string;
  height?: string;
  longitude?: string;
  latitude?: string;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  locale?: string | null;
  date_of_birth?: string;
  clientId: string;
  read_by_admins?: number[] | null;
  faceSimilarity?: number;
  selfieUpload?: MediaFile | null;
  governmentId?: MediaFile | null;
  outdoor_subscriptions?: any[];
  user?: ClientUser | null;
  local_subscriptions?: LocalSubscription[];
  client_checkins?: ClientCheckin[];
  isRead?: boolean;
  location?: string;
}

export interface UpdateClientPayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  clientId?: string;
  date_of_birth?: string;
  gender?: string;
  weight?: string;
  height?: string;
  location?: string;
  status?: string;
  isActive?: boolean;
}
