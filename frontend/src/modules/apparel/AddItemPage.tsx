import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Apparel } from "../../types";
import { ImagePlus, CheckCircle, ArrowLeft } from "lucide-react";
import { createItemWithImages } from "../../api/apparel.api";
import { categoryToApi, conditionToApi } from "./apparelMappings";

interface AddItemPageProps {
  onSubmit: (item: any) => void; // you can keep, but now we will call backend directly
  onCancel: () => void;
}

/* --------------------------------------------------
   UI OPTIONS (same as other pages)
   - These are the values shown to the user in dropdowns/buttons
   - They match Apparel type unions for category/condition
-------------------------------------------------- */
const CATEGORIES: Apparel["category"][] = [
  "Tops",
  "Bottoms",
  "Outerwear",
  "Shoes",
  "Accessories",
];
const CONDITIONS: Apparel["condition"][] = ["New", "Like New", "Good", "Fair"];
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

export function AddItemPage({ onSubmit, onCancel }: AddItemPageProps) {
  /* --------------------------------------------------
     FORM STATE
     - name/category/size/condition represent the item fields
     - category and condition use Apparel type unions
  -------------------------------------------------- */
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Apparel["category"]>("Tops");
  const [size, setSize] = useState("M");
  const [condition, setCondition] = useState<Apparel["condition"]>("Good");

  /* --------------------------------------------------
     IMAGE STATE
     - files: actual image File objects selected by user
     - previews: local object URLs used to show image previews before upload
  -------------------------------------------------- */
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  /* --------------------------------------------------
     UI FEEDBACK STATE
     - isLoading: disables submit + shows loader
     - isSuccess: shows success screen after submission
     - errors: stores validation errors + backend API error
  -------------------------------------------------- */
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* --------------------------------------------------
     VALIDATION
     - Ensures item name is provided
     - Ensures at least one image is selected
     - Stores validation results in "errors" state
  -------------------------------------------------- */
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Item name is required";
    if (files.length === 0) newErrors.images = "At least one image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* --------------------------------------------------
     FILE INPUT HANDLER
     - Reads user-selected image files
     - Saves File objects into state for upload
     - Generates local preview URLs for UI preview section
  -------------------------------------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);

    // previews
    const urls = selected.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  /* --------------------------------------------------
     SUBMIT HANDLER
     - Runs validation before sending
     - Prepares payload (maps UI values to backend enums)
     - Uploads item + images using createItemWithImages()
     - Calls onSubmit callback (for parent UI refresh logic)
     - Shows success UI when completed
  -------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block submission if required fields missing
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Map UI values to backend enums
      const payload = {
        title: name,
        category: categoryToApi[category] || "OTHER",
        size,
        condition: conditionToApi[condition] || "GOOD",
        isAvailable: true,
      };

      // Send item create request with image upload
      const result = await createItemWithImages(payload, files);

      // optional: keep old callback behavior
      onSubmit(result?.data || result);

      // Show success state UI
      setIsSuccess(true);
    } catch (err: any) {
      // Store backend API error for displaying in UI
      setErrors({
        api: err?.response?.data?.message || "Failed to create item",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------
     SUCCESS SCREEN
     - Shown after successful item listing
     - Allows user to add another item (reset form)
     - Or return back to browse items
  -------------------------------------------------- */
  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="mx-auto h-16 w-16 bg-brand-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-brand-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Item Listed Successfully!
        </h2>
        <p className="text-gray-600 mb-8">
          Your item is now available for swapping on ReWear.
        </p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              // Reset all fields so user can list a new item
              setIsSuccess(false);
              setName("");
              setCategory("Tops");
              setSize("M");
              setCondition("Good");
              setFiles([]);
              setPreviews([]);
              setErrors({});
            }}
          >
            Add Another Item
          </Button>

          {/* Navigate back (parent controls routing) */}
          <Button onClick={onCancel}>Browse Items</Button>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------
     MAIN FORM UI
     - Collects item details + images
     - Shows validation errors and API error
  -------------------------------------------------- */
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back to browse */}
      <Button variant="ghost" onClick={onCancel} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Browse
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">List a New Item</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Add your apparel to the swap marketplace
          </p>
        </CardHeader>

        <CardContent>
          {/* Backend error message */}
          {errors.api && <p className="text-red-600 mb-4">{errors.api}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item name field */}
            <Input
              id="item-name"
              label="Item Name"
              placeholder="e.g. Vintage Denim Jacket"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            {/* Category dropdown */}
            <div className="w-full space-y-1">
              <label
                htmlFor="category"
                className="text-sm font-medium text-neutral-700"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Apparel["category"])
                }
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
              <label
                htmlFor="size"
                className="text-sm font-medium text-neutral-700"
              >
                Size
              </label>
              <select
                id="size"
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

            {/* Condition selector buttons */}
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

            {/* Image upload */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700">
                Images
              </label>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm"
              />

              {/* Image validation error */}
              {errors.images && (
                <p className="text-red-600 text-sm">{errors.images}</p>
              )}

              {/* Image previews */}
              {previews.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {previews.map((src, i) => (
                    <div
                      key={i}
                      className="rounded-lg overflow-hidden border border-neutral-200 bg-gray-50"
                    >
                      <img
                        src={src}
                        alt={`Preview ${i}`}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 rounded-lg border-2 border-dashed border-neutral-300 bg-gray-50 flex flex-col items-center justify-center h-48 text-gray-400">
                  <ImagePlus className="h-10 w-10 mb-2" />
                  <p className="text-sm">Image preview will appear here</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" isLoading={isLoading}>
                List Item for Swap
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}