"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function CreateSeminarPage() {
  const router = useRouter();
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase.from("seminars").insert({
      project_code: formData.project_code,
      title: formData.title,
      description: formData.description,
      registration_fee: parseFloat(formData.registration_fee) || 0,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      location: formData.location,
      max_participants: parseInt(formData.max_participants) || 100,
      status: formData.status,
    });

    setSaving(false);
    if (error) {
      if (error.message.includes("unique")) {
        setError("รหัสโครงการนี้มีอยู่แล้ว กรุณาใช้รหัสอื่น");
      } else {
        setError("บันทึกไม่สำเร็จ: " + error.message);
      }
    } else {
      router.push("/admin/seminars");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/seminars" className="text-gray-500 hover:text-gray-700 text-sm">← กลับ</Link>
        <h1 className="text-2xl font-bold text-gray-900">สร้างการอบรมใหม่</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">รหัสโครงการ <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="project_code"
              required
              value={formData.project_code}
              onChange={handleChange}
              placeholder="เช่น SAAMH-2568-001"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">สถานะ</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
            >
              <option value="open">เปิดรับสมัคร</option>
              <option value="closed">ปิดรับสมัคร</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">ชื่อโครงการ <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="ชื่อโครงการอบรม"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">รายละเอียด</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="รายละเอียดโครงการ..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">วันที่เริ่ม</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">สถานที่จัด</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="สถานที่จัดการอบรม"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">ค่าลงทะเบียน (บาท)</label>
            <input
              type="number"
              name="registration_fee"
              value={formData.registration_fee}
              onChange={handleChange}
              min={0}
              step={0.01}
              placeholder="0"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">จำนวนที่รับ</label>
            <input
              type="number"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleChange}
              min={1}
              placeholder="100"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? "กำลังบันทึก..." : "สร้างการอบรม"}
          </button>
          <Link href="/admin/seminars" className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}
