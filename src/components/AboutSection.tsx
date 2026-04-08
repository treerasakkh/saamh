export default function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-yellow-400 font-semibold text-sm tracking-widest uppercase mb-2">ABOUT US</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">เกี่ยวกับเรา</h2>
          <div className="mt-3 mx-auto w-16 h-1 bg-yellow-400 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Logo & Name */}
          <div className="lg:col-span-1 flex flex-col items-center text-center">
            <div className="relative mb-6 animate-float">
              <div className="relative w-40 h-40 rounded-full overflow-hidden ring-4 ring-yellow-400/60 shadow-2xl shadow-yellow-400/20">
                <img src="/logo.png" alt="โลโก้สมาคม" className="object-cover w-full h-full" />
              </div>
            </div>
            <h3 className="text-white font-bold text-lg leading-snug max-w-xs">
              สมาคมผู้บริหารโรงเรียนมัธยมศึกษาจังหวัดมุกดาหาร
            </h3>
            <p className="text-blue-300 text-sm mt-2">
              Secondary School Administrator Association of Mukdahan Province
            </p>
          </div>

          {/* Info cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                icon: "🏫",
                title: "ที่ตั้งสำนักงาน",
                content: "โรงเรียนมุกดาหาร เลขที่ 147 ถนนพิทักษ์พนมเขต อำเภอเมืองมุกดาหาร จังหวัดมุกดาหาร 49000",
              },
              {
                icon: "📞",
                title: "โทรศัพท์",
                content: "042-611-088",
              },
              {
                icon: "🎯",
                title: "พันธกิจ",
                content: "มุ่งพัฒนาการศึกษาและส่งเสริมความสามัคคีในหมู่ผู้บริหารโรงเรียนมัธยมศึกษาทั่วจังหวัดมุกดาหาร",
              },
              {
                icon: "🌏",
                title: "วิสัยทัศน์",
                content: "เป็นองค์กรชั้นนำที่ขับเคลื่อนการพัฒนาการศึกษามัธยมศึกษาในจังหวัดมุกดาหารให้ยั่งยืน",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{item.icon}</span>
                  <h4 className="text-yellow-400 font-semibold text-sm">{item.title}</h4>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-blue-400 text-xs">
          <p>© {new Date().getFullYear()} สมาคมผู้บริหารโรงเรียนมัธยมศึกษาจังหวัดมุกดาหาร</p>
          <p>พัฒนาด้วย Next.js · Tailwind CSS · Supabase</p>
        </div>
      </div>
    </section>
  );
}
