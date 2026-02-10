import api from "./axios";

export type ApparelCreateInput = {
  title: string;
  description?: string;
  category?: string;
  size: string;
  condition?: string;
  isAvailable?: boolean;
};

export async function createItemWithImages(
  data: ApparelCreateInput,
  files: File[]
) {
  const form = new FormData();

  // text fields
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, String(v));
  });

  // files
  files.forEach((file) => form.append("images", file));

  const res = await api.post("/items", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateItemWithImages(
  id: string,
  data: Record<string, any>,
  files: File[],
  keepImages: string[]
) {
  const form = new FormData();

  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, String(v));
  });

  form.append("keepImages", JSON.stringify(keepImages));
  files.forEach((file) => form.append("images", file));

  const res = await api.put(`/items/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}


export type ApparelImage = { url: string; public_id: string };

export type ApparelDetailsResponse = {
  success: boolean;
  data: {
    _id?: string;
    id?: string;
    title?: string;
    name?: string;
    description?: string;
    category?: string;
    size?: string;
    condition?: string;
    isAvailable?: boolean;
    images?: ApparelImage[];
    owner?: { id?: string; _id?: string; name?: string };
    ownerId?: string;
    ownerName?: string;
  };
};

export async function getItemById(id: string) {
  const res = await api.get(`/items/${id}`);
  return res.data as ApparelDetailsResponse;
}

