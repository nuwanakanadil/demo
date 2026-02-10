import api from "./axios";
import { mapApparelApiToUi } from "../types";

// ✅ GET /api/items/me/mine
export async function getMyItems() {
  const res = await api.get("/items/me/mine");
  // backend returns: { success:true, data:[...] }
  const items = res.data?.data ?? [];
  return {
    ...res.data,
    data: items.map(mapApparelApiToUi),
  };
}
