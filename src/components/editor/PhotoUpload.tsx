"use client";

import { useRef, useState } from "react";

const SIZE = 400; // stored as a 400×400 JPEG (~30–60 KB)
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

/** Center-crop and shrink an image file to a square JPEG data URL. */
async function toSquareJpeg(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("That file isn't an image we can read."));
      el.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Your browser couldn't process the image.");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, SIZE, SIZE);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PhotoUpload({
  value,
  initials,
  googlePhoto,
  onChange,
}: {
  value: string;
  initials: string;
  googlePhoto?: string | null;
  onChange: (v: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image (JPG, PNG, WebP or HEIC).");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("That image is over 15 MB. Please choose a smaller one.");
      return;
    }
    setBusy(true);
    try {
      onChange(await toSquareJpeg(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't use that image.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="label">Profile photo</p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handle(e.dataTransfer.files[0]);
          }}
          aria-label={value ? "Change photo" : "Upload photo"}
          className={`group relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-dashed transition ${
            dragging ? "border-accent bg-accent/10" : value ? "border-transparent" : "border-white/20 bg-white/[0.03] hover:border-accent/60"
          }`}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex flex-col items-center text-slate-500">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
              {initials && <span className="mt-0.5 text-[10px] font-semibold">{initials}</span>}
            </span>
          )}
          <span className="absolute inset-0 grid place-items-center bg-black/50 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
            {busy ? "…" : value ? "Change" : "Upload"}
          </span>
        </button>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => input.current?.click()} className="btn-ghost px-3 py-1.5 text-xs">
              {busy ? "Processing…" : value ? "Change photo" : "Upload photo"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} className="btn px-2 py-1.5 text-xs text-rose-300 hover:text-rose-200">
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">JPG, PNG or WebP. Square crop, resized automatically. Drag &amp; drop works too.</p>
          <div className="flex flex-wrap gap-x-3 text-xs">
            {googlePhoto && googlePhoto !== value && (
              <button type="button" className="text-accent hover:underline" onClick={() => onChange(googlePhoto)}>
                Use Google photo
              </button>
            )}
            <button type="button" className="text-slate-400 hover:text-white" onClick={() => setShowUrl((v) => !v)}>
              {showUrl ? "Hide link option" : "Use an image link instead"}
            </button>
          </div>
        </div>
      </div>

      {showUrl && (
        <input
          className="input mt-3"
          placeholder="https://… (e.g. https://github.com/<username>.png)"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value.trim())}
          aria-label="Photo link"
        />
      )}
      {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
