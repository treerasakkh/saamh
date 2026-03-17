"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

interface Seminar {
  id: number;
  project_code: string;
  title: string;
  registration_fee: number;
  status: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  created_at: string;
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

export default function AdminSeminarsPage() {
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("seminars")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setSeminars(data);
      // Fetch counts
      const countMap: Record<number, number> = {};
      await Promise.all(
        data.map(async (s: Seminar) => {
          const { count } = await supabase
            .from("seminar_registrations")
            .select("*", { count: "exact", head: true })
            .eq("seminar_id", s.id);
          countMap[s.id] = count ?? 0;
        })
      );
      setCounts(countMap);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!deleteId) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("seminars").delete().eq("id", deleteId);
    setSaving(false);
    setDeleteId(null);
    if (error) {
      setMsg({ type: "error", text: "ลบไม่สำเร็จ" });
    } else {
      setMsg({ type: "success", text: "ลบการอบรมแล้ว" });
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">จัดการการอบรม</h1>
        <Link
          href="/admin/seminars/create"
          className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + สร้างการอบรม
        </Link>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-3 underline text-xs">ปิด</button>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">กำลังโหลด...</div>
        ) : seminars.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg mb-2">🎓</p>
            <p>ยังไม่มีการอบรม</p>
            <Link href="/admin/seminars/create" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
              สร้างการอบรมแรก
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">รหัส</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">ชื่อโครงการ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">ค่าลงทะเบียน</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">สถานะ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">ผู้สมัคร</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {seminars.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.project_code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{s.title}</p>
                      {s.start_date && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(s.start_date).toLocaleDateString("th-TH")}
                          {s.end_date && s.end_date !== s.start_date && ` – ${new Date(s.end_date).toLocaleDateString("th-TH")}`}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 hidden md:table-cell">
                      {Number(s.registration_fee).toLocaleString("th-TH")} บาท
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {statusLabel[s.status] ?? s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-gray-700 font-medium">{counts[s.id] ?? 0}</span>
                      <span className="text-gray-400 text-xs"> / {s.max_participants}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <Link
                          href={`/admin/seminars/${s.id}/registrations`}
                          className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors"
                        >
                          📋 ผู้สมัคร
                        </Link>
                        <Link
                          href={`/admin/seminars/${s.id}/edit`}
                          className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors"
                        >
                          ✏️ แก้ไข
                        </Link>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-red-100 hover:text-red-600 transition-colors"
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-gray-600 mb-6">คุณต้องการลบการอบรมนี้ใช่หรือไม่? ข้อมูลการสมัครทั้งหมดจะถูกลบด้วย</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleDelete} disabled={saving} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60">
                {saving ? "กำลังลบ..." : "ยืนยันลบ"}
              </button>
              <button onClick={() => setDeleteId(null)} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
