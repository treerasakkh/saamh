import { objectives } from "@/data";

export default function ObjectivesSection() {
  return (
    <section id="objectives" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-2">OBJECTIVES</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">วัตถุประสงค์</h2>
          <div className="mt-3 mx-auto w-16 h-1 bg-yellow-400 rounded-full" />
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            สมาคมผู้บริหารโรงเรียนมัธยมศึกษาจังหวัดมุกดาหาร ดำเนินงานตามวัตถุประสงค์หลัก 5 ประการ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {objectives.map((obj, i) => (
            <div
              key={i}
              className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 text-center border border-blue-100 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              {/* Number badge */}
              <div className="absolute -top-3 -right-3 w-7 h-7 bg-blue-900 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                {i + 1}
              </div>

              <div className="text-4xl mb-4">{obj.icon}</div>
              <h3 className="text-blue-900 font-bold text-base mb-2">{obj.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{obj.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
