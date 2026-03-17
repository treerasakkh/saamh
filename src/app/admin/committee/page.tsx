"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";

interface CommitteeMember {
  id: number;
  name: string;
  position: string;
  school: string;
  photo_id: string;
  sort_order: number;
  profile_id: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  school: string;
}

const emptyForm = { name: "", position: "", school: "", photo_id: "", sort_order: 0, profile_id: "" };

export default function AdminCommitteePage() {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMember, setEditMember] = useState<CommitteeMember | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: cmData }, { data: prData }] = await Promise.all([
      supabase.from("committee").select("*").order("sort_order", { ascending: true }),
      supabase.from("profiles").select("id,full_name,school").eq("role", "member"),
    ]);
    if (cmData) setMembers(cmData);
    if (prData) setProfiles(prData);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openAdd() {
    setEditMember(null);
    setFormData(emptyForm);
    setShowForm(true);
  }

  function openEdit(m: CommitteeMember) {
    setEditMember(m);
    setFormData({ name: m.name, position: m.position, school: m.school, photo_id: m.photo_id, sort_order: m.sort_order, profile_id: m.profile_id ?? "" });
    setShowForm(true);
  }

  function handleProfileSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const profileId = e.target.value;
    if (profileId) {
      const p = profiles.find((pr) => pr.id === profileId);
      if (p) {
        setFormData((prev) => ({ ...prev, profile_id: profileId, name: p.full_name, school: p.school }));
        return;
      }
    }
    setFormData((prev) => ({ ...prev, profile_id: profileId }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const payload = {
      name: formData.name,
      position: formData.position,
      school: formData.school,
      photo_id: formData.photo_id,
      sort_order: Number(formData.sort_order),
      profile_id: formData.profile_id || null,
    };

    let error;
    if (editMember) {
      ({ error } = await supabase.from("committee").update(payload).eq("id", editMember.id));
    } else {
      ({ error } = await supabase.from("committee").insert(payload));
    }

    setSaving(false);
    if (error) {
      setMsg({ type: "error", text: "บันทึกไม่สำเร็จ: " + error.message });
    } else {
      setMsg({ type: "success", text: editMember ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ" });
      setShowForm(false);
      load();
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("committee").delete().eq("id", deleteId);
    setSaving(false);
    setDeleteId(null);
    if (error) {
      setMsg({ type: "error", text: "ลบไม่สำเร็จ" });
    } else {
      setMsg({ type: "success", text: "ลบสำเร็จ" });
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">จัดการคณะกรรมการ</h1>
        <button
          onClick={openAdd}
          className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          + เพิ่มกรรมการ
        </button>
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
        ) : members.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg mb-2">🏛️</p>
            <p>ยังไม่มีคณะกรรมการ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">ลำดับ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">ชื่อ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">ตำแหน่ง</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">โรงเรียน</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">รูปภาพ (Drive ID)</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{m.sort_order}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                    <td className="px-4 py-3 text-gray-600">{m.position}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{m.school || "-"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {m.photo_id ? (
                        <span className="font-mono">{m.photo_id.slice(0, 20)}...</span>
                      ) : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(m)}
                          className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors"
                        >
                          ✏️ แก้ไข
                        </button>
                        <button
                          onClick={() => setDeleteId(m.id)}
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editMember ? "แก้ไขกรรมการ" : "เพิ่มกรรมการ"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Select from profiles */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">เลือกจากสมาชิก (ถ้ามี)</label>
                <select
                  value={formData.profile_id}
                  onChange={handleProfileSelect}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">-- กรอกชื่อด้วยตนเอง --</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.school || "-"})</option>
                  ))}
                </select>
                {profiles.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">ยังไม่มีสมาชิกที่ได้รับการอนุมัติ</p>
                )}
              </div>

              {[
                { label: "ชื่อ-นามสกุล", key: "name", required: true },
                { label: "ตำแหน่ง", key: "position", required: true },
                { label: "สังกัดโรงเรียน", key: "school", required: false },
                { label: "Google Drive Photo ID", key: "photo_id", required: false },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    required={field.required}
                    value={(formData as Record<string, string | number>)[field.key] as string}
                    onChange={(e) => setFormData((p) => ({ ...p, [field.key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">ลำดับที่</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                  min={0}
                  className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
                ⚠️ แนะนำให้กรรมการเป็นสมาชิกสมาคมที่ได้รับการอนุมัติแล้ว
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
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-gray-600 mb-6">คุณต้องการลบกรรมการคนนี้ใช่หรือไม่?</p>
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
