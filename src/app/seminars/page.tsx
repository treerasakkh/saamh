import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface Seminar {
  id: number;
  project_code: string;
  title: string;
  description: string;
  registration_fee: number;
  status: string;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
}

const statusBadge: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

const statusLabel: Record<string, string> = {
  open: "เปิดรับสมัคร",
  closed: "ปิดรับสมัคร",
  cancelled: "ยกเลิก",
};

export default async function SeminarsPage() {
  const supabase = await createClient();
  const { data: seminars } = await supabase
    .from("seminars")
    .select("*")
    .order("created_at", { ascending: false });

  const allSeminars: Seminar[] = seminars ?? [];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 py-16 px-4">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-yellow-400 font-semibold text-sm tracking-widest uppercase mb-2">SEMINARS & TRAINING</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">การอบรมและสัมมนา</h1>
          <p className="text-blue-200 text-sm">โครงการอบรมพัฒนาผู้บริหารโรงเรียนมัธยมศึกษาจังหวัดมุกดาหาร</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline">
            ← กลับหน้าแรก
          </Link>
        </div>

        {allSeminars.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🎓</p>
            <p className="text-lg">ยังไม่มีการอบรม</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allSeminars.map((seminar) => (
              <div
                key={seminar.id}
                className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusBadge[seminar.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {statusLabel[seminar.status] ?? seminar.status}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{seminar.project_code}</span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{seminar.title}</h2>
                      {seminar.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{seminar.description}</p>
                      )}
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                        {seminar.start_date && (
                          <span className="flex items-center gap-1">
                            📅 {new Date(seminar.start_date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                            {seminar.end_date && seminar.end_date !== seminar.start_date && (
                              <> – {new Date(seminar.end_date).toLocaleDateString("th-TH", { day: "numeric", month: "long" })}</>
                            )}
                          </span>
                        )}
                        {seminar.location && <span className="flex items-center gap-1">📍 {seminar.location}</span>}
                        <span className="flex items-center gap-1">👥 รับ {seminar.max_participants} คน</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-bold text-blue-800">
                        {Number(seminar.registration_fee) === 0
                          ? "ฟรี"
                          : `฿${Number(seminar.registration_fee).toLocaleString("th-TH")}`}
                      </p>
                      {Number(seminar.registration_fee) > 0 && (
                        <p className="text-xs text-gray-400">ค่าลงทะเบียน</p>
                      )}
                    </div>
                  </div>

                  {seminar.status === "open" && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link
                        href={`/seminars/${seminar.id}`}
                        className="inline-block rounded-lg bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                      >
                        สมัครเข้าร่วม
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
