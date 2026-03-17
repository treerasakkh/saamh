import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalMembers },
    { count: pendingCount },
    { count: newsCount },
    { count: seminarCount },
    { data: pendingProfiles },
    { data: recentNews },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "member"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "pending"),
    supabase.from("news").select("*", { count: "exact", head: true }),
    supabase.from("seminars").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("id,full_name,email,school,member_type,created_at").eq("role", "pending").order("created_at", { ascending: false }).limit(8),
    supabase.from("news").select("id,title,category,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString("th-TH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "สมาชิกทั้งหมด", value: totalMembers ?? 0, icon: "👥", href: "/admin/members?tab=member", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
          { label: "รออนุมัติ", value: pendingCount ?? 0, icon: "⏳", href: "/admin/members?tab=pending", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
          { label: "ข่าวสาร", value: newsCount ?? 0, icon: "📰", href: "/admin/news", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
          { label: "การอบรม", value: seminarCount ?? 0, icon: "🎓", href: "/admin/seminars", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className={`rounded-2xl border ${stat.border} ${stat.bg} p-5 shadow-sm hover:shadow-md transition-shadow`}>
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`text-3xl font-bold ${stat.text}`}>{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending approvals */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">รออนุมัติสมาชิกใหม่</h2>
            <Link href="/admin/members?tab=pending" className="text-sm text-blue-600 hover:underline">ดูทั้งหมด →</Link>
          </div>
          {(pendingProfiles?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">ไม่มีรายการรออนุมัติ</p>
          ) : (
            <div className="space-y-3">
              {(pendingProfiles ?? []).map((p: { id: string; full_name: string; email: string; school: string; member_type: string; created_at: string }) => (
                <div key={p.id} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.full_name || "(ไม่ระบุชื่อ)"}</p>
                    <p className="text-xs text-gray-500">{p.email}</p>
                    <p className="text-xs text-gray-400">{p.school || "-"} · {p.member_type}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0 ml-2">
                    {new Date(p.created_at).toLocaleDateString("th-TH")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent news */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">ข่าวสารล่าสุด</h2>
            <Link href="/admin/news" className="text-sm text-blue-600 hover:underline">ดูทั้งหมด →</Link>
          </div>
          {(recentNews?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">ยังไม่มีข่าวสาร</p>
          ) : (
            <div className="space-y-3">
              {(recentNews ?? []).map((item: { id: number; title: string; category: string; created_at: string }) => (
                <div key={item.id} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="mt-0.5 inline-block px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 shrink-0">
                    {item.category}
                  </span>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1 flex-1">{item.title}</p>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(item.created_at).toLocaleDateString("th-TH")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">ดำเนินการด่วน</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/news/create" className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
            <span>+</span> เพิ่มข่าวสาร
          </Link>
          <Link href="/admin/seminars/create" className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors">
            <span>+</span> เพิ่มการอบรม
          </Link>
          <Link href="/admin/members?tab=pending" className="inline-flex items-center gap-2 rounded-lg border border-yellow-400 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-100 transition-colors">
            <span>⏳</span> อนุมัติสมาชิก ({pendingCount ?? 0})
          </Link>
        </div>
      </div>
    </div>
  );
}
