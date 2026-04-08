"use client";

import Link from "next/link";
import { useState } from "react";

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/admin", icon: "📊", label: "ภาพรวม" },
  { href: "/admin/members", icon: "👥", label: "จัดการสมาชิก" },
  { href: "/admin/news", icon: "📰", label: "จัดการข่าวสาร" },
  { href: "/admin/committee", icon: "🏛️", label: "จัดการคณะกรรมการ" },
  { href: "/admin/seminars", icon: "🎓", label: "จัดการการอบรม" },
];

interface AdminSidebarProps {
  currentPath: string;
}

export default function AdminSidebar({ currentPath }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return currentPath === "/admin";
    return currentPath.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-blue-700">
        <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-yellow-400/60 shadow-md shrink-0">
            <img src="/logo.png" alt="โลโก้สมาคม" className="object-cover w-full h-full" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">ส.บ.ม.ม.ห.</p>
            <p className="text-blue-300 text-xs">ระบบจัดการ</p>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href)
                ? "bg-yellow-400 text-blue-900 shadow-sm"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="px-3 py-4 border-t border-blue-700 space-y-1">
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-all"
        >
          <span className="text-base">🏠</span>
          หน้าแรก
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-blue-100 hover:bg-red-600 hover:text-white transition-all"
          >
            <span className="text-base">🚪</span>
            ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-blue-800 min-h-screen shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-blue-800 px-4 py-3 flex items-center justify-between shadow-md">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-yellow-400/60 shadow-md shrink-0">
            <img src="/logo.png" alt="โลโก้สมาคม" className="object-cover w-full h-full" />
          </div>
          <span className="text-white font-bold text-sm">ระบบจัดการ</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-blue-100 hover:bg-blue-700 transition-colors"
          aria-label="เปิดเมนู"
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed top-0 left-0 bottom-0 z-40 w-64 bg-blue-800 shadow-xl">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
