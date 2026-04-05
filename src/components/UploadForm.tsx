"use client";

import { useState, useRef, useCallback } from "react";

interface UploadFormProps {
  onSubmit: (description: string, images: File[]) => void;
  isLoading: boolean;
}

export default function UploadForm({ onSubmit, isLoading }: UploadFormProps) {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageAdd = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    setImages((prev) => [...prev, ...valid].slice(0, 5));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleImageAdd(e.dataTransfer.files);
    },
    [handleImageAdd]
  );

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || isLoading) return;
    onSubmit(description, images);
  };

  const exampleProducts = [
    "Organic matcha green tea powder, premium ceremonial grade, sourced from Uji Japan. 100g resealable pouch. $28.99. Perfect for lattes, baking, and traditional tea ceremonies.",
    "AI-powered posture correction wearable device. Clips to your collar and vibrates when you slouch. iOS/Android app tracks progress. $79. Targets office workers and remote professionals.",
    "Handmade leather minimalist wallet, holds 6 cards and cash, RFID blocking, slim profile fits in front pocket. Full-grain vegetable-tanned leather. $65.",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Product Description
          <span className="text-red-400 ml-1">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your product: what it does, who it's for, price point, key features, unique selling proposition..."
          className="w-full h-36 px-4 py-3 rounded-xl text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          style={{
            backgroundColor: "#0f172a",
            border: "1px solid #334155",
          }}
          disabled={isLoading}
          required
        />
        <p className="mt-1.5 text-xs text-slate-500">
          The more detail you provide, the more accurate your analysis will be.
        </p>
      </div>

      {/* Example products */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">
          Try an example:
        </p>
        <div className="flex flex-wrap gap-2">
          {exampleProducts.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setDescription(ex)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#a5b4fc",
              }}
            >
              Example {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Product Images{" "}
          <span className="text-slate-500 font-normal">(optional, up to 5)</span>
        </label>

        <div
          className={`upload-zone p-6 text-center cursor-pointer ${isDragging ? "drag-over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleImageAdd(e.target.files)}
            disabled={isLoading}
          />
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-8 h-8 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-slate-400">
              Drag & drop images here, or{" "}
              <span className="text-indigo-400">browse</span>
            </p>
            <p className="text-xs text-slate-600">
              JPG, PNG, GIF, WEBP — max 5 images
            </p>
          </div>
        </div>

        {/* Image previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {images.map((file, i) => (
              <div key={i} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Product image ${i + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                  style={{ border: "1px solid #334155" }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  disabled={isLoading}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <p className="text-xs text-slate-500 text-center mt-1 truncate max-w-20">
                  {file.name.split(".")[0].substring(0, 8)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!description.trim() || isLoading}
        className="btn-primary w-full text-base"
      >
        {isLoading ? (
          <span className="flex items-center gap-3">
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Analyzing your product...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Generate Ad Strategy
          </span>
        )}
      </button>
    </form>
  );
}
