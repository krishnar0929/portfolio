"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from "@/components/Icons";

export function Field({
  label,
  hint,
  children,
  id,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <input
        id={id}
        type={type}
        className="input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} id={id}>
      <textarea
        id={id}
        rows={rows}
        className="input resize-y leading-relaxed"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

const sameArray = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * Edits a string[] as comma-separated (inline) or one-per-line (multiline) text,
 * keeping the raw text so typing a trailing comma or newline isn't swallowed.
 */
export function ListInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline = false,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
}) {
  const id = useId();
  const join = (v: string[]) => v.join(multiline ? "\n" : ", ");
  const parse = (t: string) =>
    t
      .split(multiline ? /\n/ : /,/)
      .map((s) => s.trim())
      .filter(Boolean);

  const [raw, setRaw] = useState(() => join(value));
  const committed = useRef(value);

  useEffect(() => {
    if (!sameArray(value, committed.current)) {
      committed.current = value;
      setRaw(join(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handle = (text: string) => {
    setRaw(text);
    const parsed = parse(text);
    committed.current = parsed;
    onChange(parsed);
  };

  return (
    <Field label={label} hint={hint ?? (multiline ? "One per line" : "Separate with commas")} id={id}>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          className="input resize-y leading-relaxed"
          value={raw}
          placeholder={placeholder}
          onChange={(e) => handle(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className="input"
          value={raw}
          placeholder={placeholder}
          onChange={(e) => handle(e.target.value)}
        />
      )}
    </Field>
  );
}

/** Card wrapping one item in a repeatable list, with reorder + remove controls. */
export function ItemCard({
  title,
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-ink-950/40 p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-slate-200">{title}</p>
        <div className="flex shrink-0 items-center gap-1 text-slate-500">
          <button
            type="button"
            aria-label="Move up"
            disabled={index === 0}
            onClick={() => onMove(index, index - 1)}
            className="rounded p-1 hover:bg-white/5 hover:text-white disabled:opacity-30"
          >
            <ChevronUpIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={index === count - 1}
            onClick={() => onMove(index, index + 1)}
            className="rounded p-1 hover:bg-white/5 hover:text-white disabled:opacity-30"
          >
            <ChevronDownIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Remove"
            onClick={() => onRemove(index)}
            className="rounded p-1 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// Immutable list helpers
export const updateAt = <T,>(list: T[], i: number, patch: Partial<T>): T[] =>
  list.map((item, j) => (j === i ? { ...item, ...patch } : item));

export const removeAt = <T,>(list: T[], i: number): T[] => list.filter((_, j) => j !== i);

export const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};
