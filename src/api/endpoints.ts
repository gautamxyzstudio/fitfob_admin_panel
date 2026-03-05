export const BASE_URL = import.meta.env.VITE_BASE_URL;
export const EndPoints = {
  // Login with MFA(Multi Factor Authentication)
  login: `${BASE_URL}/api/login`,
  mfaActive: `${BASE_URL}/api/mfa/activate`,
  mfaVerify: `${BASE_URL}/api/mfa/verify`,
  forgotPassword: `${BASE_URL}/api/auth/forgot-password`,
  verifyOtp: `${BASE_URL}/api/auth/verify-otp`,
  resetPassword: `${BASE_URL}/api/auth/reset-password`,

  // Club Request
  unverifiedClubOwners: (search: string = "") =>
    `${BASE_URL}/api/club-owners/unverified?search=${search}`,
  verifiedClubOwners: (search: string = "") =>
    `${BASE_URL}/api/club-owners?search=${search}`,
  getClubOwner: (ownerId: number) => `${BASE_URL}/api/club-owners/${ownerId}`,
  verifyApproval: (userId: number) =>
    `${BASE_URL}/api/verify-approval/verification-approved/${userId}`,


  // /api/verify-approval
};
