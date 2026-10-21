import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { tools } from "@/lib/tools";

export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default social share image for every page that doesn't define its own.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f7f5f0", padding: 72, color: "#16171d" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 700 }}>
          <div style={{ width: 64, height: 64, borderRadius: 14, background: "#e0482b", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>P</div>
          {site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>Every PDF tool,</div>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, color: "#e0482b" }}>one fast pipe.</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#5d6070" }}>{`${tools.length} tools · Word, Excel, HTML to PDF · Merge · Compress · API`}</div>
      </div>
    ),
    size,
  );
}
