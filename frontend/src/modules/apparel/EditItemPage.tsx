import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { ArrowLeft, ImagePlus } from "lucide-react";
import api from "../../api/axios";
import { updateItemWithImages } from "../../api/apparel.api";

/* --------------------------------------------------
   UI DROPDOWN OPTIONS
   - These are the selectable lists shown in the form
   - Same list used in Add Item page to keep consistency
-------------------------------------------------- */
const CATEGORIES = [
  "Tops",
  "Bottoms",
  "Outerwear",
  "Shoes",
  "Accessories",
] as const;
const CONDITIONS = ["New", "Like New", "Good", "Fair"] as const;
const SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "US 6",
  "US 7",
  "US 8",
  "US 9",
  "US 10",
  "US 11",
  "One Size",
];

/* --------------------------------------------------
   ENUM MAPPING (UI -> API)
   - Backend expects enum values like TOP / NEW
   - UI shows friendly values like "Tops" / "Like New"
-------------------------------------------------- */
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

/* --------------------------------------------------
   ENUM MAPPING (API -> UI)
   - Used while loading an item to pre-fill dropdown fields
   - Converts backend enum to UI readable label
-------------------------------------------------- */
const categoryFromApi: Record<string, string> = {
  TOP: "Tops",
  BOTTOM: "Bottoms",
  OUTERWEAR: "Outerwear",
  SHOES: "Shoes",
  ACCESSORY: "Accessories",
  OTHER: "Tops", // fallback mapping
};
const conditionFromApi: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  WORN: "Fair", // fallback mapping
};

/* --------------------------------------------------
   COMPONENT PROPS
   - itemId: which item to edit
   - onCancel: callback to go back / close edit mode
   - onSaved: optional callback after successful update
-------------------------------------------------- */
type Props = {
  itemId: string;
  onCancel: () => void;
  onSaved?: () => void;
};

export function EditItemPage({ itemId, onCancel, onSaved }: Props) {
  /* --------------------------------------------------
     PAGE STATUS STATE
     - loading: used for initial data fetch
     - saving: used when submitting update to backend
     - error: user-friendly error message banner
  -------------------------------------------------- */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* --------------------------------------------------
     FORM STATE
     - title/category/size/condition represent form values
     - category and condition use union types from UI arrays
  -------------------------------------------------- */
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Tops");
  const [size, setSize] = useState("M");
  const [condition, setCondition] =
    useState<(typeof CONDITIONS)[number]>("Good");

  /* --------------------------------------------------
     IMAGE STATE
     - existingImages: images already saved in DB (kept unless removed)
     - newFiles: newly selected image files from file input
     - newPreviews: preview URLs generated from selected files
  -------------------------------------------------- */
  const [existingImages, setExistingImages] = useState<
    { url: string; public_id: string }[]
  >([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  /* --------------------------------------------------
     LOAD ITEM DETAILS
     - Fetch item from backend using itemId
     - Pre-fill form fields from API response
     - Map API enums back to UI labels (category/condition)
  -------------------------------------------------- */
  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);

        // Fetch item details from backend
        const res = await api.get(`/items/${itemId}`);

        // The project seems to store item inside res.data.data
        const item = res.data?.data;

        // Fill text/select fields
        setTitle(item.title || "");
        setSize(item.size || "M");

        // Load existing images so user can keep/remove them
        setExistingImages(item.images || []);

        // Map API category/condition to UI labels (fallback if missing)
        setCategory((categoryFromApi[item.category] as any) || "Tops");
        setCondition((conditionFromApi[item.condition] as any) || "Good");
      } catch (err: any) {
        // Prefer backend error message; fallback otherwise
        setError(err?.response?.data?.message || "Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [itemId]);

  /* --------------------------------------------------
     FILE INPUT HANDLER
     - Reads selected files (multiple images)
     - Stores the raw File objects for upload
     - Creates local preview URLs so the user can see images before saving
  -------------------------------------------------- */
  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setNewFiles(selected);
    setNewPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  /* --------------------------------------------------
     REMOVE EXISTING IMAGE (UI ONLY)
     - Removes the image url from existingImages list
     - This affects what is kept when saving (keepImages list)
  -------------------------------------------------- */
  const removeExistingImage = (public_id: string) => {
    setExistingImages((prev) =>
      prev.filter((img) => img.public_id !== public_id),
    );
  };

  /* --------------------------------------------------
     SAVE HANDLER
     - Builds payload for backend
     - Converts UI enums to API enums
     - Sends:
       • updated item fields (title/category/size/condition)
       • newly selected image files
       • existingImages list (kept images after removals)
     - Calls onSaved and then onCancel to go back
  -------------------------------------------------- */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      // Build update payload with correct enum mapping
      const payload = {
        title,
        category: categoryToApi[category] || "OTHER",
        size,
        condition: conditionToApi[condition] || "GOOD",
      };

      // keepImages is the existingImages after user removed some
      await updateItemWithImages(itemId, payload, newFiles, existingImages);

      // Optional callback for parent pages to refresh UI
      onSaved?.();

      // Return back/close edit view
      onCancel();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  /* --------------------------------------------------
     LOADING STATE UI
     - Shown while item details are being fetched
  -------------------------------------------------- */
  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-10">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back button (calls onCancel to return to previous view) */}
      <Button variant="ghost" onClick={onCancel} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Main edit form card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Item</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Update item details and images
          </p>
        </CardHeader>

        <CardContent>
          {/* Error banner for load/save failures */}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Item title input */}
            <Input
              id="title"
              label="Item Name"
              placeholder="e.g. Vintage Denim Jacket"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Category dropdown */}
            <div className="w-full space-y-1">
              <label className="text-sm font-medium text-neutral-700">
                Category
              </label>
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

            {/* Size dropdown */}
            <div className="w-full space-y-1">
              <label className="text-sm font-medium text-neutral-700">
                Size
              </label>
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

            {/* Condition selection buttons */}
            <div className="w-full space-y-1">
              <label className="text-sm font-medium text-neutral-700">
                Condition
              </label>
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

            {/* Existing images section:
                - Shows currently saved images
                - User can remove images to exclude them from keepImages
            */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Current Images
              </label>

              {existingImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {existingImages.map((img) => (
                    <div
                      key={img.public_id}
                      className="border rounded-lg overflow-hidden relative"
                    >
                      <img
                        src={img.url}
                        className="w-full h-32 object-cover"
                        alt="existing"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.public_id)}
                        className="absolute top-2 right-2 bg-white/90 border rounded px-2 py-1 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No images kept. Add new images below.
                </p>
              )}
            </div>

            {/* Add new images:
                - User selects new files to upload
                - Shows previews before saving
            */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Add New Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={onFilesChange}
              />

              {newPreviews.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {newPreviews.map((src, i) => (
                    <div key={i} className="border rounded-lg overflow-hidden">
                      <img
                        src={src}
                        className="w-full h-32 object-cover"
                        alt={`new-${i}`}
                      />
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

            {/* Action buttons:
                - Cancel returns without saving
                - Save submits changes and uploads new images
            */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
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
