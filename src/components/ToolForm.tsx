"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Field, Tool } from "@/lib/tools";
import { track } from "./Analytics";

type Result =
  | { kind: "file"; url: string; name: string; size: number; image: boolean }
  | { kind: "json"; text: string }
  | { kind: "error"; message: string; upgrade?: boolean };

function initialValues(fields: Field[]) {
  const values: Record<string, string | boolean> = {};
  for (const f of fields) values[f.name] = f.default ?? (f.type === "checkbox" ? false : "");
  return values;
}

function formatSize(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function FileDrop({ accept, multiple, label, files, onChange }: {
  accept: string; multiple: boolean; label: string; files: File[]; onChange: (f: File[]) => void;
}) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const add = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list);
    onChange(multiple ? [...files, ...next] : next.slice(0, 1));
  };
  return (
    <div>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
        className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${over ? "border-accent bg-accent-soft" : "border-line bg-paper hover:border-ink"}`}
      >
        <span className="text-base font-semibold">Choose {label.toLowerCase()}</span>
        <span className="mt-1 text-sm text-muted">or drop {multiple ? "them" : "it"} here</span>
      </button>
      <input ref={input} type="file" accept={accept === "*" ? undefined : accept} multiple={multiple} className="hidden"
        onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2 text-sm">
              <span className="truncate">{f.name} <span className="text-muted">· {formatSize(f.size)}</span></span>
              <button type="button" className="ml-3 text-muted hover:text-accent" aria-label={`Remove ${f.name}`}
                onClick={() => onChange(files.filter((_, j) => j !== i))}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: Field; value: string | boolean; onChange: (v: string | boolean) => void }) {
  const id = `f-${field.name}`;
  if (field.type === "checkbox")
    return (
      <label htmlFor={id} className="flex items-start gap-2 text-sm">
        <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]" />
        <span>{field.label}{field.help && <span className="block text-xs text-muted">{field.help}</span>}</span>
      </label>
    );
  return (
    <div className={field.type === "textarea" ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="label">{field.label}{field.required && <span className="text-accent"> *</span>}</label>
      {field.type === "select" ? (
        <select id={id} className="input" value={String(value)} onChange={(e) => onChange(e.target.value)}>
          {field.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : field.type === "textarea" ? (
        <textarea id={id} className="input min-h-36 font-mono" value={String(value)} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} className="input" type={field.type} value={String(value)} placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)} autoComplete={field.type === "password" ? "new-password" : undefined} />
      )}
      {field.help && <p className="mt-1 text-xs text-muted">{field.help}</p>}
    </div>
  );
}

export default function ToolForm({ tool }: { tool: Tool }) {
  const [files, setFiles] = useState<File[]>([]);
  const [extra, setExtra] = useState<Record<string, File[]>>({});
  const [text, setText] = useState("");
  const [values, setValues] = useState(() => initialValues(tool.fields));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => () => { if (result?.kind === "file") URL.revokeObjectURL(result.url); }, [result]);

  const basic = tool.fields.filter((f) => !f.advanced);
  const advanced = tool.fields.filter((f) => f.advanced);
  const input = tool.input;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    const body = new FormData();
    files.forEach((f) => body.append("files", f));
    if (input.kind === "url") body.append("url", text.trim());
    if (input.kind === "html") body.append("html", text);
    if (input.kind === "markdown") body.append("markdown", text);
    for (const [name, list] of Object.entries(extra)) list.forEach((f) => body.append(name, f));
    for (const f of tool.fields) body.append(f.name, typeof values[f.name] === "boolean" ? String(values[f.name]) : String(values[f.name]));

    try {
      const res = await fetch(`/api/convert/${tool.slug}`, { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Something went wrong. Please try again." }));
        setResult({ kind: "error", message: data.error, upgrade: res.status === 402 || res.status === 413 });
        return;
      }
      track("tool_used", { tool: tool.slug });
      const type = res.headers.get("content-type") || "";
      if (type.includes("application/json")) {
        setResult({ kind: "json", text: JSON.stringify(await res.json(), null, 2) });
        return;
      }
      const blob = await res.blob();
      const name = res.headers.get("content-disposition")?.match(/filename="?([^";]+)"?/)?.[1] || `printpipe-${tool.slug}`;
      setResult({ kind: "file", url: URL.createObjectURL(blob), name, size: blob.size, image: type.startsWith("image/") });
    } catch {
      setResult({ kind: "error", message: "Network error. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-card p-5 shadow-sm sm:p-8">
      {input.kind === "files" && <FileDrop accept={input.accept} multiple={input.multiple} label={input.label} files={files} onChange={setFiles} />}

      {input.kind === "url" && (
        <div>
          <label htmlFor="url" className="label">Website address</label>
          <input id="url" className="input py-3 text-base" type="url" required placeholder="https://example.com" value={text} onChange={(e) => setText(e.target.value)} />
        </div>
      )}

      {(input.kind === "html" || input.kind === "markdown") && (
        <div>
          <label htmlFor="code" className="label">{input.kind === "html" ? "Paste HTML" : "Paste Markdown"}</label>
          <textarea id="code" className="input min-h-48 font-mono" value={text} onChange={(e) => setText(e.target.value)}
            placeholder={input.kind === "html" ? "<h1>Hello</h1>\n<p>Your content…</p>" : "# Title\n\nYour **content**…"} />
          <div className="mt-3 text-sm text-muted">Or upload a file instead:</div>
          <div className="mt-2">
            <FileDrop accept={input.kind === "html" ? ".html,.htm,.css,.png,.jpg,.jpeg,.svg,.woff,.woff2" : ".md,.markdown,.txt"}
              multiple={input.kind === "html"} label={input.kind === "html" ? "HTML file and assets" : "Markdown file"} files={files} onChange={setFiles} />
          </div>
        </div>
      )}

      {tool.extraFiles?.map((x) => (
        <div key={x.name} className="mt-5">
          <div className="label">{x.label}</div>
          <FileDrop accept={x.accept} multiple={x.multiple} label="files" files={extra[x.name] ?? []}
            onChange={(list) => setExtra((prev) => ({ ...prev, [x.name]: list }))} />
        </div>
      ))}

      {basic.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {basic.map((f) => <FieldInput key={f.name} field={f} value={values[f.name]} onChange={(v) => setValues((p) => ({ ...p, [f.name]: v }))} />)}
        </div>
      )}

      {advanced.length > 0 && (
        <details className="mt-5 rounded-xl border border-line px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium">Advanced options</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {advanced.map((f) => <FieldInput key={f.name} field={f} value={values[f.name]} onChange={(v) => setValues((p) => ({ ...p, [f.name]: v }))} />)}
          </div>
        </details>
      )}

      <button type="submit" className="btn-primary mt-6 w-full py-3 text-base" disabled={busy}>
        {busy ? "Working…" : tool.output === "json" ? "Read file" : `${tool.name} now`}
      </button>

      <div aria-live="polite">
        {result?.kind === "error" && (
          <div className="mt-5 rounded-xl bg-accent-soft p-4 text-sm text-accent-dark">
            {result.message}
            {result.upgrade && <> <Link href="/pricing" className="font-semibold underline">See plans</Link></>}
          </div>
        )}
        {result?.kind === "json" && (
          <pre className="mt-5 max-h-96 overflow-auto rounded-xl bg-ink p-4 text-xs text-white">{result.text}</pre>
        )}
        {result?.kind === "file" && (
          <div className="mt-5 rounded-xl border border-line bg-paper p-4">
            {result.image && <img src={result.url} alt="Result preview" className="mb-4 max-h-96 w-full rounded-lg border border-line object-contain object-top bg-white" />}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm"><strong>Done.</strong> {result.name} · {formatSize(result.size)}</span>
              <a href={result.url} download={result.name} className="btn-ink">Download</a>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
