"use client";

import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Seminar {
  id: number;
  project_code: string;
  title: string;
  description: string;
  registration_fee: number;
  status: string;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
}

interface FormData {
  is_member: boolean;
  registrant_name: string;
  registrant_email: string;
  registrant_phone: string;
  registrant_organization: string;
  receipt_name: string;
  receipt_address: string;
  receipt_tax_id: string;
  payment_slip_url: string;
}

export default function SeminarRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const seminarId = params.id as string;

  const [seminar, setSeminar] = useState<Seminar | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ id: number; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    is_member: false,
    registrant_name: "",
    registrant_email: "",
    registrant_phone: "",
    registrant_organization: "",
    receipt_name: "",
    receipt_address: "",
    receipt_tax_id: "",
    payment_slip_url: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: sem }, { data: { user } }] = await Promise.all([
        supabase.from("seminars").select("*").eq("id", seminarId).single(),
        supabase.auth.getUser(),
      ]);
      if (sem) setSeminar(sem);
      if (user) {
        setCurrentUser({ id: user.id, email: user.email ?? "" });
        // Try to fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name,email,phone,school,role")
          .eq("id", user.id)
          .single();
        if (profile) {
          setFormData((p) => ({
            ...p,
            is_member: profile.role === "member",
            registrant_name: profile.full_name || "",
            registrant_email: profile.email || user.email || "",
            registrant_phone: profile.phone || "",
            registrant_organization: profile.school || "",
            receipt_name: profile.full_name || "",
          }));
        } else {
          setFormData((p) => ({ ...p, registrant_email: user.email ?? "" }));
        }
      }
      setLoading(false);
    }
    load();
  }, [seminarId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
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
    if (!seminar) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("seminar_registrations")
      .insert({
        seminar_id: seminar.id,
        profile_id: currentUser?.id ?? null,
        is_member: formData.is_member,
        registrant_name: formData.registrant_name,
        registrant_email: formData.registrant_email,
        registrant_phone: formData.registrant_phone,
        registrant_organization: formData.registrant_organization,
        receipt_name: formData.receipt_name,
        receipt_address: formData.receipt_address,
        receipt_tax_id: formData.receipt_tax_id,
        payment_slip_url: formData.payment_slip_url,
        payment_status: "pending",
      })
      .select("id,registrant_name")
      .single();

    setSubmitting(false);
    if (error) {
      setError("เกิดข้อผิดพลาด: " + error.message);
    } else if (data) {
      setSuccess({ id: data.id, name: data.registrant_name });
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">กำลังโหลด...</p>
      </main>
    );
  }

  if (!seminar) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">ไม่พบการอบรมนี้</p>
          <Link href="/seminars" className="text-blue-600 hover:underline">กลับไปรายการอบรม</Link>
        </div>
      </main>
    );
  }

  if (seminar.status !== "open") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">ปิดรับสมัครแล้ว</h2>
          <p className="text-gray-500 mb-4">การอบรม "{seminar.title}" ได้ปิดรับสมัครแล้ว</p>
          <Link href="/seminars" className="inline-block rounded-lg bg-blue-800 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            กลับไปรายการอบรม
          </Link>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">สมัครสำเร็จ!</h2>
          <p className="text-gray-600 mb-1">เลขที่การสมัคร: <span className="font-bold text-blue-800">#{success.id}</span></p>
          <p className="text-gray-600 mb-4">ชื่อ: {success.name}</p>
          <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 mb-6 text-left">
            เจ้าหน้าที่จะตรวจสอบหลักฐานการชำระเงินและดำเนินการภายใน 1-3 วันทำการ
            กรุณาเก็บเลขที่การสมัครไว้เพื่ออ้างอิง
          </div>
          <Link href="/seminars" className="inline-block w-full rounded-xl bg-blue-800 py-3 text-center font-semibold text-white hover:bg-blue-700 transition-colors">
            กลับไปรายการอบรม
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Seminar info */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white shadow-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block px-3 py-1 bg-green-400 text-green-900 text-xs font-semibold rounded-full">เปิดรับสมัคร</span>
            <span className="text-blue-300 text-xs font-mono">{seminar.project_code}</span>
          </div>
          <h1 className="text-xl font-bold mb-3">{seminar.title}</h1>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {seminar.start_date && (
              <div>
                <p className="text-blue-300 text-xs">วันที่จัด</p>
                <p>{new Date(seminar.start_date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            )}
            {seminar.location && (
              <div>
                <p className="text-blue-300 text-xs">สถานที่</p>
                <p>{seminar.location}</p>
              </div>
            )}
            <div>
              <p className="text-blue-300 text-xs">ค่าลงทะเบียน</p>
              <p className="text-yellow-400 font-bold">
                {Number(seminar.registration_fee) === 0 ? "ฟรี" : `฿${Number(seminar.registration_fee).toLocaleString("th-TH")}`}
              </p>
            </div>
            <div>
              <p className="text-blue-300 text-xs">รับจำนวน</p>
              <p>{seminar.max_participants} คน</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Member status */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3">สถานะสมาชิก</h2>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_member_radio"
                  checked={formData.is_member}
                  onChange={() => setFormData((p) => ({ ...p, is_member: true }))}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm">สมาชิกสมาคม</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="is_member_radio"
                  checked={!formData.is_member}
                  onChange={() => setFormData((p) => ({ ...p, is_member: false }))}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm">บุคคลทั่วไป</span>
              </label>
            </div>
            {!currentUser && (
              <p className="mt-2 text-xs text-gray-500">
                หากเป็นสมาชิก{" "}
                <Link href="/login" className="text-blue-600 hover:underline">เข้าสู่ระบบ</Link>
                {" "}เพื่อกรอกข้อมูลอัตโนมัติ
              </p>
            )}
          </div>

          {/* Personal info */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-900">ข้อมูลผู้สมัคร</h2>
            {[
              { label: "ชื่อ-นามสกุล", name: "registrant_name", type: "text", required: true, placeholder: "กรอกชื่อ-นามสกุล" },
              { label: "อีเมล", name: "registrant_email", type: "email", required: true, placeholder: "example@email.com" },
              { label: "เบอร์โทรศัพท์", name: "registrant_phone", type: "tel", required: false, placeholder: "0XX-XXX-XXXX" },
              { label: "สังกัด / หน่วยงาน", name: "registrant_organization", type: "text", required: false, placeholder: "ชื่อโรงเรียน/หน่วยงาน" },
            ].map((field) => (
              <div key={field.name}>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  value={(formData as unknown as Record<string, string>)[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            ))}
          </div>

          {/* Receipt info */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-gray-900">ข้อมูลออกใบเสร็จ</h2>
            <p className="text-xs text-gray-500">กรอกข้อมูลสำหรับออกใบเสร็จรับเงิน (ถ้าต้องการ)</p>
            {[
              { label: "ชื่อผู้รับใบเสร็จ", name: "receipt_name", placeholder: "ชื่อ-นามสกุล หรือ ชื่อหน่วยงาน" },
              { label: "ที่อยู่", name: "receipt_address", placeholder: "ที่อยู่สำหรับออกใบเสร็จ" },
              { label: "เลขประจำตัวผู้เสียภาษี (ถ้ามี)", name: "receipt_tax_id", placeholder: "หมายเลข 13 หลัก" },
            ].map((field) => (
              <div key={field.name}>
                <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
                <input
                  type="text"
                  name={field.name}
                  value={(formData as unknown as Record<string, string>)[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            ))}
          </div>

          {/* Payment slip */}
          {Number(seminar.registration_fee) > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-3">
              <h2 className="font-bold text-gray-900">หลักฐานการชำระเงิน</h2>
              <p className="text-sm text-gray-600">
                กรุณาโอนเงินค่าลงทะเบียน <span className="font-bold text-blue-800">฿{Number(seminar.registration_fee).toLocaleString("th-TH")}</span>{" "}
                และแนบ URL รูปภาพหลักฐาน
              </p>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">URL รูปภาพหลักฐานการโอนเงิน</label>
                <input
                  type="url"
                  name="payment_slip_url"
                  value={formData.payment_slip_url}
                  onChange={handleChange}
                  placeholder="https://... (URL รูปภาพ)"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-blue-800 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {submitting ? "กำลังส่งข้อมูล..." : "ยืนยันการสมัคร"}
            </button>
            <Link
              href="/seminars"
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
