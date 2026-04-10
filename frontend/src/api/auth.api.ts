import api from "./axios";

/* --------------------------------------------------
   AUTH RESPONSE TYPES
   - These interfaces help TypeScript understand
     what the backend returns, so you get autocomplete
     and type-safety in your React components.
-------------------------------------------------- */
export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string; // ✅ matches backend (user._id returned as id)
    name: string;
    email: string;
    role: "user" | "admin";
    isEmailVerified: boolean;
  };
}

/* --------------------------------------------------
   LOGIN
   - Sends email + password to backend /auth/login
   - Backend returns:
     • success
     • token (JWT)
     • user object
   - Caller usually stores token in localStorage
-------------------------------------------------- */
export async function loginUser(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data as LoginResponse;
}

/* --------------------------------------------------
   REGISTER
   - Sends name + email + password to backend /auth/register
   - Backend typically:
     • creates user
     • sends email verification link
     • returns success + message
-------------------------------------------------- */
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
/* --------------------------------------------------
   GET CURRENT USER (/auth/me)
   - Uses JWT token automatically via axios interceptor
   - Returns currently logged-in user's profile
   - Useful to:
     • keep user session alive
     • show profile data
     • protect routes
-------------------------------------------------- */
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

/* --------------------------------------------------
   GET ME
   - Calls backend GET /auth/me
   - Must include Authorization: Bearer <token>
   - If token invalid/expired backend returns 401/403
-------------------------------------------------- */
export async function getMe() {
  const res = await api.get("/auth/me");
  return res.data as MeResponse;
}

/* --------------------------------------------------
   UPDATE ME (/auth/me)
   - Sends PATCH request to update:
     • name (optional)
     • password change (optional)
   - Frontend should validate password matching before calling this
   - Backend should:
     • verify old auth token
     • update requested fields
     • return updated user object + message
-------------------------------------------------- */
export async function updateMe(payload: {
  name?: string;
  newPassword?: string;
  confirmPassword?: string;
}) {
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

/* --------------------------------------------------
   DELETE ME (/auth/me)
   - Sends DELETE request to remove the currently logged-in user
   - Backend should:
     • authenticate token
     • delete user + related data (items, chats, reviews, etc.)
     • return success + message
   - Frontend typically:
     • clears localStorage token
     • redirects to register/login page
-------------------------------------------------- */
export async function deleteMe() {
  const res = await api.delete("/auth/me");
  return res.data as { success: boolean; message: string };
}