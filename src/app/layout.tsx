import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import Analytics from "@/components/Analytics";
import ConversionEvents from "@/components/ConversionEvents";
import HeaderAuth from "@/components/HeaderAuth";
import { site } from "@/lib/site";
import { categories, tools } from "@/lib/tools";
import "./globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body-face" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display-face", weight: ["500", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} – Free Online PDF Converter & PDF Tools`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, type: "website" },
  twitter: { card: "summary" },
};

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm text-white">P</span>
      {site.name}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <header className="border-b border-line bg-paper/80 backdrop-blur sticky top-0 z-20">
          <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Logo />
            <div className="flex items-center gap-1 text-sm sm:gap-4">
              <Link href="/tools" className="hidden px-2 py-1 hover:text-accent sm:block">Tools</Link>
              <Link href="/pricing" className="px-2 py-1 hover:text-accent">Pricing</Link>
              <Link href="/api-docs" className="hidden px-2 py-1 hover:text-accent sm:block">API</Link>
              <HeaderAuth />
            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="mt-24 border-t border-line bg-card">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <Logo />
              <p className="mt-3 max-w-xs text-sm text-muted">{site.tagline} Convert, edit and protect PDFs online or through our API.</p>
            </div>
            {(Object.keys(categories) as (keyof typeof categories)[]).filter((c) => c !== "inspect").map((cat) => (
              <div key={cat}>
                <h3 className="mb-3 text-sm font-semibold">{categories[cat]}</h3>
                <ul className="space-y-2 text-sm text-muted">
                  {tools.filter((t) => t.category === cat || (cat === "edit" && t.category === "inspect")).map((t) => (
                    <li key={t.slug}><Link href={`/tools/${t.slug}`} className="hover:text-ink">{t.name}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-line px-4 py-6 text-sm text-muted">
            <span>© {new Date().getFullYear()} {site.name}</span>
            <div className="flex gap-4">
              <Link href="/pricing">Pricing</Link>
              <Link href="/api-docs">API</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <a href={`mailto:${site.supportEmail}`}>Contact</a>
            </div>
          </div>
        </footer>
        <Analytics />
        <Suspense>
          <ConversionEvents />
        </Suspense>
      </body>
    </html>
  );
}
