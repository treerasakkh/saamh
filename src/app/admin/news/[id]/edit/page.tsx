"use client";

import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface FormData {
  title: string;
  category: string;
  content: string;
  image_url_1: string;
  image_url_2: string;
  image_url_3: string;
  published: boolean;
}

export default function EditNewsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "ข่าวสาร",
    content: "",
    image_url_1: "",
    image_url_2: "",
    image_url_3: "",
    published: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        setError("ไม่พบข่าวนี้");
        setLoading(false);
        return;
      }
      const urls: string[] = data.image_urls ?? [];
      setFormData({
        title: data.title,
        category: data.category,
        content: data.content,
        image_url_1: urls[0] ?? "",
        image_url_2: urls[1] ?? "",
        image_url_3: urls[2] ?? "",
        published: data.published,
      });
      setLoading(false);
    }
    load();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((p) => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const imageUrls = [formData.image_url_1, formData.image_url_2, formData.image_url_3].filter(Boolean);

    const { error } = await supabase.from("news").update({
      title: formData.title,
      category: formData.category,
      content: formData.content,
      image_urls: imageUrls,
      published: formData.published,
    }).eq("id", id);

    setSaving(false);
    if (error) {
      setError("บันทึกไม่สำเร็จ: " + error.message);
    } else {
      router.push("/admin/news");
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-gray-400">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/news" className="text-gray-500 hover:text-gray-700 text-sm">← กลับ</Link>
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขข่าวสาร</h1>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">หัวข้อข่าว <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">หมวดหมู่</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white"
          >
            <option>ข่าวสาร</option>
            <option>กิจกรรม</option>
            <option>ประชาสัมพันธ์</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">เนื้อหา <span className="text-red-500">*</span></label>
          <textarea
            name="content"
            required
            value={formData.content}
            onChange={handleChange}
            rows={10}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">รูปภาพ (URL)</label>
          <div className="space-y-2">
            {[
              { name: "image_url_1", value: formData.image_url_1, label: "รูปที่ 1" },
              { name: "image_url_2", value: formData.image_url_2, label: "รูปที่ 2" },
              { name: "image_url_3", value: formData.image_url_3, label: "รูปที่ 3" },
            ].map((field) => (
              <div key={field.name} className="flex items-center gap-2">
                <span className="w-16 text-xs text-gray-500 shrink-0">{field.label}</span>
                <input
                  type="url"
                  name={field.name}
                  value={field.value}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            name="published"
            checked={formData.published}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="published" className="text-sm font-medium text-gray-700">เผยแพร่</label>
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
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <Link href="/admin/news" className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}
