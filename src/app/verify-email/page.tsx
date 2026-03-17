"use client";

import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">ยืนยันอีเมลของท่าน</h1>
        <p className="text-gray-600 mb-2">
          เราได้ส่งลิงก์ยืนยันไปยังอีเมลของท่านแล้ว
        </p>
        <p className="text-gray-500 text-sm mb-6">
          กรุณาตรวจสอบกล่องจดหมายและคลิกลิงก์ยืนยันเพื่อเปิดใช้งานบัญชีของท่าน
          หากไม่พบอีเมล กรุณาตรวจสอบในโฟลเดอร์จดหมายขยะ
        </p>
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700 mb-6">
          หลังจากยืนยันอีเมลแล้ว เจ้าหน้าที่จะตรวจสอบและอนุมัติบัญชีของท่านภายใน 1-3 วันทำการ
        </div>
        <Link
          href="/login"
          className="inline-block w-full rounded-xl bg-blue-800 py-3 text-center font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </main>
  );
}
