"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiCheck,
  FiMaximize2,
  FiMinus,
  FiPlus,
  FiRotateCcw,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";
import type { UploadFolder } from "@/lib/cloudinary";

export type AspectPresetId =
  | "custom"
  | "16:9"
  | "16:10"
  | "4:3"
  | "1:1"
  | "7:8"
  | "original";

type ResizeHandle = "move" | "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const ASPECT_PRESETS: {
  id: AspectPresetId;
  label: string;
  ratio: number | null;
}[] = [
  { id: "custom", label: "Custom", ratio: null },
  { id: "16:9", label: "16:9", ratio: 16 / 9 },
  { id: "16:10", label: "16:10", ratio: 16 / 10 },
  { id: "4:3", label: "4:3", ratio: 4 / 3 },
  { id: "1:1", label: "1:1", ratio: 1 },
  { id: "7:8", label: "Portrait", ratio: 7 / 8 },
  { id: "original", label: "Original", ratio: null },
];

export const FOLDER_DEFAULT_ASPECT: Record<UploadFolder, AspectPresetId> = {
  projects: "16:9",
  blog: "16:9",
  certs: "16:10",
  profile: "7:8",
};

interface ImageCropModalProps {
  file: File | null;
  folder: UploadFolder;
  defaultAspect?: AspectPresetId;
  uploading: boolean;
  error: string | null;
  onCancel: () => void;
  onUploadFile: (fileToUpload: File) => void;
}

const MAX_STAGE_WIDTH = 560;
const MAX_STAGE_HEIGHT = 360;
const MAX_OUTPUT_EDGE = 1920;
const MIN_CUSTOM_SIZE = 32;

function defaultCustomRect(fitW: number, fitH: number): CropRect {
  const padX = Math.round(fitW * 0.08);
  const padY = Math.round(fitH * 0.08);
  return {
    x: padX,
    y: padY,
    w: Math.max(MIN_CUSTOM_SIZE, fitW - padX * 2),
    h: Math.max(MIN_CUSTOM_SIZE, fitH - padY * 2),
  };
}

