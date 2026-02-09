import api from "./axios";

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;   // ✅ matches backend
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
