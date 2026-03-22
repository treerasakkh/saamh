import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ใช้ admin client เพื่อดึง profile ของตัวเอง (bypass RLS กรณี profile ยังไม่ถูกสร้าง)
  const adminDb = createAdminClient();

  const { data: profile } = await adminDb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // ถ้ายังไม่มี profile ให้สร้างอัตโนมัติ
  if (!profile) {
    await adminDb.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      full_name: user.user_metadata?.full_name ?? "",
      phone: user.user_metadata?.phone ?? "",
      school: user.user_metadata?.school ?? "",
      member_type: user.user_metadata?.member_type ?? "สามัญ",
      role: "pending",
    }, { onConflict: "id", ignoreDuplicates: true });
  }

  const role = profile?.role ?? "pending";

  // Admin dashboard stats — ใช้ admin client bypass RLS
  if (role === "admin") {
    const [
      { count: totalMembers },
      { count: pendingCount },
      { count: newsCount },
      { count: seminarCount },
      { data: pendingProfiles },
    ] = await Promise.all([
      adminDb.from("profiles").select("*", { count: "exact", head: true }).eq("role", "member"),
      adminDb.from("profiles").select("*", { count: "exact", head: true }).eq("role", "pending"),
      adminDb.from("news").select("*", { count: "exact", head: true }),
      adminDb.from("seminars").select("*", { count: "exact", head: true }),
      adminDb.from("profiles").select("id,full_name,email,school,created_at").eq("role", "pending").order("created_at", { ascending: false }).limit(5),
    ]);

    return (
      <main className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดผู้ดูแลระบบ</h1>
              <p className="text-sm text-gray-500 mt-0.5">ยินดีต้อนรับ, {profile?.full_name || user.email}</p>
            </div>
            <form action="/auth/signout" method="post">
              <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                ออกจากระบบ
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "สมาชิกทั้งหมด", value: totalMembers ?? 0, icon: "👥", color: "bg-blue-50 text-blue-700", border: "border-blue-200" },
              { label: "รออนุมัติ", value: pendingCount ?? 0, icon: "⏳", color: "bg-yellow-50 text-yellow-700", border: "border-yellow-200" },
              { label: "ข่าวสาร", value: newsCount ?? 0, icon: "📰", color: "bg-green-50 text-green-700", border: "border-green-200" },
              { label: "การอบรม", value: seminarCount ?? 0, icon: "🎓", color: "bg-purple-50 text-purple-700", border: "border-purple-200" },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-2xl border ${stat.border} bg-white p-5 shadow-sm`}>
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className={`text-3xl font-bold ${stat.color.split(" ")[1]}`}>{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/admin/members", label: "จัดการสมาชิก", icon: "👥" },
              { href: "/admin/news", label: "จัดการข่าวสาร", icon: "📰" },
              { href: "/admin/committee", label: "จัดการคณะกรรมการ", icon: "🏛️" },
              { href: "/admin/seminars", label: "จัดการการอบรม", icon: "🎓" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-center group"
              >
                <div className="text-3xl mb-2">{link.icon}</div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{link.label}</p>
              </Link>
            ))}
          </div>

          {/* Pending approvals */}
          {(pendingProfiles?.length ?? 0) > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">รออนุมัติสมาชิกใหม่</h2>
                <Link href="/admin/members" className="text-sm text-blue-600 hover:underline">ดูทั้งหมด</Link>
              </div>
              <div className="space-y-3">
                {(pendingProfiles ?? []).map((p: { id: string; full_name: string; email: string; school: string; created_at: string }) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.full_name || "-"}</p>
                      <p className="text-xs text-gray-500">{p.email} · {p.school || "-"}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(p.created_at).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // Member / Pending dashboard
  const { data: recentNews } = await supabase
    .from("news")
    .select("id,title,category,created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const roleLabels: Record<string, { label: string; color: string }> = {
    member: { label: "สมาชิก", color: "bg-green-100 text-green-700" },
    pending: { label: "รออนุมัติ", color: "bg-yellow-100 text-yellow-700" },
    rejected: { label: "ไม่อนุมัติ", color: "bg-red-100 text-red-700" },
  };
  const roleInfo = roleLabels[role] ?? { label: role, color: "bg-gray-100 text-gray-700" };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ด</h1>
          <form action="/auth/signout" method="post">
            <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              ออกจากระบบ
            </button>
          </form>
        </div>

        {/* Profile summary */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-800 to-blue-700 p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-blue-900 font-bold text-lg shadow-md">
              {(profile?.full_name || "ส").charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold">{profile?.full_name || "ไม่ระบุชื่อ"}</h2>
              <p className="text-blue-200 text-sm">{user.email}</p>
              <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
          {profile?.member_code && (
            <div className="mt-4 rounded-xl bg-white/10 px-4 py-2">
              <p className="text-blue-200 text-xs">รหัสสมาชิก</p>
              <p className="text-white font-bold text-lg">{profile.member_code}</p>
            </div>
          )}
        </div>

        {/* Status notice for pending */}
        {role === "pending" && (
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
            <p className="font-semibold text-yellow-800 mb-1">บัญชีของท่านอยู่ระหว่างการตรวจสอบ</p>
            <p className="text-sm text-yellow-700">
              เจ้าหน้าที่กำลังตรวจสอบข้อมูลการสมัครของท่าน กรุณารอการอนุมัติจากผู้ดูแลระบบ
            </p>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/profile"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-center group"
          >
            <div className="text-3xl mb-2">👤</div>
            <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">แก้ไขโปรไฟล์</p>
          </Link>
          <Link
            href="/seminars"
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-center group"
          >
            <div className="text-3xl mb-2">🎓</div>
            <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">สมัครอบรม</p>
          </Link>
        </div>

        {/* Recent news */}
        {(recentNews?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">ข่าวสารล่าสุด</h2>
              <Link href="/news" className="text-sm text-blue-600 hover:underline">ดูทั้งหมด</Link>
            </div>
            <div className="space-y-3">
              {(recentNews ?? []).map((item: { id: number; title: string; category: string; created_at: string }) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0 hover:text-blue-700 group"
                >
                  <span className="mt-0.5 inline-block px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 shrink-0">
                    {item.category}
                  </span>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 line-clamp-1">{item.title}</p>
                  <span className="ml-auto shrink-0 text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString("th-TH")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
