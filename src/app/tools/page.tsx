import type { Metadata } from "next";
import ToolGrid from "@/components/ToolGrid";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "All PDF Tools – Convert, Merge, Split, Compress & Protect",
  description: `${tools.length} free online PDF tools: convert Office, HTML and web pages to PDF, merge, split, compress, rotate, watermark, protect and more.`,
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="font-display text-5xl">All PDF tools</h1>
      <p className="mt-4 mb-12 max-w-2xl text-lg text-muted">Everything you need to create and work with PDFs, in your browser or through our API.</p>
      <ToolGrid />
    </div>
  );
}
