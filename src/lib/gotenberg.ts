import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { Tool } from "./tools";

const MARKDOWN_TEMPLATE = `<!doctype html>
<html><head><meta charset="utf-8"><style>
body{font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#1b1b1f;max-width:46rem;margin:0 auto;font-size:14px}
h1,h2,h3{line-height:1.25;margin:1.6em 0 .6em}h1{font-size:2em;border-bottom:1px solid #ddd;padding-bottom:.3em}
code{background:#f3f3f3;padding:.15em .35em;border-radius:4px;font-size:.9em}
pre{background:#f6f6f6;padding:1em;border-radius:6px;overflow:auto}pre code{background:none;padding:0}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:.4em .7em;text-align:left}
blockquote{border-left:4px solid #ddd;margin:0;padding:0 1em;color:#555}img{max-width:100%}
</style></head><body>{{ toHTML "content.md" }}</body></html>`;

export class InputError extends Error {}

function isPrivateAddress(address: string) {
  if (isIP(address) === 6) {
    const a = address.toLowerCase();
    if (a.startsWith("::ffff:")) return isPrivateAddress(a.slice(7));
    return a === "::1" || a === "::" || a.startsWith("fc") || a.startsWith("fd") || a.startsWith("fe80");
  }
  const [a, b] = address.split(".").map(Number);
  return (
    a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224
  );
}

// Stops people from pointing Chrome at our own private network (database, metadata endpoints...).
async function assertPublicUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new InputError("Enter a full URL starting with https://");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new InputError("Only http and https URLs are supported.");
  if (url.hostname.endsWith(".internal") || url.hostname === "localhost") throw new InputError("That address is not allowed.");
  const addresses = await lookup(url.hostname, { all: true }).catch(() => []);
  if (addresses.length === 0) throw new InputError("We couldn't find that website.");
  if (addresses.some((a) => isPrivateAddress(a.address))) throw new InputError("That address is not allowed.");
  return url.toString();
}

function str(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function files(form: FormData, name: string) {
  return form.getAll(name).filter((v): v is File => typeof v !== "string" && v.size > 0);
}

// Turns the form our site (or an API client) sent into the exact form Gotenberg expects.
// Only fields declared on the tool are forwarded.
export async function buildGotenbergForm(tool: Tool, input: FormData) {
  const out = new FormData();
  let bytes = 0;

  const addFile = (name: string, file: File, filename = file.name) => {
    bytes += file.size;
    out.append(name, file, filename);
  };

  switch (tool.input.kind) {
    case "files": {
      const list = files(input, "files");
      if (list.length < (tool.input.min ?? 1))
        throw new InputError(tool.input.min && tool.input.min > 1 ? `Upload at least ${tool.input.min} files.` : "Upload a file first.");
      if (!tool.input.multiple && list.length > 1) throw new InputError("This tool takes one file at a time.");
      list.forEach((f) => addFile("files", f));
      break;
    }
    case "url":
      out.append("url", await assertPublicUrl(str(input.get("url"))));
      break;
    case "html": {
      const uploaded = files(input, "files");
      const html = str(input.get("html"));
      if (uploaded.length) uploaded.forEach((f, i) => addFile("files", f, i === 0 && f.name.endsWith(".html") ? "index.html" : f.name));
      else if (html) addFile("files", new File([html], "index.html", { type: "text/html" }));
      else throw new InputError("Paste some HTML or upload an .html file.");
      break;
    }
    case "markdown": {
      const uploaded = files(input, "files");
      const md = uploaded[0] ? await uploaded[0].text() : str(input.get("markdown"));
      if (!md) throw new InputError("Paste some Markdown or upload an .md file.");
      addFile("files", new File([MARKDOWN_TEMPLATE], "index.html", { type: "text/html" }));
      addFile("files", new File([md], "content.md", { type: "text/markdown" }));
      break;
    }
  }

  for (const extra of tool.extraFiles ?? []) {
    const list = files(input, extra.name);
    if (extra.required && list.length === 0) throw new InputError(`Add at least one file under “${extra.label}”.`);
    (extra.multiple ? list : list.slice(0, 1)).forEach((f) => addFile(extra.name, f));
  }

  const metadata: Record<string, string> = {};
  for (const field of tool.fields) {
    const value = str(input.get(field.name));
    if (field.virtual) {
      if (field.name === "paperSize" && value) {
        const [w, h] = value.split("x");
        out.append("paperWidth", w);
        out.append("paperHeight", h);
      } else if (field.name === "margin" && value) {
        for (const side of ["Top", "Bottom", "Left", "Right"]) out.append(`margin${side}`, value);
      } else if (field.name.startsWith("meta") && value) {
        metadata[field.name.slice(4)] = value;
      }
      continue;
    }
    if (!value) {
      if (field.required) throw new InputError(`“${field.label}” is required.`);
      continue;
    }
    out.append(field.name, value);
  }
  if (tool.route === "pdfengines/metadata/write") {
    if (Object.keys(metadata).length === 0) throw new InputError("Fill in at least one field.");
    out.append("metadata", JSON.stringify(metadata));
  }

  // Image watermarks and stamps point at the uploaded file by name.
  for (const kind of ["watermark", "stamp"]) {
    if (str(input.get(`${kind}Source`)) === "image") {
      const file = out.get(kind);
      if (!(file instanceof File)) throw new InputError(`Upload a ${kind} image.`);
      out.set(`${kind}Expression`, file.name);
    }
  }

  for (const [k, v] of Object.entries(tool.fixed ?? {})) out.set(k, v);

  return { form: out, bytes };
}

export async function callGotenberg(tool: Tool, form: FormData) {
  const base = process.env.GOTENBERG_URL;
  if (!base) throw new Error("GOTENBERG_URL is not set");
  const headers: Record<string, string> = { "Gotenberg-Output-Filename": `printpipe-${tool.slug}` };
  if (process.env.GOTENBERG_USERNAME) {
    const token = Buffer.from(`${process.env.GOTENBERG_USERNAME}:${process.env.GOTENBERG_PASSWORD ?? ""}`).toString("base64");
    headers.Authorization = `Basic ${token}`;
  }
  return fetch(`${base.replace(/\/$/, "")}/forms/${tool.route}`, {
    method: "POST",
    body: form,
    headers,
    signal: AbortSignal.timeout(120_000),
  });
}
