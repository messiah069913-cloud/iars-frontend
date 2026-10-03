// src/lib/api.ts
// Centralized API client for the Autorise frontend.
// Includes automatic retry for transient network failures.

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000, // 20 seconds — generous for slow networks
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("autorise_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Retry on transient errors (network, timeout, 503)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    // Initialize retry count
    config.__retryCount = config.__retryCount || 0;

    // Do not retry on:
    // - 401, 403, 404, 409, 400 (client errors — retrying won't help)
    // - Already retried 3 times
    const status = error.response?.status;
    const noRetryStatuses = [400, 401, 403, 404, 409, 422];
    const shouldRetry =
      config.__retryCount < 3 &&
      (!status || !noRetryStatuses.includes(status)) &&
      (error.code === "ECONNABORTED" || // timeout
        error.code === "ERR_NETWORK" || // network error
        !error.response || // no response
        status === 502 || // bad gateway
        status === 503 || // service unavailable
        status === 504); // gateway timeout

    if (!shouldRetry) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;

    // Exponential backoff: 800ms, 1600ms, 3200ms
    const delay = Math.pow(2, config.__retryCount) * 400;
    await new Promise((resolve) => setTimeout(resolve, delay));

    console.log(
      `[API] Retrying request (attempt ${config.__retryCount}/3): ${config.method?.toUpperCase()} ${config.url}`
    );

    return api(config);
  }
);

// ---------- Public endpoints ----------

export interface Ministry {
  id: string;
  name: string;
  country: string;
  authorizedInstitutionCount: number;
}

export interface Institution {
  id: string;
  name: string;
  registrationNumber: string | null;
  logoUrl: string | null;
  location: string | null;
  status:
    | "authorized"
    | "revoked"
    | "suspended"
    | "archived"
    | "pending_renewal"
    | "expired";
  authorizedAt: string | null;
  expiresAt: string | null;
  lastVerifiedAt: string;
  ministry: {
    id: string;
    name: string;
    country?: { name: string };
  };
}

export interface InstitutionsResponse {
  total: number;
  limit: number;
  offset: number;
  results: Institution[];
}

export async function getMinistries(): Promise<Ministry[]> {
  const { data } = await api.get<Ministry[]>("/api/ministries");
  return data;
}

export async function getInstitutions(params: {
  search?: string;
  ministry?: string;
  limit?: number;
  offset?: number;
}): Promise<InstitutionsResponse> {
  const { data } = await api.get<InstitutionsResponse>("/api/institutions", {
    params,
  });
  return data;
}

export async function getInstitution(id: string): Promise<Institution> {
  const { data } = await api.get<Institution>(`/api/institutions/${id}`);
  return data;
}

// ---------- Auth endpoints ----------

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "super_admin";
    ministry: { id: string; name: string } | null;
  };
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  return data;
}