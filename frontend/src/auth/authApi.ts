import { client } from "../api/client";
import type { AuthUser, Role, TokenResponse } from "./types";

export async function apiRegister(data: {
  full_name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<TokenResponse> {
  const { data: res } = await client.post<TokenResponse>("/api/v1/auth/register", data);
  return res;
}

export async function apiLogin(email: string, password: string): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>("/api/v1/auth/login", { email, password });
  return data;
}

export async function apiLogout(): Promise<void> {
  await client.post("/api/v1/auth/logout");
}

export async function apiRefresh(): Promise<TokenResponse> {
  const { data } = await client.post<TokenResponse>("/api/v1/auth/refresh");
  return data;
}

export async function apiMe(): Promise<AuthUser> {
  const { data } = await client.get<AuthUser>("/api/v1/auth/me");
  return data;
}

export async function apiUpdateProfile(payload: { full_name?: string; profile_image?: string }) {
  const { data } = await client.patch<AuthUser>("/api/v1/auth/me", payload);
  return data;
}

export async function apiChangePassword(current_password: string, new_password: string) {
  const { data } = await client.post<{ message: string }>("/api/v1/auth/change-password", {
    current_password,
    new_password,
  });
  return data;
}

export async function apiForgotPassword(email: string) {
  const { data } = await client.post<{ message: string }>("/api/v1/auth/forgot-password", { email });
  return data;
}

export async function apiResetPassword(token: string, new_password: string) {
  const { data } = await client.post<{ message: string }>("/api/v1/auth/reset-password", {
    token,
    new_password,
  });
  return data;
}

export async function apiVerifyEmail(token: string) {
  const { data } = await client.post<{ message: string }>("/api/v1/auth/verify-email", { token });
  return data;
}

// --- Admin: user management -------------------------------------------

export async function apiListUsers(): Promise<AuthUser[]> {
  const { data } = await client.get<AuthUser[]>("/api/v1/admin/users");
  return data;
}

export async function apiCreateUser(payload: {
  full_name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<AuthUser> {
  const { data } = await client.post<AuthUser>("/api/v1/admin/users", payload);
  return data;
}

export async function apiUpdateUser(
  userId: string,
  payload: { full_name?: string; role?: Role; is_active?: boolean }
): Promise<AuthUser> {
  const { data } = await client.patch<AuthUser>(`/api/v1/admin/users/${userId}`, payload);
  return data;
}

export async function apiDeleteUser(userId: string): Promise<void> {
  await client.delete(`/api/v1/admin/users/${userId}`);
}
