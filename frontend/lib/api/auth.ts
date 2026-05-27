const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

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
  return (data.data ?? data) as T;
}

async function patch<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return (data.data ?? data) as T;
}

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return (data.data ?? data) as T;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  createdAt?: string;
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
  phone: string;
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

export function getMe(accessToken: string) {
  return get<{ user: AuthUser }>("/auth/me", accessToken);
}

export function refreshTokens(refreshToken: string) {
  return post<LoginResponse>("/auth/refresh", { refreshToken });
}

// Update name and/or company name for the logged-in user
export function changeName(
  data: { name?: string; companyName?: string },
  token: string
) {
  return patch<{ user: AuthUser }>("/auth/change-name", data, token);
}

// Step 1 of password change: verify old password, trigger OTP email
export function changePassword(
  data: { oldPassword: string; newPassword: string },
  token: string
) {
  return patch<MessageResponse>("/auth/change-password", data, token);
}

// Step 2 of password change: submit OTP to complete the change
export function verifyChangePassword(data: { otp: string }, token: string) {
  return post<MessageResponse>("/auth/change-password/verify", data, token);
}
