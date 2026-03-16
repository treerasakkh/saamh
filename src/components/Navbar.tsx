"use client";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "#home", label: "หน้าแรก" },
  { href: "#objectives", label: "วัตถุประสงค์" },
  { href: "#committee", label: "กรรมการ" },
  { href: "#members", label: "สมาชิก" },
  { href: "#about", label: "เกี่ยวกับเรา" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("home");

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
        </div>
      )}
    </nav>
  );
}
