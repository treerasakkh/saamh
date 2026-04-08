"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";

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

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: "ผู้ดูแลระบบ", color: "bg-purple-100 text-purple-700" },
  member: { label: "สมาชิก", color: "bg-green-100 text-green-700" },
  pending: { label: "รออนุมัติ", color: "bg-yellow-100 text-yellow-700" },
  rejected: { label: "ไม่อนุมัติ", color: "bg-red-100 text-red-700" },
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ full_name: "", phone: "", school: "" });
  const [changingPw, setChangingPw] = useState(false);
  const [pwData, setPwData] = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้");
      } else {
        setProfile(data);
        setEditData({ full_name: data.full_name, phone: data.phone, school: data.school });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editData.full_name,
        phone: editData.phone,
        school: editData.school,
      })
      .eq("id", profile.id);

    setSaving(false);
    if (error) {
      setError("บันทึกข้อมูลไม่สำเร็จ: " + error.message);
    } else {
      setProfile((prev) => prev ? { ...prev, ...editData } : prev);
      setSuccessMsg("บันทึกข้อมูลสำเร็จ");
      setEditing(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">กำลังโหลด...</p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-500">{error || "ไม่พบข้อมูลโปรไฟล์"}</p>
      </main>
    );
  }

  const roleInfo = roleLabels[profile.role] ?? { label: profile.role, color: "bg-gray-100 text-gray-700" };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          กลับแดชบอร์ด
        </Link>

        {/* Header card */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-800 to-blue-700 p-6 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-blue-900 font-bold text-xl shadow-md">
              {profile.full_name.charAt(0) || "ส"}
            </div>
            <div>
              <h1 className="text-xl font-bold">{profile.full_name || "ไม่ระบุชื่อ"}</h1>
              <p className="text-blue-200 text-sm">{profile.email}</p>
              <span className={`mt-1 inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
          {profile.member_code && (
            <div className="mt-4 rounded-xl bg-white/10 px-4 py-2">
              <p className="text-blue-200 text-xs">รหัสสมาชิก</p>
              <p className="text-white font-bold text-lg tracking-wider">{profile.member_code}</p>
            </div>
          )}
        </div>

        {/* Profile info */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">ข้อมูลส่วนตัว</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="rounded-lg border border-blue-600 px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                แก้ไขข้อมูล
              </button>
            )}
          </div>

          {successMsg && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {successMsg}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  value={editData.full_name}
                  onChange={(e) => setEditData((p) => ({ ...p, full_name: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">สังกัดโรงเรียน</label>
                <input
                  type="text"
                  value={editData.school}
                  onChange={(e) => setEditData((p) => ({ ...p, school: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditing(false); setError(null); }}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {[
                { label: "ชื่อ-นามสกุล", value: profile.full_name || "-" },
                { label: "อีเมล", value: profile.email },
                { label: "เบอร์โทรศัพท์", value: profile.phone || "-" },
                { label: "สังกัดโรงเรียน", value: profile.school || "-" },
                { label: "ประเภทสมาชิก", value: profile.member_type },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
                  <p className="w-36 shrink-0 text-sm text-gray-500">{item.label}</p>
                  <p className="text-sm font-medium text-gray-900">{item.value}</p>
                </div>
              ))}
              <div className="flex items-start gap-4 py-3">
                <p className="w-36 shrink-0 text-sm text-gray-500">สถานะ</p>
                <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Change password */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">เปลี่ยนรหัสผ่าน</h2>
            {!changingPw && (
              <button
                onClick={() => setChangingPw(true)}
                className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                เปลี่ยนรหัสผ่าน
              </button>
            )}
          </div>

          {changingPw && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (pwData.newPw !== pwData.confirm) {
                  setError("รหัสผ่านใหม่ไม่ตรงกัน");
                  return;
                }
                if (pwData.newPw.length < 6) {
                  setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
                  return;
                }
                setPwSaving(true);
                setError(null);
                setSuccessMsg(null);
                const supabase = createClient();
                // ยืนยัน current password ก่อน
                const { error: signInErr } = await supabase.auth.signInWithPassword({
                  email: profile.email,
                  password: pwData.current,
                });
                if (signInErr) {
                  setError("รหัสผ่านปัจจุบันไม่ถูกต้อง");
                  setPwSaving(false);
                  return;
                }
                const { error: updateErr } = await supabase.auth.updateUser({ password: pwData.newPw });
                setPwSaving(false);
                if (updateErr) {
                  setError("เปลี่ยนรหัสผ่านไม่สำเร็จ: " + updateErr.message);
                } else {
                  setSuccessMsg("เปลี่ยนรหัสผ่านสำเร็จ");
                  setChangingPw(false);
                  setPwData({ current: "", newPw: "", confirm: "" });
                }
              }}
              className="space-y-4"
            >
              {[
                { label: "รหัสผ่านปัจจุบัน", key: "current" },
                { label: "รหัสผ่านใหม่", key: "newPw" },
                { label: "ยืนยันรหัสผ่านใหม่", key: "confirm" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{f.label}</label>
                  <input
                    type="password"
                    required
                    value={(pwData as Record<string, string>)[f.key]}
                    onChange={(e) => setPwData((p) => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="rounded-lg bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {pwSaving ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
                </button>
                <button
                  type="button"
                  onClick={() => { setChangingPw(false); setError(null); setPwData({ current: "", newPw: "", confirm: "" }); }}
                  className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          )}

          {!changingPw && (
            <p className="text-sm text-gray-400">••••••••</p>
          )}
        </div>

        {/* Joined date */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">ข้อมูลการสมัคร</h2>
          <div className="flex items-center gap-4 py-2">
            <p className="w-36 text-sm text-gray-500">วันที่สมัคร</p>
            <p className="text-sm text-gray-900">
              {new Date(profile.created_at).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
