import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import ToolForm from "@/components/ToolForm";
import { anonymous } from "@/lib/plans";
import { site } from "@/lib/site";
import { getTool, tools } from "@/lib/tools";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getTool((await params).slug);
  if (!tool) return {};
  return {
    title: { absolute: `${tool.title} | ${site.name}` },
    description: tool.description,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: { title: tool.title, description: tool.description, url: `/tools/${tool.slug}` },
  };
}

const commonFaq = [
  { q: "Is this tool free?", a: `Yes. You can use it ${anonymous.dailyConversions} times a day without an account. A free account gives you 20 conversions a month, and paid plans start at $9/month.` },
  { q: "Are my files kept private?", a: "Files are sent over an encrypted connection, processed in memory and deleted as soon as your result is ready." },
];

export default async function ToolPage({ params }: Props) {
  const tool = getTool((await params).slug);
  if (!tool) notFound();
  const faq = [...tool.faq, ...commonFaq];
  const related = tools.filter((t) => t.slug !== tool.slug && t.category === tool.category).slice(0, 4);
  const more = tools.filter((t) => t.category !== tool.category).slice(0, 8 - related.length);
  const url = `${site.url}/tools/${tool.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "SoftwareApplication",
            name: `${tool.name} – ${site.name}`,
            url,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any (web browser)",
            description: tool.description,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
          {
            "@type": "HowTo",
            name: `How to use ${tool.name}`,
            step: tool.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
          },
          { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Tools", item: `${site.url}/tools` },
              { "@type": "ListItem", position: 2, name: tool.name, item: url },
            ],
          },
        ],
      }} />

      <nav className="mb-6 text-sm text-muted"><Link href="/tools" className="hover:text-ink">Tools</Link> / {tool.name}</nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">{tool.name}</h1>
          <p className="mt-3 mb-8 max-w-2xl text-lg text-muted">{tool.intro}</p>
          <ToolForm tool={tool} />
        </div>

        <aside className="space-y-6 lg:pt-28">
          <div className="rounded-2xl border border-line bg-card p-6">
            <h2 className="font-semibold">How it works</h2>
            <ol className="mt-3 space-y-3 text-sm text-muted">
              {tool.steps.map((s, i) => (
                <li key={s} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-bold text-accent-dark">{i + 1}</span>{s}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-line bg-card p-6 text-sm">
            <h2 className="font-semibold">Need more?</h2>
            <p className="mt-2 text-muted">Pro gives you 1,000 conversions a month, 50 MB files and API access for $9/month.</p>
            <Link href="/pricing" className="btn-ink mt-4">See plans</Link>
          </div>
        </aside>
      </div>

      <section className="mt-16 max-w-3xl">
        <h2 className="mb-5 font-display text-3xl">{tool.name}: questions</h2>
        <div className="divide-y divide-line rounded-2xl border border-line bg-card">
          {faq.map((f) => (
            <details key={f.q} className="p-5">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-5 font-display text-3xl">Other tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...related, ...more].map((t) => (
            <Link key={t.slug} href={`/tools/${t.slug}`} className="rounded-2xl border border-line bg-card p-5 hover:border-ink">
              <div className="font-semibold">{t.name}</div>
              <p className="mt-1 line-clamp-2 text-sm text-muted">{t.intro}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
