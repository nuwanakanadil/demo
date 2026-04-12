import api from "./axios";

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    isEmailVerified: boolean;
  };
}

export interface MeResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    isEmailVerified: boolean;
  };
}

export async function loginUser(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data as LoginResponse;
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const res = await api.post("/auth/register", {
    name,
    email,
    password,
  });
  return res.data;
}

export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string
) => {
  const res = await api.post("/auth/reset-password", {
    token,
    newPassword,
    confirmPassword,
  });
  return res.data;
};

export async function getMe() {
  const res = await api.get("/auth/me");
  return res.data as MeResponse;
}

export async function updateMe(
  payload: {
    name?: string;
    newPassword?: string;
    confirmPassword?: string;
  }
) {
  const res = await api.patch("/auth/me", payload);
  return res.data as {
    success: boolean;
    message: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: "user" | "admin";
      isEmailVerified: boolean;
    };
  };
}

export async function deleteMe() {
  const res = await api.delete("/auth/me");
  return res.data as { success: boolean; message: string };
}
