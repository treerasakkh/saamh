import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { headers } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // ใช้ auth client ตรวจสอบ session เท่านั้น
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ใช้ admin client (service role) ดึง profile เพื่อ bypass RLS
  const adminDb = createAdminClient();
  const { data: profile } = await adminDb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/admin";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPath={pathname} />
      <div className="flex-1 lg:ml-0 pt-14 lg:pt-0 overflow-auto">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
