import axios, { isAxiosError } from "axios";

export type ApiResponse<TData = unknown> = {
  success: boolean;
  message: string;
  data?: TData;
};

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const api = {
  get: async <TData>(url: string, config?: Parameters<typeof axiosInstance.get>[1]) => {
    const response = await axiosInstance.get<ApiResponse<TData>>(url, config);
    return response.data;
  },

  post: async <TData, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Parameters<typeof axiosInstance.post>[2]
  ) => {
    const response = await axiosInstance.post<ApiResponse<TData>>(url, body, config);
    return response.data;
  },

  put: async <TData, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Parameters<typeof axiosInstance.put>[2]
  ) => {
    const response = await axiosInstance.put<ApiResponse<TData>>(url, body, config);
    return response.data;
  },

  patch: async <TData, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: Parameters<typeof axiosInstance.patch>[2]
  ) => {
    const response = await axiosInstance.patch<ApiResponse<TData>>(url, body, config);
    return response.data;
  },

  delete: async <TData>(url: string, config?: Parameters<typeof axiosInstance.delete>[1]) => {
    const response = await axiosInstance.delete<ApiResponse<TData>>(url, config);
    return response.data;
  },
};

export function getApiErrorMessage(error: unknown) {
  if (!isAxiosError<ApiResponse>(error)) {
    return undefined;
  }

  return error.response?.data?.message;
}

export default axiosInstance;
