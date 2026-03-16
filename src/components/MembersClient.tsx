"use client";
import { useState } from "react";
import type { Member } from "./MembersSection";

type Tab = "ทั้งหมด" | "กิตติมศักดิ์" | "สามัญ" | "วิสามัญ";

const typeStyle: Record<string, { badge: string; tab: string }> = {
  "กิตติมศักดิ์": { badge: "bg-yellow-100 text-yellow-800", tab: "bg-yellow-400 text-yellow-900" },
  "สามัญ":        { badge: "bg-blue-100 text-blue-800",     tab: "bg-blue-600 text-white" },
  "วิสามัญ":      { badge: "bg-indigo-100 text-indigo-800", tab: "bg-indigo-600 text-white" },
};

const noteStyle: Record<string, string> = {
  "เกษียณ":         "bg-gray-100 text-gray-500",
  "เปลี่ยนตำแหน่ง": "bg-orange-100 text-orange-700",
};

export default function MembersClient({ members }: { members: Member[] }) {
  const [tab, setTab]       = useState<Tab>("ทั้งหมด");
  const [search, setSearch] = useState("");

  const counts = {
    "ทั้งหมด":    members.length,
    "กิตติมศักดิ์": members.filter((m) => m.member_type === "กิตติมศักดิ์").length,
    "สามัญ":      members.filter((m) => m.member_type === "สามัญ").length,
    "วิสามัญ":    members.filter((m) => m.member_type === "วิสามัญ").length,
  };

  const filtered = members.filter((m) => {
    const matchTab = tab === "ทั้งหมด" || m.member_type === tab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.name.includes(search) ||
      m.school.includes(search) ||
      m.code.includes(search);
    return matchTab && matchSearch;
  });

  return (
    <section id="members" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-2">MEMBERS</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">ทำเนียบสมาชิก</h2>
          <div className="mt-3 mx-auto w-16 h-1 bg-yellow-400 rounded-full" />
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            รายชื่อสมาชิกสมาคมผู้บริหารโรงเรียนมัธยมศึกษาจังหวัดมุกดาหาร
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {(["ทั้งหมด", "กิตติมศักดิ์", "สามัญ", "วิสามัญ"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-2xl p-4 text-center border transition-all hover:-translate-y-0.5 ${
                tab === t
                  ? "border-blue-300 bg-blue-50 shadow-md"
                  : "border-gray-100 bg-gray-50 hover:border-blue-200"
              }`}
            >
              <p className={`text-3xl font-black ${tab === t ? "text-blue-700" : "text-gray-700"}`}>
                {counts[t]}
              </p>
              <p className={`text-xs font-medium mt-1 ${tab === t ? "text-blue-600" : "text-gray-500"}`}>
                {t === "ทั้งหมด" ? "สมาชิกทั้งหมด" : `สมาชิก${t}`}
              </p>
            </button>
          ))}
        </div>

        {/* Search + Join */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 10.65a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาชื่อ, โรงเรียน, รหัสสมาชิก..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <a
            href="#"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-900 text-white font-semibold text-sm rounded-xl hover:bg-blue-800 transition-colors shadow-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            สมัครเป็นสมาชิก
          </a>
        </div>

        <p className="text-gray-400 text-xs mb-3">
          แสดง {filtered.length} รายการ
          {tab !== "ทั้งหมด" && ` · สมาชิก${tab}`}
          {search && ` · ค้นหา "${search}"`}
        </p>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold w-20">รหัส</th>
                <th className="px-4 py-3 text-left font-semibold">ชื่อ-สกุล</th>
                <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">สังกัด</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell w-28">ประเภท</th>
                <th className="px-4 py-3 text-left font-semibold hidden lg:table-cell w-32">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">ไม่พบข้อมูล</td>
                </tr>
              ) : (
                filtered.map((m, i) => {
                  const faded = m.note !== "-";
                  return (
                  <tr key={m.id} className={`hover:bg-blue-50 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} ${faded ? "opacity-40" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 font-medium">{m.code}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{m.name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{m.school}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeStyle[m.member_type]?.badge ?? "bg-gray-100 text-gray-600"}`}>
                        {m.member_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {m.note !== "-" ? (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${noteStyle[m.note] ?? "bg-gray-100 text-gray-500"}`}>
                          {m.note}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
