import axios from "axios";
import { EndPoints } from "../endpoints";

interface Login {
  identifier: string;
  password: string;
}
interface mfaActive {
  identifier: string;
  otp: string;
}
interface mfaVerify {
  tempToken: string;
  password: string;
  otp: string;
}
export const loginApi = async (data: Login) => {
  try {
    const response = await axios.post(EndPoints.login, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const mfaActiveApi = async (data: mfaActive) => {
  try {
    const response = await axios.post(EndPoints.mfaActive, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

export const mfaVerifyApi = async (data: mfaVerify) => {
  try {
    const response = await axios.post(EndPoints.mfaVerify, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};
