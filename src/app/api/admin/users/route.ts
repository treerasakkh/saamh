import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function verifyAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return null;
  return user;
}

// GET /api/admin/users — ดึง profiles ทั้งหมด (ใช้ service role bypass RLS)
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const supabase = adminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

// PATCH /api/admin/users — แก้ไข profile
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "ไม่พบ id" }, { status: 400 });

  // ลบ field ที่ไม่ควร update
  delete updates.email;
  delete updates.created_at;

  const supabase = adminClient();
  const { error } = await supabase.from("profiles").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

// POST /api/admin/users — สร้าง user ใหม่
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { email, password, full_name, phone, school, member_type, role, member_code } = await req.json();
  if (!email || !password || !full_name) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 });
  }

  const supabase = adminClient();

  // สร้าง auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, phone, school, member_type: member_type ?? "สามัญ", role: "pending" },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // upsert profile พร้อม role ที่ admin กำหนด
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    email,
    full_name,
    phone: phone ?? "",
    school: school ?? "",
    member_type: member_type ?? "สามัญ",
    role: role ?? "member",
    member_code: member_code ?? "",
  });
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

  return NextResponse.json({ success: true, userId: data.user.id });
}

// DELETE /api/admin/users — ลบ user ออกจาก auth.users (cascade ลบ profile ด้วย)
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "ไม่พบ userId" }, { status: 400 });

  const supabase = adminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
