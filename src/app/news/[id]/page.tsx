import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

const categoryColors: Record<string, string> = {
  "ข่าวสาร": "bg-blue-100 text-blue-700",
  "กิจกรรม": "bg-green-100 text-green-700",
  "ประชาสัมพันธ์": "bg-yellow-100 text-yellow-700",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .single();

  if (!news) notFound();

  const images: string[] = news.image_urls ?? [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-12 px-4">
        <div className="mx-auto max-w-3xl">
          <Link href="/news" className="inline-flex items-center gap-2 text-blue-300 hover:text-white text-sm mb-4 transition-colors">
            ← ข่าวสารทั้งหมด
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[news.category] ?? "bg-gray-100 text-gray-600"}`}>
              {news.category}
            </span>
            <span className="text-blue-300 text-sm">
              {new Date(news.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">{news.title}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Image gallery */}
        {images.length > 0 && (
          <div className={`mb-8 ${images.length === 1 ? "" : "grid grid-cols-2 md:grid-cols-3 gap-3"}`}>
            {images.map((url, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl shadow-md ${images.length === 1 ? "w-full" : ""}`}
              >
                <img
                  src={url}
                  alt={`รูปที่ ${i + 1}`}
                  className="w-full object-cover hover:scale-105 transition-transform duration-300"
                  style={{ maxHeight: images.length === 1 ? "480px" : "200px", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 lg:p-8">
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {news.content}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-between items-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline"
          >
            ← กลับไปข่าวสารทั้งหมด
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            หน้าแรก
          </Link>
        </div>
      </div>
    </main>
  );
}
