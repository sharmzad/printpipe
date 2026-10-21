import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-5xl">Page not found</h1>
      <p className="mt-4 text-muted">That page doesn't exist. Maybe one of our tools is what you're after?</p>
      <Link href="/tools" className="btn-primary mt-8">Browse all tools</Link>
    </div>
  );
}