export default function ImageCropModal({
  file,
  folder,
  defaultAspect,
  uploading,
  error,
  onCancel,
  onUploadFile,
}: ImageCropModalProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [aspectId, setAspectId] = useState<AspectPresetId>(
    defaultAspect ?? FOLDER_DEFAULT_ASPECT[folder],
  );
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [customRect, setCustomRect] = useState<CropRect>({
    x: 24,
    y: 24,
    w: 240,
    h: 160,
  });
  const [dragging, setDragging] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);
  const panDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const rectDragRef = useRef<{
    pointerId: number;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    origin: CropRect;
  } | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      setNaturalSize(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setAspectId(defaultAspect ?? FOLDER_DEFAULT_ASPECT[folder]);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setLocalError(null);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file, folder, defaultAspect]);

  const isCustomMode = aspectId === "custom";

  const customFitSize = useMemo(() => {
    if (!naturalSize || naturalSize.h <= 0) {
      return { w: MAX_STAGE_WIDTH, h: MAX_STAGE_HEIGHT };
    }
    const imgRatio = naturalSize.w / naturalSize.h;
    let w = MAX_STAGE_WIDTH;
    let h = w / imgRatio;
    if (h > MAX_STAGE_HEIGHT) {
      h = MAX_STAGE_HEIGHT;
      w = h * imgRatio;
    }
    return {
      w: Math.max(MIN_CUSTOM_SIZE, Math.round(w)),
      h: Math.max(MIN_CUSTOM_SIZE, Math.round(h)),
    };
  }, [naturalSize]);

  useEffect(() => {
    if (naturalSize) {
      setCustomRect(defaultCustomRect(customFitSize.w, customFitSize.h));
    }
  }, [naturalSize, customFitSize.w, customFitSize.h]);

  useEffect(() => {
    if (!file) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !uploading && !exporting) {
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [file, uploading, exporting, onCancel]);

  const activeRatio = useMemo(() => {
    const preset = ASPECT_PRESETS.find((p) => p.id === aspectId);
    if (preset?.ratio) return preset.ratio;
    if (naturalSize && naturalSize.h > 0) {
      return naturalSize.w / naturalSize.h;
    }
    return 16 / 9;
  }, [aspectId, naturalSize]);

  const boxSize = useMemo(() => {
    let w = MAX_STAGE_WIDTH;
    let h = w / activeRatio;
    if (h > MAX_STAGE_HEIGHT) {
      h = MAX_STAGE_HEIGHT;
      w = h * activeRatio;
    }
    return {
      w: Math.round(w),
      h: Math.round(h),
    };
  }, [activeRatio]);

  const layout = useMemo(() => {
    if (!naturalSize) {
      return {
        coverScale: 1,
        dispW: boxSize.w,
        dispH: boxSize.h,
        maxPanX: 0,
        maxPanY: 0,
      };
    }
    const coverScale = Math.max(
      boxSize.w / naturalSize.w,
      boxSize.h / naturalSize.h,
    );
    const dispW = naturalSize.w * coverScale * zoom;
    const dispH = naturalSize.h * coverScale * zoom;
    const maxPanX = Math.max(0, (dispW - boxSize.w) / 2);
    const maxPanY = Math.max(0, (dispH - boxSize.h) / 2);
    return { coverScale, dispW, dispH, maxPanX, maxPanY };
  }, [naturalSize, boxSize, zoom]);

  const clampedPan = useMemo(
    () => ({
      x: Math.min(layout.maxPanX, Math.max(-layout.maxPanX, pan.x)),
      y: Math.min(layout.maxPanY, Math.max(-layout.maxPanY, pan.y)),
    }),
    [pan, layout.maxPanX, layout.maxPanY],
  );

  const outputPixels = useMemo(() => {
    if (!naturalSize) return null;
    if (isCustomMode) {
      const scaleX = naturalSize.w / customFitSize.w;
      const scaleY = naturalSize.h / customFitSize.h;
      const sw = customRect.w * scaleX;
      const sh = customRect.h * scaleY;
      const outScale = Math.min(1, MAX_OUTPUT_EDGE / Math.max(sw, sh));
      return {
        w: Math.max(1, Math.round(sw * outScale)),
        h: Math.max(1, Math.round(sh * outScale)),
      };
    }
    const totalScale = layout.coverScale * zoom;
    const sw = boxSize.w / totalScale;
    const sh = boxSize.h / totalScale;
    const outScale = Math.min(1, MAX_OUTPUT_EDGE / Math.max(sw, sh));
    return {
      w: Math.max(1, Math.round(sw * outScale)),
      h: Math.max(1, Math.round(sh * outScale)),
    };
  }, [
    naturalSize,
    isCustomMode,
    customFitSize.w,
    customFitSize.h,
    customRect.w,
    customRect.h,
    layout.coverScale,
    zoom,
    boxSize.w,
    boxSize.h,
  ]);

  const handlePanPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (uploading || exporting) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    panDragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: clampedPan.x,
      originY: clampedPan.y,
    };
    setDragging(true);
  };

  const handlePanPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = panDragRef.current;
    if (!start || start.pointerId !== e.pointerId) return;
    const dx = e.clientX - start.startX;
    const dy = e.clientY - start.startY;
    setPan({
      x: Math.min(layout.maxPanX, Math.max(-layout.maxPanX, start.originX + dx)),
      y: Math.min(layout.maxPanY, Math.max(-layout.maxPanY, start.originY + dy)),
    });
  };

  const handlePanPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (panDragRef.current?.pointerId === e.pointerId) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      panDragRef.current = null;
      setDragging(false);
    }
  };

  const startRectDrag = (
    handle: ResizeHandle,
    e: React.PointerEvent<HTMLElement>,
  ) => {
    if (uploading || exporting) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    rectDragRef.current = {
      pointerId: e.pointerId,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origin: { ...customRect },
    };
    setDragging(true);
  };

  const moveRectDrag = (e: React.PointerEvent<HTMLElement>) => {
    const drag = rectDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    e.stopPropagation();
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const maxW = customFitSize.w;
    const maxH = customFitSize.h;
    const o = drag.origin;

    if (drag.handle === "move") {
      const nextX = Math.min(maxW - o.w, Math.max(0, o.x + dx));
      const nextY = Math.min(maxH - o.h, Math.max(0, o.y + dy));
      setCustomRect({ x: nextX, y: nextY, w: o.w, h: o.h });
      return;
    }

    let left = o.x;
    let right = o.x + o.w;
    let top = o.y;
    let bottom = o.y + o.h;

    if (drag.handle.includes("w")) {
      left = Math.min(right - MIN_CUSTOM_SIZE, Math.max(0, o.x + dx));
    }
    if (drag.handle.includes("e")) {
      right = Math.max(left + MIN_CUSTOM_SIZE, Math.min(maxW, o.x + o.w + dx));
    }
    if (drag.handle.includes("n")) {
      top = Math.min(bottom - MIN_CUSTOM_SIZE, Math.max(0, o.y + dy));
    }
    if (drag.handle.includes("s")) {
      bottom = Math.max(top + MIN_CUSTOM_SIZE, Math.min(maxH, o.y + o.h + dy));
    }

    setCustomRect({
      x: left,
      y: top,
      w: right - left,
      h: bottom - top,
    });
  };

  const endRectDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (rectDragRef.current?.pointerId === e.pointerId) {
      e.stopPropagation();
      e.currentTarget.releasePointerCapture(e.pointerId);
      rectDragRef.current = null;
      setDragging(false);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (uploading || exporting || isCustomMode) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    setZoom((prev) =>
      Number(Math.min(3, Math.max(1, prev + delta)).toFixed(2)),
    );
  };

  const handleReset = () => {
    if (isCustomMode) {
      setCustomRect(defaultCustomRect(customFitSize.w, customFitSize.h));
      return;
    }
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCropAndUpload = useCallback(async () => {
    if (!file || !imgRef.current || !naturalSize) return;
    setLocalError(null);
    setExporting(true);

    try {
      let sx = 0;
      let sy = 0;
      let sw = naturalSize.w;
      let sh = naturalSize.h;

      if (isCustomMode) {
        const scaleX = naturalSize.w / customFitSize.w;
        const scaleY = naturalSize.h / customFitSize.h;
        sx = Math.max(0, customRect.x * scaleX);
        sy = Math.max(0, customRect.y * scaleY);
        sw = Math.min(naturalSize.w - sx, customRect.w * scaleX);
        sh = Math.min(naturalSize.h - sy, customRect.h * scaleY);
      } else {
        const totalScale = layout.coverScale * zoom;
        const imgLeft = (boxSize.w - layout.dispW) / 2 + clampedPan.x;
        const imgTop = (boxSize.h - layout.dispH) / 2 + clampedPan.y;
        sx = Math.max(0, -imgLeft / totalScale);
        sy = Math.max(0, -imgTop / totalScale);
        sw = Math.min(naturalSize.w - sx, boxSize.w / totalScale);
        sh = Math.min(naturalSize.h - sy, boxSize.h / totalScale);
      }

      const outScale = Math.min(1, MAX_OUTPUT_EDGE / Math.max(sw, sh));
      const outW = Math.max(1, Math.round(sw * outScale));
      const outH = Math.max(1, Math.round(sh * outScale));

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas context is unavailable in this browser.");
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(imgRef.current, sx, sy, sw, sh, 0, 0, outW, outH);

      const keepAlpha =
        file.type === "image/png" || file.type === "image/webp";
      const mimeType = keepAlpha ? file.type : "image/jpeg";
      const quality = mimeType === "image/png" ? undefined : 0.92;

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mimeType, quality),
      );
      if (!blob) {
        throw new Error("Could not generate cropped image.");
      }

      const ext =
        mimeType === "image/png"
          ? "png"
          : mimeType === "image/webp"
            ? "webp"
            : "jpg";
      const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";
      const croppedFile = new File([blob], `${baseName}-cropped.${ext}`, {
        type: mimeType,
      });

      setExporting(false);
      onUploadFile(croppedFile);
    } catch (err) {
      setExporting(false);
      setLocalError(
        err instanceof Error ? err.message : "Failed to crop image.",
      );
    }
  }, [
    file,
    naturalSize,
    isCustomMode,
    customFitSize.w,
    customFitSize.h,
    customRect.x,
    customRect.y,
    customRect.w,
    customRect.h,
    layout.coverScale,
    layout.dispW,
    layout.dispH,
    zoom,
    boxSize.w,
    boxSize.h,
    clampedPan.x,
    clampedPan.y,
    onUploadFile,
  ]);

  if (!file || !objectUrl) return null;

  const busy = uploading || exporting;
  const imgLeft = (boxSize.w - layout.dispW) / 2 + clampedPan.x;
  const imgTop = (boxSize.h - layout.dispH) / 2 + clampedPan.y;

  const customHandles: {
    id: ResizeHandle;
    style: React.CSSProperties;
    cursor: string;
    label: string;
  }[] = [
    {
      id: "nw",
      style: { top: -6, left: -6 },
      cursor: "nwse-resize",
      label: "Resize top-left corner",
    },
    {
      id: "ne",
      style: { top: -6, right: -6 },
      cursor: "nesw-resize",
      label: "Resize top-right corner",
    },
    {
      id: "sw",
      style: { bottom: -6, left: -6 },
      cursor: "nesw-resize",
      label: "Resize bottom-left corner",
    },
    {
      id: "se",
      style: { bottom: -6, right: -6 },
      cursor: "nwse-resize",
      label: "Resize bottom-right corner",
    },
    {
      id: "n",
      style: { top: -5, left: "50%", transform: "translateX(-50%)" },
      cursor: "ns-resize",
      label: "Resize top edge",
    },
    {
      id: "s",
      style: { bottom: -5, left: "50%", transform: "translateX(-50%)" },
      cursor: "ns-resize",
      label: "Resize bottom edge",
    },
    {
      id: "w",
      style: { left: -5, top: "50%", transform: "translateY(-50%)" },
      cursor: "ew-resize",
      label: "Resize left edge",
    },
    {
      id: "e",
      style: { right: -5, top: "50%", transform: "translateY(-50%)" },
      cursor: "ew-resize",
      label: "Resize right edge",
    },
  ];

  return createPortal(
    <div
      data-crop-modal="true"
      role="dialog"
      aria-modal="true"
      aria-label="Crop image before uploading"
      className="fixed inset-0 z-[100] pointer-events-auto flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: "var(--scrim)" }}
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        className="w-full max-w-3xl max-h-[92dvh] overflow-y-auto border border-rule bg-sheet text-ink rounded-md flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-rule bg-sheet-alt flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase text-accent">
              portfolio-website/{folder}/
            </p>
            <h2 className="font-display font-extrabold text-xl text-ink truncate">
              Crop Image Before Upload
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cancel crop"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border border-rule bg-sheet text-ink rounded-sm hover:border-accent-strong transition-colors disabled:opacity-60 shrink-0"
          >
            <FiX aria-hidden={true} className="text-base" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="group"
              aria-label="Aspect ratio presets"
              className="flex flex-wrap gap-1.5"
            >
              {ASPECT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setAspectId(preset.id);
                    setPan({ x: 0, y: 0 });
                    if (preset.id === "custom") {
                      setCustomRect(
                        defaultCustomRect(customFitSize.w, customFitSize.h),
                      );
                    }
                  }}
                  className={`min-h-[40px] px-3 font-mono text-xs uppercase rounded-sm border transition-colors ${
                    aspectId === preset.id
                      ? "bg-accent-strong text-white border-accent-strong"
                      : "bg-sheet-alt text-ink border-rule hover:border-accent-strong"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {outputPixels && (
              <span className="font-mono text-xs text-ink-muted">
                Output: {outputPixels.w} x {outputPixels.h}px
              </span>
            )}
          </div>

          <div className="w-full py-4 px-3 border border-rule bg-ink/95 rounded-sm flex items-center justify-center overflow-hidden">
            {isCustomMode ? (
              <div
                style={{
                  width: `${customFitSize.w}px`,
                  height: `${customFitSize.h}px`,
                  maxWidth: "100%",
                  touchAction: "none",
                }}
                className="relative select-none"
              >
                <img
                  ref={imgRef}
                  src={objectUrl}
                  alt="Custom crop workspace"
                  draggable={false}
                  onLoad={(e) => {
                    const el = e.currentTarget;
                    setNaturalSize({
                      w: el.naturalWidth,
                      h: el.naturalHeight,
                    });
                  }}
                  className="w-full h-full object-contain block"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 right-0 top-0 bg-black/60"
                  style={{ height: `${customRect.y}px` }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 right-0 bottom-0 bg-black/60"
                  style={{
                    top: `${customRect.y + customRect.h}px`,
                  }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 bg-black/60"
                  style={{
                    top: `${customRect.y}px`,
                    height: `${customRect.h}px`,
                    width: `${customRect.x}px`,
                  }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 bg-black/60"
                  style={{
                    top: `${customRect.y}px`,
                    height: `${customRect.h}px`,
                    left: `${customRect.x + customRect.w}px`,
                  }}
                />

                <div
                  onPointerDown={(e) => startRectDrag("move", e)}
                  onPointerMove={moveRectDrag}
                  onPointerUp={endRectDrag}
                  onPointerCancel={endRectDrag}
                  style={{
                    left: `${customRect.x}px`,
                    top: `${customRect.y}px`,
                    width: `${customRect.w}px`,
                    height: `${customRect.h}px`,
                    touchAction: "none",
                  }}
                  className={`absolute border-2 border-white ${
                    dragging ? "cursor-grabbing" : "cursor-move"
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3"
                  >
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-white/30" />
                    <div className="border-r border-white/30" />
                    <div />
                  </div>

                  {customHandles.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      aria-label={h.label}
                      onPointerDown={(e) => startRectDrag(h.id, e)}
                      onPointerMove={moveRectDrag}
                      onPointerUp={endRectDrag}
                      onPointerCancel={endRectDrag}
                      style={{
                        ...h.style,
                        cursor: h.cursor,
                        touchAction: "none",
                      }}
                      className="absolute w-3.5 h-3.5 bg-accent-strong border-2 border-white rounded-sm shadow"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div
                onPointerDown={handlePanPointerDown}
                onPointerMove={handlePanPointerMove}
                onPointerUp={handlePanPointerUp}
                onPointerCancel={handlePanPointerUp}
                onWheel={handleWheel}
                style={{
                  width: `${boxSize.w}px`,
                  height: `${boxSize.h}px`,
                  maxWidth: "100%",
                  touchAction: "none",
                }}
                className={`relative overflow-hidden border-2 border-white/90 select-none ${
                  dragging ? "cursor-grabbing" : "cursor-grab"
                }`}
              >
                <img
                  ref={imgRef}
                  src={objectUrl}
                  alt="Crop workspace"
                  draggable={false}
                  onLoad={(e) => {
                    const el = e.currentTarget;
                    setNaturalSize({
                      w: el.naturalWidth,
                      h: el.naturalHeight,
                    });
                  }}
                  style={{
                    position: "absolute",
                    left: `${imgLeft}px`,
                    top: `${imgTop}px`,
                    width: `${layout.dispW}px`,
                    height: `${layout.dispH}px`,
                    maxWidth: "none",
                  }}
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3"
                >
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-white/30" />
                  <div className="border-r border-white/30" />
                  <div />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border border-rule bg-sheet-alt rounded-sm">
            {isCustomMode ? (
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-ink-muted">
                <span>
                  Drag the crop box to move or pull any corner or edge handle to
                  resize freely.
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    setCustomRect({
                      x: 0,
                      y: 0,
                      w: customFitSize.w,
                      h: customFitSize.h,
                    })
                  }
                  className="min-h-[36px] px-2.5 border border-rule bg-sheet text-ink uppercase rounded-sm hover:border-accent-strong"
                >
                  Select Full
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 flex-1">
                <button
                  type="button"
                  disabled={busy || zoom <= 1}
                  onClick={() =>
                    setZoom((z) => Number(Math.max(1, z - 0.15).toFixed(2)))
                  }
                  aria-label="Zoom out"
                  className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-rule bg-sheet text-ink rounded-sm hover:border-accent-strong disabled:opacity-50"
                >
                  <FiMinus aria-hidden={true} className="text-sm" />
                </button>

                <label htmlFor="crop-zoom-slider" className="sr-only">
                  Zoom level
                </label>
                <input
                  id="crop-zoom-slider"
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  disabled={busy}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-[#c81038]"
                />

                <button
                  type="button"
                  disabled={busy || zoom >= 3}
                  onClick={() =>
                    setZoom((z) => Number(Math.min(3, z + 0.15).toFixed(2)))
                  }
                  aria-label="Zoom in"
                  className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center border border-rule bg-sheet text-ink rounded-sm hover:border-accent-strong disabled:opacity-50"
                >
                  <FiPlus aria-hidden={true} className="text-sm" />
                </button>

                <span className="font-mono text-xs text-ink w-12 text-right">
                  {zoom.toFixed(2)}x
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleReset}
              disabled={busy}
              className="min-h-[40px] px-3 inline-flex items-center justify-center gap-1.5 border border-rule bg-sheet text-ink font-mono text-xs uppercase rounded-sm hover:border-accent-strong disabled:opacity-60 shrink-0"
            >
              <FiRotateCcw aria-hidden={true} className="text-xs" />
              <span>Reset</span>
            </button>
          </div>

          {(localError || error) && (
            <div
              role="alert"
              className="p-3.5 border border-accent-strong bg-sheet-alt text-sm text-ink rounded-sm"
            >
              {localError || error}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-rule">
            <button
              type="button"
              onClick={() => onUploadFile(file)}
              disabled={busy}
              className="min-h-[44px] px-4 inline-flex items-center justify-center gap-2 border border-rule bg-sheet-alt text-ink font-mono text-xs uppercase rounded-sm hover:border-accent-strong transition-colors disabled:opacity-60"
            >
              <FiMaximize2 aria-hidden={true} className="text-xs" />
              <span>Upload Original</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={busy}
                className="min-h-[44px] px-4 border border-rule bg-sheet text-ink font-mono text-xs uppercase rounded-sm hover:border-accent-strong transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropAndUpload}
                disabled={busy || !naturalSize}
                className="min-h-[44px] px-5 inline-flex items-center justify-center gap-2 bg-accent-strong text-white font-mono text-xs font-medium uppercase rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <FiUploadCloud aria-hidden={true} className="text-sm" />
                    <span>Uploading...</span>
                  </>
                ) : exporting ? (
                  <span>Cropping...</span>
                ) : (
                  <>
                    <FiCheck aria-hidden={true} className="text-sm" />
                    <span>Crop &amp; Upload</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
