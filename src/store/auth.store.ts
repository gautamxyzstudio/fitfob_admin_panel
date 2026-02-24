import { create } from "zustand";

interface AuthState {
  token: string | null;
  userId: number | null;
  mfa: boolean;
  mfaActive: boolean;
  setMfa: (mfa: boolean) => void;
  setMfaActive: (mfaActive: boolean) => void;
  setSession: (token: string, userId: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  mfa: sessionStorage.getItem("mfa") === "false",
  mfaActive: sessionStorage.getItem("mfaActive") === "false",

  setMfa: (mfa) => {
    localStorage.setItem("mfa", String(mfa));
    sessionStorage.setItem("mfa", String(mfa));
    set({ mfa });
  },
  setMfaActive: (mfaActive) => {
    localStorage.setItem("mfaActive", String(mfaActive));
    sessionStorage.setItem("mfaActive", String(mfaActive));
    set({ mfaActive });
  },
  setSession: (token, userId) => set({ token, userId }),
  logout: () => {
    sessionStorage.removeItem("user");
    localStorage.removeItem("user");
    set({ token: null, userId: null });
  },
}));
