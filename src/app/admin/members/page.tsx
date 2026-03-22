"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

// Helper: ใช้ API (service role) สำหรับ admin operations
async function adminFetch(path: string, options?: RequestInit) {
  return fetch(path, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
}

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

type Tab = "all" | "pending" | "member" | "rejected" | "admin";

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

const emptyAdd = {
  full_name: "", email: "", password: "", phone: "",
  school: "", member_type: "สามัญ", role: "member", member_code: "",
};

export default function AdminMembersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addData, setAddData] = useState(emptyAdd);
  const [addLoading, setAddLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // ใช้ API route (service role key) เพื่อ bypass RLS และดูข้อมูลทั้งหมด
      const res = await adminFetch("/api/admin/users");
      if (res.ok) {
        const json = await res.json();
        setProfiles(json.data ?? []);
      }
    } catch {
      // fallback: ใช้ anon key (อาจเห็นแค่ตัวเอง)
      const supabase = createClient();
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (data) setProfiles(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = profiles.filter((p) => {
    const matchTab = activeTab === "all" || p.role === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.school?.toLowerCase().includes(q) ||
      p.member_code?.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const showMsg = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  async function handleApprove(profile: Profile) {
    setActionLoading(profile.id);
    const code = profile.member_code || generateMemberCode();
    const res = await adminFetch("/api/admin/users", {
      method: "PATCH",
      body: JSON.stringify({ id: profile.id, role: "member", member_code: code }),
    });
    setActionLoading(null);
    if (!res.ok) { const j = await res.json(); showMsg("error", "เกิดข้อผิดพลาด: " + j.error); }
    else { showMsg("success", `อนุมัติ ${profile.full_name || profile.email} สำเร็จ`); load(); }
  }

  async function handleReject(profile: Profile) {
    setActionLoading(profile.id);
    const res = await adminFetch("/api/admin/users", {
      method: "PATCH",
      body: JSON.stringify({ id: profile.id, role: "rejected" }),
    });
    setActionLoading(null);
    if (!res.ok) { const j = await res.json(); showMsg("error", "เกิดข้อผิดพลาด: " + j.error); }
    else { showMsg("success", `ปฏิเสธ ${profile.full_name || profile.email} แล้ว`); load(); }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: deleteId }),
    });
    setSaving(false);
    setDeleteId(null);
    if (!res.ok) {
      const j = await res.json();
      showMsg("error", "ลบไม่สำเร็จ: " + j.error);
    } else {
      showMsg("success", "ลบสมาชิกแล้ว");
      load();
    }
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editProfile) return;
    setSaving(true);
    const res = await adminFetch("/api/admin/users", {
      method: "PATCH",
      body: JSON.stringify({ id: editProfile.id, ...editData }),
    });
    setSaving(false);
    if (!res.ok) { const j = await res.json(); showMsg("error", "บันทึกไม่สำเร็จ: " + j.error); }
    else { setEditProfile(null); showMsg("success", "บันทึกข้อมูลสำเร็จ"); load(); }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addData),
    });
    setAddLoading(false);
    if (!res.ok) {
      const j = await res.json();
      showMsg("error", "เพิ่มไม่สำเร็จ: " + j.error);
    } else {
      setShowAdd(false);
      setAddData(emptyAdd);
      showMsg("success", `เพิ่มสมาชิก ${addData.full_name} สำเร็จ`);
      load();
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "ทั้งหมด" },
    { key: "pending", label: "รออนุมัติ" },
    { key: "member", label: "สมาชิก" },
    { key: "rejected", label: "ปฏิเสธ" },
    { key: "admin", label: "ผู้ดูแล" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการสมาชิก</h1>
          <p className="text-sm text-gray-500 mt-0.5">ทั้งหมด {profiles.length} บัญชี</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="text-lg leading-none">+</span> เพิ่มสมาชิก
        </button>
      </div>

      {/* Alert */}
      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm flex items-center justify-between ${
          msg.type === "success"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="ml-3 text-xs underline opacity-70">ปิด</button>
        </div>
      )}

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap flex-1">
          {tabs.map((tab) => {
            const count = tab.key === "all" ? profiles.length : profiles.filter((p) => p.role === tab.key).length;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-800 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                {count > 0 && tab.key === "pending" ? (
                  <span className="ml-1.5 bg-yellow-400 text-yellow-900 text-xs rounded-full px-1.5 py-0.5 font-bold">{count}</span>
                ) : (
                  <span className="ml-1.5 opacity-60 text-xs">({count})</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อ อีเมล โรงเรียน..."
            className="w-full sm:w-64 rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
            <p>กำลังโหลด...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-3xl mb-2">🔍</p>
            <p>ไม่พบข้อมูล</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">ชื่อ-สกุล</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">อีเมล</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">โรงเรียน</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden xl:table-cell">ประเภท</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">สถานะ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <>
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{p.full_name || "(ไม่ระบุชื่อ)"}</p>
                        {p.member_code && <p className="text-xs text-blue-500 font-mono">{p.member_code}</p>}
                        <p className="text-xs text-gray-400 sm:hidden">{p.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.email}</td>
                      <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{p.school || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 hidden xl:table-cell">{p.member_type}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadge[p.role] ?? "bg-gray-100 text-gray-600"}`}>
                          {roleLabel[p.role] ?? p.role}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 flex-wrap">
                          {p.role === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(p)}
                                disabled={actionLoading === p.id}
                                className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 disabled:opacity-50 transition-colors"
                              >
                                ✅ อนุมัติ
                              </button>
                              <button
                                onClick={() => handleReject(p)}
                                disabled={actionLoading === p.id}
                                className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 disabled:opacity-50 transition-colors"
                              >
                                ❌ ปฏิเสธ
                              </button>
                            </>
                          )}
                          {p.role === "rejected" && (
                            <button
                              onClick={() => handleApprove(p)}
                              disabled={actionLoading === p.id}
                              className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 disabled:opacity-50 transition-colors"
                            >
                              ↩️ อนุมัติใหม่
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditProfile(p);
                              setEditData({
                                full_name: p.full_name, phone: p.phone, school: p.school,
                                member_type: p.member_type, role: p.role,
                                member_code: p.member_code, note: p.note,
                              });
                            }}
                            className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors"
                          >
                            ✏️ แก้ไข
                          </button>
                          {p.role !== "admin" && (
                            <button
                              onClick={() => setDeleteId(p.id)}
                              className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-red-100 hover:text-red-600 transition-colors"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === p.id && (
                      <tr key={`${p.id}-detail`} className="bg-blue-50/50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                            <div><span className="text-gray-500 text-xs">อีเมล</span><p className="font-medium">{p.email}</p></div>
                            <div><span className="text-gray-500 text-xs">เบอร์โทร</span><p className="font-medium">{p.phone || "-"}</p></div>
                            <div><span className="text-gray-500 text-xs">โรงเรียน</span><p className="font-medium">{p.school || "-"}</p></div>
                            <div><span className="text-gray-500 text-xs">ประเภทสมาชิก</span><p className="font-medium">{p.member_type}</p></div>
                            <div><span className="text-gray-500 text-xs">รหัสสมาชิก</span><p className="font-medium font-mono">{p.member_code || "-"}</p></div>
                            <div><span className="text-gray-500 text-xs">หมายเหตุ</span><p className="font-medium">{p.note || "-"}</p></div>
                            <div><span className="text-gray-500 text-xs">สมัครเมื่อ</span><p className="font-medium">{new Date(p.created_at).toLocaleDateString("th-TH")}</p></div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">เพิ่มสมาชิกใหม่</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: "ชื่อ-นามสกุล *", key: "full_name", type: "text", placeholder: "กรอกชื่อ-นามสกุล" },
                  { label: "อีเมล *", key: "email", type: "email", placeholder: "example@email.com" },
                  { label: "รหัสผ่าน *", key: "password", type: "password", placeholder: "อย่างน้อย 8 ตัวอักษร" },
                  { label: "เบอร์โทร", key: "phone", type: "tel", placeholder: "0XX-XXX-XXXX" },
                  { label: "สังกัดโรงเรียน", key: "school", type: "text", placeholder: "ชื่อโรงเรียน" },
                  { label: "รหัสสมาชิก", key: "member_code", type: "text", placeholder: "SAAMH-2568-XXXX" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{f.label}</label>
                    <input
                      type={f.type}
                      required={f.label.includes("*")}
                      placeholder={f.placeholder}
                      value={(addData as Record<string, string>)[f.key]}
                      onChange={(e) => setAddData((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">ประเภทสมาชิก</label>
                    <select
                      value={addData.member_type}
                      onChange={(e) => setAddData((p) => ({ ...p, member_type: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option>กิตติมศักดิ์</option>
                      <option>สามัญ</option>
                      <option>วิสามัญ</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">บทบาท</label>
                    <select
                      value={addData.role}
                      onChange={(e) => setAddData((p) => ({ ...p, role: e.target.value }))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="member">สมาชิก</option>
                      <option value="admin">ผู้ดูแลระบบ</option>
                      <option value="pending">รออนุมัติ</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 rounded-xl bg-blue-800 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {addLoading ? "กำลังเพิ่ม..." : "เพิ่มสมาชิก"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">แก้ไขข้อมูลสมาชิก</h2>
                <p className="text-xs text-gray-500 mt-0.5">{editProfile.email}</p>
              </div>
              <button onClick={() => setEditProfile(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 space-y-4">
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
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">ประเภทสมาชิก</label>
                  <select
                    value={editData.member_type ?? "สามัญ"}
                    onChange={(e) => setEditData((p) => ({ ...p, member_type: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
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
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="admin">ผู้ดูแลระบบ</option>
                    <option value="member">สมาชิก</option>
                    <option value="pending">รออนุมัติ</option>
                    <option value="rejected">ไม่อนุมัติ</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">หมายเหตุ</label>
                <textarea
                  value={editData.note ?? ""}
                  onChange={(e) => setEditData((p) => ({ ...p, note: e.target.value }))}
                  rows={2}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-blue-800 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditProfile(null)}
                  className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-gray-600 mb-1">คุณต้องการลบสมาชิกนี้ใช่หรือไม่?</p>
            <p className="text-xs text-red-500 mb-6">บัญชีจะถูกลบออกจากระบบทั้งหมด ไม่สามารถย้อนกลับได้</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {saving ? "กำลังลบ..." : "ยืนยันลบ"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
