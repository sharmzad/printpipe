import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { tools, type Tool } from "@/lib/tools";

export const metadata: Metadata = {
  title: "PDF API Documentation – HTML to PDF, Office to PDF, Merge & More",
  description: "Generate and edit PDFs from your code. One REST endpoint per tool: HTML, URL and Office to PDF, merge, split, compress, watermark, encrypt and more.",
  alternates: { canonical: "/api-docs" },
};

function example(tool: Tool) {
  const lines = [`curl ${site.url}/api/v1/${tool.slug}`, `  -H "Authorization: Bearer $PRINTPIPE_KEY"`];
  if (tool.input.kind === "files") lines.push(`  -F files=@document${tool.input.accept.startsWith(".pdf") ? ".pdf" : ".docx"}`);
  if (tool.input.kind === "url") lines.push(`  -F url=https://example.com`);
  if (tool.input.kind === "html") lines.push(`  --form-string html='<h1>Hello</h1>'`);
  if (tool.input.kind === "markdown") lines.push(`  --form-string markdown='# Hello'`);
  for (const x of tool.extraFiles ?? []) if (x.required) lines.push(`  -F ${x.name}=@attachment.xml`);
  for (const f of tool.fields.filter((f) => f.required)) lines.push(`  -F ${f.name}=${String(f.default ?? "...")}`);
  lines.push(`  -o ${tool.output === "json" ? "result.json" : tool.output === "image" ? "screenshot.png" : "result.pdf"}`);
  return lines.join(" \\\n");
}

export default function ApiDocs() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-5xl">PDF API</h1>
      <div className="prose-simple mt-6">
        <p>Every tool on {site.name} is also an API endpoint. Send a <code>multipart/form-data</code> POST request and get the file back in the response body.</p>
        <h2>Authentication</h2>
        <p>Create an API key in your <Link href="/dashboard" className="underline">dashboard</Link> (Pro and Business plans) and send it as a Bearer token:</p>
      </div>
      <pre className="overflow-x-auto rounded-xl bg-ink p-4 text-sm text-white">Authorization: Bearer pp_live_xxxxxxxxxxxxxxxx</pre>
      <div className="prose-simple">
        <h2>Responses</h2>
        <ul>
          <li><strong>200</strong>: the file (PDF, ZIP, image or JSON depending on the tool).</li>
          <li><strong>400</strong>: invalid input. <strong>401</strong>: bad API key. <strong>402</strong>: monthly limit reached. <strong>413</strong>: file too large for your plan.</li>
          <li>Errors are JSON: <code>{`{"error":"message"}`}</code></li>
        </ul>
        <p>Checkbox options take <code>true</code> or <code>false</code>. Fields you leave out use their defaults.</p>
        <h2>Endpoints</h2>
      </div>

      <div className="space-y-10">
        {tools.map((tool) => (
          <section key={tool.slug} id={tool.slug} className="scroll-mt-24 rounded-2xl border border-line bg-card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-xl font-semibold">{tool.name}</h3>
              <code className="text-sm text-muted">POST /api/v1/{tool.slug}</code>
            </div>
            <p className="mt-2 text-sm text-muted">{tool.intro}</p>
            <table className="mt-4 w-full text-left text-sm">
              <thead><tr className="border-b border-line text-muted"><th className="py-2 pr-4">Field</th><th className="py-2 pr-4">Type</th><th className="py-2">Notes</th></tr></thead>
              <tbody>
                {tool.input.kind === "files" && <tr className="border-b border-line"><td className="py-2 pr-4 font-mono">files</td><td className="pr-4">file{tool.input.multiple ? "[]" : ""}</td><td>Required. {tool.input.label}</td></tr>}
                {tool.input.kind === "url" && <tr className="border-b border-line"><td className="py-2 pr-4 font-mono">url</td><td className="pr-4">string</td><td>Required. Public http(s) URL</td></tr>}
                {(tool.input.kind === "html" || tool.input.kind === "markdown") && <tr className="border-b border-line"><td className="py-2 pr-4 font-mono">{tool.input.kind} or files</td><td className="pr-4">string / file[]</td><td>Required. Inline source or uploaded file{tool.input.kind === "html" ? "s (first .html becomes index.html; add images, CSS and fonts alongside)" : ""}</td></tr>}
                {tool.extraFiles?.map((x) => <tr key={x.name} className="border-b border-line"><td className="py-2 pr-4 font-mono">{x.name}</td><td className="pr-4">file{x.multiple ? "[]" : ""}</td><td>{x.required ? "Required. " : ""}{x.label}</td></tr>)}
                {tool.fields.map((f) => (
                  <tr key={f.name} className="border-b border-line last:border-0">
                    <td className="py-2 pr-4 font-mono">{f.name}</td>
                    <td className="pr-4">{f.type === "checkbox" ? "boolean" : f.type === "select" ? "enum" : f.type === "number" ? "number" : "string"}</td>
                    <td>
                      {f.required ? "Required. " : ""}{f.label}
                      {f.options && <span className="text-muted"> ({f.options.map((o) => o.value || "empty").join(", ")})</span>}
                      {f.default !== undefined && f.type !== "textarea" && <span className="text-muted"> Default: {String(f.default) || "none"}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 text-xs text-white">{example(tool)}</pre>
          </section>
        ))}
      </div>
    </div>
  );
}
