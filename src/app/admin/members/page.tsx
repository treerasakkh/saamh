"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  school: string;
  member_type: string;
  role: string;
  member_code: string;
  note: string;
  created_at: string;
}

type Tab = "all" | "pending" | "member" | "rejected";

const roleBadge: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  member: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-700",
};

const roleLabel: Record<string, string> = {
  admin: "ผู้ดูแลระบบ",
  member: "สมาชิก",
  pending: "รออนุมัติ",
  rejected: "ไม่อนุมัติ",
};

function generateMemberCode(): string {
  const year = new Date().getFullYear() + 543;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SAAMH-${year}-${rand}`;
}

export default function AdminMembersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setProfiles(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = profiles.filter((p) => {
    if (activeTab === "all") return true;
    return p.role === activeTab;
  });

  async function handleApprove(profile: Profile) {
    setActionLoading(profile.id);
    const supabase = createClient();
    const code = profile.member_code || generateMemberCode();
    const { error } = await supabase
      .from("profiles")
      .update({ role: "member", member_code: code })
      .eq("id", profile.id);
    setActionLoading(null);
    if (error) {
      setMsg({ type: "error", text: "เกิดข้อผิดพลาด: " + error.message });
    } else {
      setMsg({ type: "success", text: `อนุมัติ ${profile.full_name || profile.email} สำเร็จ` });
      load();
    }
  }

  async function handleReject(profile: Profile) {
    setActionLoading(profile.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: "rejected" })
      .eq("id", profile.id);
    setActionLoading(null);
    if (error) {
      setMsg({ type: "error", text: "เกิดข้อผิดพลาด: " + error.message });
    } else {
      setMsg({ type: "success", text: `ปฏิเสธ ${profile.full_name || profile.email} แล้ว` });
      load();
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").delete().eq("id", deleteId);
    setSaving(false);
    setDeleteId(null);
    if (error) {
      setMsg({ type: "error", text: "ลบไม่สำเร็จ: " + error.message });
    } else {
      setMsg({ type: "success", text: "ลบสมาชิกแล้ว" });
      load();
    }
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editProfile) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update(editData)
      .eq("id", editProfile.id);
    setSaving(false);
    if (error) {
      setMsg({ type: "error", text: "บันทึกไม่สำเร็จ: " + error.message });
    } else {
      setEditProfile(null);
      setMsg({ type: "success", text: "บันทึกข้อมูลสำเร็จ" });
      load();
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "ทั้งหมด" },
    { key: "pending", label: "รออนุมัติ" },
    { key: "member", label: "สมาชิก" },
    { key: "rejected", label: "ปฏิเสธ" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">จัดการสมาชิก</h1>

      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-3 underline text-xs">ปิด</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-blue-800 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-70">
              ({profiles.filter((p) => tab.key === "all" ? true : p.role === tab.key).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">ไม่พบข้อมูล</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">ชื่อ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">อีเมล</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">โรงเรียน</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">ประเภท</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">สถานะ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {p.full_name || "(ไม่ระบุชื่อ)"}
                      {p.member_code && <p className="text-xs text-gray-400">{p.member_code}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.email}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.school || "-"}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{p.member_type}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge[p.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {roleLabel[p.role] ?? p.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {p.role === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(p)}
                              disabled={actionLoading === p.id}
                              className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              ✅ อนุมัติ
                            </button>
                            <button
                              onClick={() => handleReject(p)}
                              disabled={actionLoading === p.id}
                              className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              ❌ ปฏิเสธ
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => { setEditProfile(p); setEditData({ full_name: p.full_name, phone: p.phone, school: p.school, member_type: p.member_type, role: p.role, member_code: p.member_code, note: p.note }); }}
                          className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors"
                        >
                          ✏️ แก้ไข
                        </button>
                        {p.role !== "admin" && (
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                            🗑️ ลบ
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">แก้ไขสมาชิก</h2>
            <form onSubmit={handleEditSave} className="space-y-3">
              {[
                { label: "ชื่อ-นามสกุล", key: "full_name", type: "text" },
                { label: "เบอร์โทร", key: "phone", type: "tel" },
                { label: "สังกัดโรงเรียน", key: "school", type: "text" },
                { label: "รหัสสมาชิก", key: "member_code", type: "text" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
                  <input
                    type={field.type}
                    value={(editData as Record<string, string>)[field.key] ?? ""}
                    onChange={(e) => setEditData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">ประเภทสมาชิก</label>
                <select
                  value={editData.member_type ?? "สามัญ"}
                  onChange={(e) => setEditData((p) => ({ ...p, member_type: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                >
                  <option>กิตติมศักดิ์</option>
                  <option>สามัญ</option>
                  <option>วิสามัญ</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">บทบาท</label>
                <select
                  value={editData.role ?? "pending"}
                  onChange={(e) => setEditData((p) => ({ ...p, role: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                >
                  <option value="admin">ผู้ดูแลระบบ</option>
                  <option value="member">สมาชิก</option>
                  <option value="pending">รออนุมัติ</option>
                  <option value="rejected">ไม่อนุมัติ</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">หมายเหตุ</label>
                <textarea
                  value={editData.note ?? ""}
                  onChange={(e) => setEditData((p) => ({ ...p, note: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-800 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditProfile(null)}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-gray-600 mb-6">คุณต้องการลบสมาชิกนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {saving ? "กำลังลบ..." : "ยืนยันลบ"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
