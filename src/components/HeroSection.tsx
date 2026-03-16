export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-700/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-800/10 blur-3xl" />
      </div>

      <div className="relative z-10 text-center px-4 py-24 max-w-4xl mx-auto animate-fadeInUp">
        {/* Emblem */}
        <div className="mx-auto mb-8 flex items-center justify-center animate-float">
          <div className="relative w-36 h-36">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-yellow-400/60" />
            <div className="absolute inset-2 rounded-full border-2 border-yellow-400/40" />
            {/* Inner circle */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-2xl">
              <div className="text-center">
                <p className="text-blue-900 font-black text-base leading-tight">ส.บ.</p>
                <p className="text-blue-900 font-black text-base leading-tight">ม.ม.ห.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-white font-extrabold leading-tight mb-4">
          <span className="block text-yellow-400 text-xl sm:text-2xl font-bold tracking-widest mb-2">
            S.A.A.M.H.
          </span>
          <span className="block text-2xl sm:text-3xl lg:text-4xl">
            สมาคมผู้บริหารโรงเรียนมัธยมศึกษา
          </span>
          <span className="block text-2xl sm:text-3xl lg:text-4xl">
            จังหวัดมุกดาหาร
          </span>
        </h1>

        <p className="text-blue-200 text-base sm:text-lg mt-4 mb-10 max-w-xl mx-auto leading-relaxed">
          มุ่งมั่นพัฒนาการศึกษา สร้างเครือข่ายผู้บริหาร ยกระดับคุณภาพชีวิต<br />
          นักเรียนและชุมชนในจังหวัดมุกดาหาร
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="#home"
            className="px-8 py-3 bg-yellow-400 text-blue-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 hover:shadow-yellow-400/30 transition-all"
          >
            ข่าวสารล่าสุด
          </a>
          <a
            href="#members"
            className="px-8 py-3 border-2 border-white/40 text-white font-semibold rounded-full hover:bg-white/10 transition-all"
          >
            สมัครสมาชิก
          </a>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto">
          {[
            { value: "12+", label: "โรงเรียน" },
            { value: "8", label: "กรรมการ" },
            { value: "5", label: "วัตถุประสงค์" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-yellow-400 text-3xl font-black">{s.value}</p>
              <p className="text-blue-300 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-blue-300 animate-bounce">
        <span className="text-xs">เลื่อนลง</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
