import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
  } catch {
    // ไม่ให้ error หยุดการ logout
  }
  // ใช้ origin เพื่อให้ redirect URL ถูกต้องทั้ง local และ production
  const origin = req.nextUrl.origin;
  return NextResponse.redirect(`${origin}/login`, { status: 302 });
}

// รองรับ GET ด้วย (กรณี link logout)
export async function GET(req: NextRequest) {
  return POST(req);
}
