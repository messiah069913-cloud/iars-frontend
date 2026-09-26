// src/lib/api.ts
// Centralized API client for the Autorise frontend.

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token automatically (for admin routes)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("autorise_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

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
  location: string | null;
  status: "authorized" | "revoked" | "suspended" | "archived";
  authorizedAt: string | null;
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
