"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface Registration {
  id: number;
  registrant_name: string;
  registrant_email: string;
  registrant_phone: string;
  registrant_organization: string;
  is_member: boolean;
  payment_slip_url: string;
  payment_status: string;
  receipt_number: string;
  receipt_name: string;
  receipt_address: string;
  receipt_tax_id: string;
  created_at: string;
}

interface Seminar {
  id: number;
  title: string;
  project_code: string;
}

type FilterStatus = "all" | "pending" | "verified" | "rejected";

const statusBadge: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  pending: "รอตรวจสอบ",
  verified: "ยืนยันแล้ว",
  rejected: "ไม่อนุมัติ",
};

export default function SeminarRegistrationsPage() {
  const params = useParams();
  const seminarId = params.id as string;

  const [seminar, setSeminar] = useState<Seminar | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [viewSlip, setViewSlip] = useState<string | null>(null);
  const [receiptModal, setReceiptModal] = useState<Registration | null>(null);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const [{ data: semData }, { data: regData }] = await Promise.all([
      supabase.from("seminars").select("id,title,project_code").eq("id", seminarId).single(),
      supabase.from("seminar_registrations").select("*").eq("seminar_id", seminarId).order("created_at", { ascending: false }),
    ]);
    if (semData) setSeminar(semData);
    if (regData) setRegistrations(regData);
    setLoading(false);
  }, [seminarId]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(regId: number, status: string) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("seminar_registrations")
      .update({ payment_status: status })
      .eq("id", regId);
    setSaving(false);
    if (error) {
      setMsg({ type: "error", text: "เกิดข้อผิดพลาด" });
    } else {
      setMsg({ type: "success", text: status === "verified" ? "อนุมัติการชำระเงินแล้ว" : "ปฏิเสธการชำระเงินแล้ว" });
      load();
    }
  }

  async function generateReceipt(reg: Registration) {
    if (!receiptNumber.trim()) { setMsg({ type: "error", text: "กรุณากรอกเลขที่ใบเสร็จ" }); return; }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("seminar_registrations")
      .update({ receipt_number: receiptNumber, payment_status: "verified" })
      .eq("id", reg.id);
    setSaving(false);
    if (error) {
      setMsg({ type: "error", text: "เกิดข้อผิดพลาด" });
    } else {
      setReceiptModal(null);
      setReceiptNumber("");
      setMsg({ type: "success", text: "ออกใบเสร็จสำเร็จ" });
      load();
    }
  }

  const filtered = registrations.filter((r) => filter === "all" ? true : r.payment_status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/seminars" className="text-gray-500 hover:text-gray-700 text-sm">← กลับ</Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายชื่อผู้สมัคร</h1>
          {seminar && <p className="text-sm text-gray-500">{seminar.project_code} · {seminar.title}</p>}
        </div>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm ${msg.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {msg.text}
          <button onClick={() => setMsg(null)} className="ml-3 underline text-xs">ปิด</button>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "pending", "verified", "rejected"] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-blue-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {f === "all" ? "ทั้งหมด" : statusLabel[f]}
            <span className="ml-2 text-xs opacity-70">
              ({registrations.filter((r) => f === "all" ? true : r.payment_status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "ทั้งหมด", count: registrations.length, color: "text-gray-700" },
          { label: "ยืนยันแล้ว", count: registrations.filter((r) => r.payment_status === "verified").length, color: "text-green-700" },
          { label: "รอตรวจสอบ", count: registrations.filter((r) => r.payment_status === "pending").length, color: "text-yellow-700" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">ไม่พบรายชื่อ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">ชื่อ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">อีเมล / โทร</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">สังกัด</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">สมาชิก</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">หลักฐาน</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">สถานะ</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.registrant_name}</p>
                      {r.receipt_number && <p className="text-xs text-gray-400">ใบเสร็จ: {r.receipt_number}</p>}
                      <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString("th-TH")}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-700">{r.registrant_email}</p>
                      <p className="text-gray-500 text-xs">{r.registrant_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{r.registrant_organization || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${r.is_member ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {r.is_member ? "สมาชิก" : "บุคคลทั่วไป"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.payment_slip_url ? (
                        <button
                          onClick={() => setViewSlip(r.payment_slip_url)}
                          className="text-blue-600 hover:underline text-xs"
                        >
                          ดูหลักฐาน
                        </button>
                      ) : <span className="text-gray-400 text-xs">ไม่มี</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[r.payment_status] ?? "bg-gray-100 text-gray-600"}`}>
                        {statusLabel[r.payment_status] ?? r.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {r.payment_status !== "verified" && (
                          <button
                            onClick={() => { setReceiptModal(r); setReceiptNumber(r.receipt_number || ""); }}
                            disabled={saving}
                            className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors"
                          >
                            ✅ อนุมัติ
                          </button>
                        )}
                        {r.payment_status !== "rejected" && (
                          <button
                            onClick={() => updateStatus(r.id, "rejected")}
                            disabled={saving}
                            className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors"
                          >
                            ❌ ปฏิเสธ
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

      {/* View Slip Modal */}
      {viewSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setViewSlip(null)}>
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-semibold">หลักฐานการชำระเงิน</p>
              <button onClick={() => setViewSlip(null)} className="text-white hover:text-gray-300">✕</button>
            </div>
            <img src={viewSlip} alt="หลักฐานการชำระเงิน" className="w-full max-h-[70vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">อนุมัติการชำระเงิน</h2>
            <div className="mb-4 space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">ชื่อ:</span> {receiptModal.registrant_name}</p>
              <p><span className="font-medium">ออกใบเสร็จให้:</span> {receiptModal.receipt_name || receiptModal.registrant_name}</p>
              {receiptModal.receipt_address && <p><span className="font-medium">ที่อยู่:</span> {receiptModal.receipt_address}</p>}
              {receiptModal.receipt_tax_id && <p><span className="font-medium">เลขผู้เสียภาษี:</span> {receiptModal.receipt_tax_id}</p>}
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">เลขที่ใบเสร็จ <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="เช่น RCP-2568-001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => generateReceipt(receiptModal)}
                disabled={saving}
                className="rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
              >
                {saving ? "กำลังบันทึก..." : "อนุมัติ + ออกใบเสร็จ"}
              </button>
              <button
                onClick={() => { setReceiptModal(null); setReceiptNumber(""); }}
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
