import api from "./axios";

export interface AdminDashboardResponse {
  success: boolean;
  data: {
    totalUsers: number;
    totalItems: number;
    totalSwaps: number;
    totalReviews: number;
  };
}

export async function getAdminDashboard() {
  const res = await api.get("/admin/dashboard");
  return res.data as AdminDashboardResponse;
}

export async function getAllUsers() {
  const res = await api.get("/admin/users");
  return res.data;
}

export async function suspendUser(email: string) {
  const res = await api.patch(`/admin/users/${email}`);
  return res.data;
}

export async function activateUser(email: string) {
  const res = await api.patch(`/admin/users/active/${email}`);
  return res.data;
}

export async function getAllAdminItems() {
  const res = await api.get("/admin/items");
  return res.data;
}

export async function blockItem(id: string, block: boolean) {
  const res = await api.patch(`/admin/items/${id}/block`, { block });
  return res.data;
}

export async function deleteAdminItem(id: string) {
  const res = await api.delete(`/admin/items/${id}`);
  return res.data;
}

export async function getAllSwaps() {
  const res = await api.get("/admin/swaps");
  return res.data;
}

export async function getAllReviews() {
  const res = await api.get("/admin/reviews");
  return res.data;
}

export async function deleteReview(id: string) {
  const res = await api.delete(`/admin/reviews/${id}`);
  return res.data;
}

export async function createUserByAdmin(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const res = await api.post("/admin/users", data);
;
  return res.data;
}
