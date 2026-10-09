import { ImageResponse } from "next/og";
import { getPost, posts } from "@/content/posts";

export const alt = "GrowX blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  const title = post?.title ?? "GrowX Blog";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg, #FF4B5C 0%, #E11D2E 50%, #9F1239 100%)", color: "white" }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>GrowX · {post?.category ?? "Blog"}</div>
        <div style={{ display: "flex", fontSize: title.length > 80 ? 52 : 60, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 28, opacity: 0.9 }}>growxapp.org/blog</div>
      </div>
    ),
    size,
  );
}
