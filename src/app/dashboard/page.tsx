import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Logged in as</p>
          <p className="mt-1 font-medium text-gray-900">{user.email}</p>
        </div>
      </div>
    </main>
  );
}
