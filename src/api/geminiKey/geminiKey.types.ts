export interface GeminiKeyData {
  id: number;
  documentId: string;
  key: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface GeminiKeyResponse {
  data: GeminiKeyData | null;
  meta?: Record<string, unknown>;
}

export interface GeminiKeyPayload {
  data: {
    key?: string;
    isActive?: boolean;
  };
}
