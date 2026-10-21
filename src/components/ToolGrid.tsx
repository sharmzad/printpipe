import Link from "next/link";
import { categories, tools, type Category } from "@/lib/tools";

export default function ToolGrid() {
  return (
    <div className="space-y-12">
      {(Object.keys(categories) as Category[]).map((cat) => (
        <section key={cat}>
          <h2 className="mb-4 font-display text-2xl">{categories[cat]}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tools.filter((t) => t.category === cat).map((t) => (
              <Link key={t.slug} href={`/tools/${t.slug}`}
                className="group rounded-2xl border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-md">
                <div className="font-semibold group-hover:text-accent">{t.name}</div>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{t.intro}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
