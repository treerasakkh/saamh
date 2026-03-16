import { news } from "@/data";

const categoryColors: Record<string, string> = {
  "ประชาสัมพันธ์": "bg-blue-100 text-blue-700",
  "กิจกรรม": "bg-green-100 text-green-700",
  "ข่าวสาร": "bg-yellow-100 text-yellow-700",
};

export default function NewsSection() {
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
          <div className={`lg:col-span-3 relative rounded-2xl overflow-hidden bg-gradient-to-br ${news[0].color} p-8 flex flex-col justify-end min-h-64 shadow-xl group cursor-pointer`}>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur text-white text-xs font-semibold rounded-full mb-3">
                {news[0].category}
              </span>
              <h3 className="text-white text-xl font-bold leading-snug mb-2 group-hover:underline">
                {news[0].title}
              </h3>
              <p className="text-blue-100 text-sm leading-relaxed line-clamp-2">{news[0].excerpt}</p>
              <p className="text-blue-200 text-xs mt-3">{news[0].date}</p>
            </div>
          </div>

          {/* Two stacked */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {news.slice(1, 3).map((item) => (
              <div
                key={item.id}
                className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${item.color} p-6 flex flex-col justify-end flex-1 shadow-lg group cursor-pointer`}
              >
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
              </div>
            ))}
          </div>
        </div>

        {/* Remaining news cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.slice(3).map((item) => (
            <article
              key={item.id}
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
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-600 hover:text-white transition-colors">
            ดูข่าวสารทั้งหมด
          </button>
        </div>
      </div>
    </section>
  );
}
