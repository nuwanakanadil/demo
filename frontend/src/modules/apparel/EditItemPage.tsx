import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { ArrowLeft, ImagePlus } from "lucide-react";
import api from "../../api/axios";
import { updateItemWithImages } from "../../api/apparel.api";

// UI lists (same as Add)
const CATEGORIES = ["Tops", "Bottoms", "Outerwear", "Shoes", "Accessories"] as const;
const CONDITIONS = ["New", "Like New", "Good", "Fair"] as const;
const SIZES = ["XS","S","M","L","XL","XXL","US 6","US 7","US 8","US 9","US 10","US 11","One Size"];

// Mapping (UI -> API enums)
const categoryToApi: Record<string, string> = {
  Tops: "TOP",
  Bottoms: "BOTTOM",
  Outerwear: "OUTERWEAR",
  Shoes: "SHOES",
  Accessories: "ACCESSORY",
};
const conditionToApi: Record<string, string> = {
  New: "NEW",
  "Like New": "LIKE_NEW",
  Good: "GOOD",
  Fair: "FAIR",
};

// Reverse mapping (API -> UI)
const categoryFromApi: Record<string, string> = {
  TOP: "Tops",
  BOTTOM: "Bottoms",
  OUTERWEAR: "Outerwear",
  SHOES: "Shoes",
  ACCESSORY: "Accessories",
  OTHER: "Tops",
};
const conditionFromApi: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  WORN: "Fair",
};

type Props = {
  itemId: string;
  onCancel: () => void;
  onSaved?: () => void;
};

export function EditItemPage({ itemId, onCancel, onSaved }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Tops");
  const [size, setSize] = useState("M");
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number]>("Good");

  // images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // Load item
  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const res = await api.get(`/items/${itemId}`);
        const item = res.data?.data;

        setTitle(item.title || "");
        setSize(item.size || "M");
        setExistingImages(item.images || []);

        setCategory((categoryFromApi[item.category] as any) || "Tops");
        setCondition((conditionFromApi[item.condition] as any) || "Good");
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load item");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [itemId]);

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setNewFiles(selected);
    setNewPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((x) => x !== url));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload = {
        title,
        category: categoryToApi[category] || "OTHER",
        size,
        condition: conditionToApi[condition] || "GOOD",
      };

      // keepImages is the existingImages after user removed some
      await updateItemWithImages(itemId, payload, newFiles, existingImages);

      onSaved?.();
      onCancel(); // go back
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-10">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onCancel} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Item</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Update item details and images</p>
        </CardHeader>

        <CardContent>
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSave} className="space-y-6">
            <Input
              id="title"
              label="Item Name"
              placeholder="e.g. Vintage Denim Jacket"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Category */}
            <div className="w-full space-y-1">
              <label className="text-sm font-medium text-neutral-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div className="w-full space-y-1">
              <label className="text-sm font-medium text-neutral-700">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              >
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div className="w-full space-y-1">
              <label className="text-sm font-medium text-neutral-700">Condition</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CONDITIONS.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setCondition(cond)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-all ${
                      condition === cond
                        ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500 ring-opacity-20"
                        : "border-neutral-300 text-neutral-600 hover:border-brand-300"
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Existing images */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Current Images</label>

              {existingImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {existingImages.map((url) => (
                    <div key={url} className="border rounded-lg overflow-hidden relative">
                      <img src={url} className="w-full h-32 object-cover" alt="existing" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-2 right-2 bg-white/90 border rounded px-2 py-1 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No images kept. Add new images below.</p>
              )}
            </div>

            {/* Add new images */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Add New Images</label>
              <input type="file" multiple accept="image/*" onChange={onFilesChange} />

              {newPreviews.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {newPreviews.map((src, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden">
                      <img src={src} className="w-full h-32 object-cover" alt={`new-${i}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 rounded-lg border-2 border-dashed border-neutral-300 bg-gray-50 flex flex-col items-center justify-center h-32 text-gray-400">
                  <ImagePlus className="h-8 w-8 mb-1" />
                  <p className="text-sm">Select images to upload</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
