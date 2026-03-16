import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ส.บ.ม.ม.ห. | สมาคมผู้บริหารโรงเรียนมัธยมศึกษาจังหวัดมุกดาหาร",
  description: "สมาคมผู้บริหารโรงเรียนมัธยมศึกษาจังหวัดมุกดาหาร (ส.บ.ม.ม.ห.) S.A.A.M.H.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="bg-white text-gray-800 antialiased">
        {children}
      </body>
    </html>
  );
}
