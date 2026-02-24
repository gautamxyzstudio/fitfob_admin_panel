import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";
import { loginApi, mfaActiveApi, mfaVerifyApi } from "../../api/auth/authApi";

export const useLogin = () => {
  return useMutation({
    mutationFn: loginApi,
  });
};

export const useMfaActive = () => {
  const { setMfaActive } = useAuthStore();

  return useMutation({
    mutationFn: mfaActiveApi,
    onSuccess: (data) => {
      console.log("MFA Active Response:", data);
      if (data.message === "MFA successfully enabled") {
        setMfaActive(true);
      } else {
        setMfaActive(false);
      }
    },
  });
};

export const useMfaVerify = () => {
  return useMutation({
    mutationFn: mfaVerifyApi,
    onSuccess: (data) => {
      console.log("MFA Verify Response:", data);
    },
  });
};
