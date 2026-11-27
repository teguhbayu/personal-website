"use client";

import { useRef, useState } from "react";
import { FiCrop, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { sileo } from "sileo";
import type { UploadFolder } from "@/lib/cloudinary";
import { uploadFileToCloudinary } from "@/lib/cloudinary-upload";
import ImageCropModal, { AspectPresetId } from "./ImageCropModal";

interface ImageUploadFieldProps {
  id: string;
  label: string;
  folder: UploadFolder;
  defaultAspect?: AspectPresetId;
  value: string;
  onChange: (nextUrl: string) => void;
  placeholder?: string;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export default function ImageUploadField({
  id,
  label,
  folder,
  defaultAspect,
  value,
  onChange,
  placeholder = "https://res.cloudinary.com/... or /projects/example.png",
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setStatus(null);

    if (!file.type.startsWith("image/")) {
      const msg =
        "Please select a valid image file (PNG, JPG, WebP, or AVIF).";
      setError(msg);
      sileo.error({ title: "Unsupported file", description: msg });
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      const msg = "Image file must be 10 MB or smaller.";
      setError(msg);
      sileo.error({ title: "File too large", description: msg });
      return;
    }

    setPendingFile(file);
  };

  const handleDirectUpload = async (fileToUpload: File) => {
    setError(null);
    setStatus(null);
    setUploading(true);

    try {
      const result = await uploadFileToCloudinary(fileToUpload, folder);
      onChange(result.secureUrl);
      setStatus(`Uploaded to ${result.folder}`);
      sileo.success({
        title: "Image uploaded",
        description: result.folder,
      });
      setPendingFile(null);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Upload failed. Please try again.";
      setError(msg);
      sileo.error({
        title: "Upload failed",
        description: msg,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={id} className="font-mono text-xs text-ink uppercase">
            {label}
          </label>
          <span className="font-mono text-[11px] text-ink-muted">
            portfolio-website/{folder}/
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => {
              setStatus(null);
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            className="min-h-[44px] flex-1 px-3 bg-sheet border border-rule text-sm text-ink placeholder:text-ink-muted rounded-sm"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
            aria-label={`Select and crop image for portfolio-website/${folder}`}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="min-h-[44px] px-4 inline-flex items-center justify-center gap-2 border border-rule bg-sheet-alt text-ink font-mono text-xs uppercase rounded-sm hover:border-accent-strong transition-colors disabled:opacity-60 shrink-0"
          >
            {uploading ? (
              <FiUploadCloud
                aria-hidden={true}
                className="text-sm text-accent"
              />
            ) : (
              <FiCrop aria-hidden={true} className="text-sm text-accent" />
            )}
            <span>{uploading ? "Uploading..." : "Crop & Upload"}</span>
          </button>
        </div>

        {error && !pendingFile && (
          <p role="alert" className="font-mono text-xs text-accent">
            {error}
          </p>
        )}
        {status && !error && (
          <p role="status" className="font-mono text-xs text-ink-muted">
            {status}
          </p>
        )}

        {value.trim() && (
          <div className="relative border border-rule bg-sheet rounded-sm overflow-hidden">
            <div className="relative aspect-[16/9] max-h-48 w-full flex items-center justify-center bg-sheet-alt overflow-hidden">
              <img
                src={value}
                alt="Selected preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="px-3 py-1.5 border-t border-rule bg-sheet flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] text-ink-muted truncate">
                {value}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStatus(null);
                  onChange("");
                }}
                className="min-h-[36px] px-2.5 inline-flex items-center gap-1 font-mono text-[11px] text-accent hover:underline shrink-0"
              >
                <FiTrash2 aria-hidden={true} className="text-xs" />
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      <ImageCropModal
        file={pendingFile}
        folder={folder}
        defaultAspect={defaultAspect}
        uploading={uploading}
        error={error}
        onCancel={() => {
          if (!uploading) {
            setError(null);
            setPendingFile(null);
          }
        }}
        onUploadFile={handleDirectUpload}
      />
    </>
  );
}
