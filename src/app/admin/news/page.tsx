"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

interface NewsItem {
  id: number;
  title: string;
  category: string;
  published: boolean;
  created_at: string;
  author_id: string | null;
}

const categoryBadge: Record<string, string> = {
  "ข่าวสาร": "bg-blue-100 text-blue-700",
  "กิจกรรม": "bg-green-100 text-green-700",
  "ประชาสัมพันธ์": "bg-yellow-100 text-yellow-700",
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("news")
      .select("id,title,category,published,created_at,author_id")
      .order("created_at", { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function togglePublished(item: NewsItem) {
    const supabase = createClient();
    const { error } = await supabase
      .from("news")
      .update({ published: !item.published })
      .eq("id", item.id);
    if (error) {
      setMsg({ type: "error", text: "เกิดข้อผิดพลาด" });
    } else {
      setNews((prev) => prev.map((n) => n.id === item.id ? { ...n, published: !n.published } : n));
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("news").delete().eq("id", deleteId);
    setSaving(false);
    setDeleteId(null);
    if (error) {
      setMsg({ type: "error", text: "ลบไม่สำเร็จ" });
    } else {
      setMsg({ type: "success", text: "ลบข่าวสำเร็จ" });
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">จัดการข่าวสาร</h1>
        <Link
          href="/admin/news/create"
          className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + เพิ่มข่าวสาร
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
        ) : news.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg mb-2">📰</p>
            <p>ยังไม่มีข่าวสาร</p>
            <Link href="/admin/news/create" className="mt-3 inline-block text-blue-600 hover:underline text-sm">เพิ่มข่าวสารแรก</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">หัวข้อ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">หมวด</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">วันที่</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">เผยแพร่</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                      <p className="line-clamp-2">{item.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${categoryBadge[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(item.created_at).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublished(item)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${item.published ? "bg-green-500" : "bg-gray-300"}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${item.published ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/news/${item.id}/edit`}
                          className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors"
                        >
                          ✏️ แก้ไข
                        </Link>
                        <button
                          onClick={() => setDeleteId(item.id)}
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

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-gray-600 mb-6">คุณต้องการลบข่าวนี้ใช่หรือไม่?</p>
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
