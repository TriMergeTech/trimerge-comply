const BASE = "http://localhost:4000/api";

async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data as T;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
}

export interface SignupResponse {
  user: AuthUser;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
}

export function signup(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  return post<SignupResponse>("/auth/signup", data);
}

export function verifyOtp(data: { email: string; otp: string }) {
  return post<MessageResponse>("/auth/verify-otp", data);
}

export function resendOtp(data: { email: string }) {
  return post<MessageResponse>("/auth/resend-otp", data);
}

export function login(data: { email: string; password: string }) {
  return post<LoginResponse>("/auth/login", data);
}

export function forgotPassword(data: { email: string }) {
  return post<MessageResponse>("/auth/forgot-password", data);
}

export function resetPassword(data: { token: string; newPassword: string }) {
  return post<MessageResponse>("/auth/reset-password", data);
}

export function logout(accessToken: string) {
  return post<MessageResponse>("/auth/logout", {}, accessToken);
}
