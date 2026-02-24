export const BASE_URL = "http://localhost:1337";
export const EndPoints = {
  // Login with MFA(Multi Factor Authentication)
  login: `${BASE_URL}/api/login`,
  mfaActive: `${BASE_URL}/api/mfa/activate`,
  mfaVerify: `${BASE_URL}/api/mfa/verify`,
};
