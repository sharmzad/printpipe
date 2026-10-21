import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import PlanCards from "@/components/PlanCards";
import ToolGrid from "@/components/ToolGrid";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

const faq = [
  { q: "Is it free?", a: "Yes. You can use every tool a few times a day without an account, and a free account gives you 20 conversions a month. Paid plans start at $9/month." },
  { q: "Are my files safe?", a: "Files are processed in memory over an encrypted connection and deleted right after your result is sent back. We never look at or keep your documents." },
  { q: "Do I need to install anything?", a: "No. Everything runs in your browser on any device: Windows, Mac, Linux, iPhone or Android." },
  { q: "Can I use it from my own app?", a: "Yes. Pro and Business plans include an API key, so you can call every tool from your code." },
];

const popular = ["word-to-pdf", "merge-pdf", "compress-pdf", "url-to-pdf", "excel-to-pdf", "protect-pdf"];

export default function Home() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "Organization", name: site.name, url: site.url },
          { "@type": "WebSite", name: site.name, url: site.url },
          { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
        ],
      }} />

      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:pt-24">
        <p className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-dark">{tools.length} PDF tools · Online & API</p>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.05] sm:text-7xl">Every PDF tool,<br />one fast pipe.</h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Convert Word, Excel, PowerPoint, HTML and web pages to PDF. Merge, split, compress, watermark and protect PDFs. No install, no sign-up needed to try.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {popular.map((slug) => {
            const t = tools.find((x) => x.slug === slug)!;
            return <Link key={slug} href={`/tools/${slug}`} className="btn-ghost">{t.name}</Link>;
          })}
          <Link href="/tools" className="btn-ink">All tools →</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <ToolGrid />
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="grid gap-6 rounded-3xl bg-ink p-8 text-white sm:p-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl">Built for developers too</h2>
            <p className="mt-4 text-white/70">Every tool is one HTTP call away. Generate invoices from HTML, archive documents as PDF/A or batch-convert Office files from your own app.</p>
            <Link href="/api-docs" className="btn-primary mt-6">Read the API docs</Link>
          </div>
          <pre className="overflow-x-auto rounded-2xl bg-black/40 p-5 text-xs leading-relaxed text-white/90">{`curl ${site.url}/api/v1/html-to-pdf \\
  -H "Authorization: Bearer pp_live_..." \\
  --form-string html='<h1>Invoice #42</h1>' \\
  -F paperSize=8.27x11.7 \\
  -o invoice.pdf`}</pre>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4">
        <h2 className="mb-8 text-center font-display text-4xl">Simple pricing</h2>
        <PlanCards />
      </section>

      <section className="mx-auto mt-24 max-w-3xl px-4">
        <h2 className="mb-6 font-display text-4xl">Questions</h2>
        <div className="divide-y divide-line rounded-2xl border border-line bg-card">
          {faq.map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
