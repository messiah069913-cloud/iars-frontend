// src/lib/admin-auth.ts
// Admin authentication helpers — JWT storage and retrieval.

const TOKEN_KEY = "autorise_token";
const USER_KEY = "autorise_user";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  ministry: { id: string; name: string } | null;
}

export function saveSession(token: string, user: AdminUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}