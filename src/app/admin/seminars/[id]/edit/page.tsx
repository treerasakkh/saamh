"use client";

import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function EditSeminarPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    project_code: "",
    title: "",
    description: "",
    registration_fee: "",
    start_date: "",
    end_date: "",
    location: "",
    max_participants: "100",
    status: "open",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase.from("seminars").select("*").eq("id", id).single();
      if (error || !data) { setError("ไม่พบข้อมูล"); setLoading(false); return; }
      setFormData({
        project_code: data.project_code,
        title: data.title,
        description: data.description ?? "",
        registration_fee: String(data.registration_fee ?? 0),
        start_date: data.start_date ?? "",
        end_date: data.end_date ?? "",
        location: data.location ?? "",
        max_participants: String(data.max_participants ?? 100),
        status: data.status,
      });
      setLoading(false);
    }
    load();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("seminars").update({
      project_code: formData.project_code,
      title: formData.title,
      description: formData.description,
      registration_fee: parseFloat(formData.registration_fee) || 0,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      location: formData.location,
      max_participants: parseInt(formData.max_participants) || 100,
      status: formData.status,
    }).eq("id", id);
    setSaving(false);
    if (error) { setError("บันทึกไม่สำเร็จ: " + error.message); }
    else { router.push("/admin/seminars"); }
  }

  if (loading) return <div className="py-16 text-center text-gray-400">กำลังโหลด...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/seminars" className="text-gray-500 hover:text-gray-700 text-sm">← กลับ</Link>
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขการอบรม</h1>
      </div>
      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">รหัสโครงการ <span className="text-red-500">*</span></label>
            <input type="text" name="project_code" required value={formData.project_code} onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">สถานะ</label>
            <select name="status" value={formData.status} onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white">
              <option value="open">เปิดรับสมัคร</option>
              <option value="closed">ปิดรับสมัคร</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">ชื่อโครงการ <span className="text-red-500">*</span></label>
          <input type="text" name="title" required value={formData.title} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">รายละเอียด</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">วันที่เริ่ม</label>
            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 transition" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">สถานที่จัด</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">ค่าลงทะเบียน (บาท)</label>
            <input type="number" name="registration_fee" value={formData.registration_fee} onChange={handleChange} min={0} step={0.01}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">จำนวนที่รับ</label>
            <input type="number" name="max_participants" value={formData.max_participants} onChange={handleChange} min={1}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" />
          </div>
        </div>
        {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="rounded-lg bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <Link href="/admin/seminars" className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}
