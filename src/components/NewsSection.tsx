import { createClient } from "@/lib/supabase/server";
import { news as staticNews } from "@/data";
import Link from "next/link";

const categoryColors: Record<string, string> = {
  "ประชาสัมพันธ์": "bg-blue-100 text-blue-700",
  "กิจกรรม": "bg-green-100 text-green-700",
  "ข่าวสาร": "bg-yellow-100 text-yellow-700",
};

const categoryGradients: Record<string, string> = {
  "ประชาสัมพันธ์": "from-blue-600 to-blue-800",
  "กิจกรรม": "from-green-600 to-green-800",
  "ข่าวสาร": "from-indigo-600 to-indigo-800",
};

interface DBNewsItem {
  id: number;
  title: string;
  content: string;
  category: string;
  image_urls: string[];
  created_at: string;
}

interface DisplayItem {
  id: number | string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  color: string;
  href: string;
  imageUrl?: string;
}

function formatThaiDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function textExcerpt(text: string, max = 100) {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

export default async function NewsSection() {
  let displayItems: DisplayItem[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("news")
      .select("id,title,content,category,image_urls,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (data && data.length > 0) {
      displayItems = (data as DBNewsItem[]).map((item) => ({
        id: item.id,
        title: item.title,
        excerpt: textExcerpt(item.content),
        category: item.category,
        date: formatThaiDate(item.created_at),
        color: categoryGradients[item.category] ?? "from-blue-600 to-blue-800",
        href: `/news/${item.id}`,
        imageUrl: item.image_urls?.[0],
      }));
    }
  } catch {
    // Fall through to static data
  }

  // Fallback to static data if no DB data
  if (displayItems.length === 0) {
    displayItems = staticNews.map((item) => ({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      category: item.category,
      date: item.date,
      color: item.color,
      href: "#",
    }));
  }

  if (displayItems.length === 0) return null;

  return (
    <section id="home" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-2">NEWS & ACTIVITIES</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">ข่าวสารและกิจกรรม</h2>
          <div className="mt-3 mx-auto w-16 h-1 bg-yellow-400 rounded-full" />
        </div>

        {/* Featured news (first item big) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Big card */}
          <Link
            href={displayItems[0].href}
            className={`lg:col-span-3 relative rounded-2xl overflow-hidden bg-gradient-to-br ${displayItems[0].color} p-8 flex flex-col justify-end min-h-64 shadow-xl group cursor-pointer`}
          >
            {displayItems[0].imageUrl && (
              <img
                src={displayItems[0].imageUrl}
                alt={displayItems[0].title}
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
              />
            )}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-semibold rounded-full mb-3">
                {displayItems[0].category}
              </span>
              <h3 className="text-white text-xl font-bold leading-snug mb-2 group-hover:underline">
                {displayItems[0].title}
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed line-clamp-2">{displayItems[0].excerpt}</p>
              <p className="text-blue-200 text-xs mt-3">{displayItems[0].date}</p>
            </div>
          </Link>

          {/* Two stacked */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {displayItems.slice(1, 3).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${item.color} p-6 flex flex-col justify-end flex-1 shadow-lg group cursor-pointer`}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity"
                  />
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="relative z-10">
                  <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur text-white text-xs font-semibold rounded-full mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-white text-sm font-bold leading-snug group-hover:underline line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-blue-200 text-xs mt-2">{item.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Remaining news cards */}
        {displayItems.length > 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.slice(3).map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer"
              >
                <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                      {item.category}
                    </span>
                    <span className="text-gray-400 text-xs">{item.date}</span>
                  </div>
                  <h3 className="text-gray-900 font-bold text-sm leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">{item.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/news"
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-600 hover:text-white transition-colors inline-block"
          >
            ดูข่าวสารทั้งหมด
          </Link>
        </div>
      </div>
    </section>
  );
}
