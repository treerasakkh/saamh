"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const navLinks = [
  { href: "#home", label: "หน้าแรก" },
  { href: "#objectives", label: "วัตถุประสงค์" },
  { href: "#committee", label: "กรรมการ" },
  { href: "#members", label: "สมาชิก" },
  { href: "#about", label: "เกี่ยวกับเรา" },
];

const roleLabel: Record<string, string> = {
  admin: "ผู้ดูแลระบบ",
  member: "สมาชิก",
  pending: "รออนุมัติ",
};

const roleBadgeColor: Record<string, string> = {
  admin: "bg-purple-400 text-purple-900",
  member: "bg-green-400 text-green-900",
  pending: "bg-yellow-400 text-yellow-900",
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks.map((l) => l.href.replace("#", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authUser.id)
          .single();
        setUser({ email: authUser.email ?? "", role: profile?.role ?? "pending" });
      }
      setAuthLoading(false);
    }
    loadUser();
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-blue-900/95 backdrop-blur-md shadow-lg" : "bg-blue-900"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400 text-blue-900 font-bold text-sm shadow-md group-hover:scale-110 transition-transform">
              ส.บ.
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">ส.บ.ม.ม.ห.</p>
              <p className="text-blue-300 text-xs">S.A.A.M.H.</p>
            </div>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active === l.href.replace("#", "")
                    ? "bg-yellow-400 text-blue-900"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Auth buttons (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {authLoading ? (
              <div className="h-8 w-24 rounded-lg bg-blue-700 animate-pulse" />
            ) : user ? (
              <>
                {user.role && roleLabel[user.role] && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadgeColor[user.role] ?? "bg-gray-400 text-gray-900"}`}>
                    {roleLabel[user.role]}
                  </span>
                )}
                <Link
                  href="/profile"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-all"
                >
                  โปรไฟล์
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-all"
                  >
                    จัดการ
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-all"
                >
                  แดชบอร์ด
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-all"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-all"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-blue-100 hover:bg-blue-700 transition-colors"
          >
            <span className="block w-5 h-0.5 bg-current mb-1 transition-all" />
            <span className="block w-5 h-0.5 bg-current mb-1" />
            <span className="block w-5 h-0.5 bg-current" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-blue-700 bg-blue-900 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active === l.href.replace("#", "")
                  ? "bg-yellow-400 text-blue-900"
                  : "text-blue-100 hover:bg-blue-700"
              }`}
            >
              {l.label}
            </a>
          ))}
          <div className="border-t border-blue-700 mt-2 pt-2 space-y-1">
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700">
                  👤 โปรไฟล์
                </Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700">
                  📊 แดชบอร์ด
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700">
                    ⚙️ ระบบจัดการ
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-medium text-blue-100 hover:bg-blue-700">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 rounded-lg text-sm font-semibold bg-yellow-400 text-blue-900 hover:bg-yellow-300">
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
