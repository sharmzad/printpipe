export const site = {
  name: "PrintPipe",
  tagline: "Every PDF tool, one fast pipe.",
  description:
    "Convert Word, Excel, PowerPoint, HTML and web pages to PDF, then merge, split, compress, watermark and protect them. Online tools plus a developer API.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@example.com",
};
