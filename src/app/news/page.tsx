import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  image_urls: string[];
  created_at: string;
}

const categoryColors: Record<string, string> = {
  "ข่าวสาร": "bg-blue-100 text-blue-700",
  "กิจกรรม": "bg-green-100 text-green-700",
  "ประชาสัมพันธ์": "bg-yellow-100 text-yellow-700",
};

const categoryGradients: Record<string, string> = {
  "ข่าวสาร": "from-blue-700 to-blue-500",
  "กิจกรรม": "from-green-700 to-green-500",
  "ประชาสัมพันธ์": "from-yellow-600 to-yellow-400",
};

function excerpt(content: string, max = 120) {
  return content.length > max ? content.slice(0, max) + "..." : content;
}

export default async function NewsPage() {
  const supabase = await createClient();
  const { data: news } = await supabase
    .from("news")
    .select("id,title,content,category,image_urls,created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  const allNews: NewsItem[] = news ?? [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-16 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-yellow-400 font-semibold text-sm tracking-widest uppercase mb-2">NEWS & ACTIVITIES</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">ข่าวสารและกิจกรรม</h1>
          <p className="text-blue-200 text-sm">ติดตามข่าวสารและกิจกรรมล่าสุดของ ส.บ.ม.ม.ห.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Back link */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline">
            ← กลับหน้าแรก
          </Link>
        </div>

        {allNews.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">📰</p>
            <p className="text-lg">ยังไม่มีข่าวสาร</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {allNews.length > 0 && (
              <Link href={`/news/${allNews[0].id}`} className="block mb-8">
                <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${categoryGradients[allNews[0].category] ?? "from-blue-700 to-blue-500"} p-8 min-h-52 flex flex-col justify-end shadow-xl group`}>
                  {allNews[0].image_urls?.[0] && (
                    <img
                      src={allNews[0].image_urls[0]}
                      alt={allNews[0].title}
                      className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-semibold rounded-full mb-3">
                      {allNews[0].category}
                    </span>
                    <h2 className="text-white text-2xl font-bold leading-snug mb-2 group-hover:underline">
                      {allNews[0].title}
                    </h2>
                    <p className="text-blue-100 text-sm line-clamp-2">{excerpt(allNews[0].content)}</p>
                    <p className="text-blue-200 text-xs mt-3">
                      {new Date(allNews[0].created_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allNews.slice(1).map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  {item.image_urls?.[0] ? (
                    <div className="h-44 overflow-hidden">
                      <img
                        src={item.image_urls[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className={`h-2 bg-gradient-to-r ${categoryGradients[item.category] ?? "from-blue-700 to-blue-500"}`} />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {item.category}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(item.created_at).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                    <h3 className="text-gray-900 font-bold text-sm leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                      {excerpt(item.content)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
