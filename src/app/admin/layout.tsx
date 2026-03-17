import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { headers } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
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
