import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/auth.store";
import { getLocalTimezone } from "../utility/dayjs";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const token = useAuthStore.getState()?.token;

    // Normalize headers safely for Axios v1+ TypeScript types
    const headers = AxiosHeaders.from(config.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Attach the user's local IANA timezone to every outgoing request
    headers.set("X-Timezone", getLocalTimezone());

    config.headers = headers;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
