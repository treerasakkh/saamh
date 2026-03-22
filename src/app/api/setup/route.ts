import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey || serviceKey === 'ใส่_service_role_key_ตรงนี้') {
    return NextResponse.json({ error: 'กรุณาใส่ SUPABASE_SERVICE_ROLE_KEY ใน .env.local ก่อน' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const results: Record<string, string> = {}

  // สร้าง Admin
  const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
    email: 'admin@saamh.ac.th',
    password: 'Am12345678',
    email_confirm: true,
    user_metadata: { full_name: 'ผู้ดูแลระบบ', role: 'pending' }
  })
  if (adminError) {
    results.admin = `error: ${adminError.message}`
  } else {
    results.admin = `สร้างสำเร็จ: ${adminData.user.email}`
    // ตั้ง role เป็น admin
    await supabase.from('profiles').upsert({
      id: adminData.user.id,
      email: 'admin@saamh.ac.th',
      full_name: 'ผู้ดูแลระบบ',
      role: 'admin'
    })
  }

  // สร้าง Member1
  const { data: memberData, error: memberError } = await supabase.auth.admin.createUser({
    email: 'member1@saamh.ac.th',
    password: 'Mb12345678',
    email_confirm: true,
    user_metadata: { full_name: 'สมาชิกทดสอบ', role: 'pending' }
  })
  if (memberError) {
    results.member1 = `error: ${memberError.message}`
  } else {
    results.member1 = `สร้างสำเร็จ: ${memberData.user.email}`
    await supabase.from('profiles').upsert({
      id: memberData.user.id,
      email: 'member1@saamh.ac.th',
      full_name: 'สมาชิกทดสอบ',
      role: 'member',
      member_code: 'SAAMH-2568-0001'
    })
  }

  return NextResponse.json({
    message: 'เสร็จสิ้น — ลบไฟล์ src/app/api/setup/route.ts ทิ้งได้เลยหลังใช้งาน',
    results
  })
}
