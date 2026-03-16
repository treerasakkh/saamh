import { createClient } from "@/lib/supabase/server";
import CommitteeClient from "./CommitteeClient";

export type CommitteeMember = {
  id: number;
  sort_order: number;
  photo_id: string | null;
  name: string;
  position: string;
  school: string;
};

// Static fallback (used when Supabase is not yet configured)
const fallback: CommitteeMember[] = [
  { id: 1,  sort_order: 1,  photo_id: "1WeVnVhXBEixqV0SLN5xIFx8Sz5dzFS7x", name: "นายธนิต ทองอาจ",          position: "นายกสมาคม",          school: "โรงเรียนมุกดาหาร" },
  { id: 2,  sort_order: 2,  photo_id: "111hqwndip68EOfpVcE_EMLYpEbKpTNhD", name: "นายบุญชอบ อุสาย",          position: "อุปนายกคนที่ 1",      school: "โรงเรียนคำชะอีวิทยาคาร" },
  { id: 3,  sort_order: 3,  photo_id: "18fQydpQhc1K3ZYH1kgUwx_qCLZuPZqAd", name: "นายศักดิ์ รุ่งแสง",        position: "อุปนายกคนที่ 2",      school: "โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย มุกดาหาร" },
  { id: 4,  sort_order: 4,  photo_id: "10mGoykX1q7kIBMM9b8V2DSfV4Lps5a2_", name: "นายเนรมิต กฤตาคม",         position: "อุปนายกคนที่ 3",      school: "โรงเรียนหนองสูงสามัคคีวิทยา" },
  { id: 5,  sort_order: 5,  photo_id: "1Ye6hORndyF-ZJoF2C1gmPzAwwlBaXw_B", name: "นายธวัชชัย อยู่พุก",       position: "เลขานุการ",           school: "โรงเรียนคำป่าหลายสรรพวิทย์" },
  { id: 6,  sort_order: 6,  photo_id: "1Nqj9NKWH7uG7rYRr-EHSkEQmnpPsA8vp", name: "นายกิตติชัย ปัญญารมย์",    position: "ผู้ช่วยเลขานุการ",    school: "โรงเรียนโพธิ์ไทรวิทยา" },
  { id: 7,  sort_order: 7,  photo_id: "1oy5xrUX0Nz7nL6ovtzxY08hde3ZsCMTT", name: "นายปิโย ลุสุข",             position: "เหรัญญิก",            school: "โรงเรียนผาเทิบวิทยา" },
  { id: 8,  sort_order: 8,  photo_id: "1-T60U1d7Noa6vwAvV0teRs9os-NAbVx3", name: "นางทิพวรรณ สุวรรณไตรย์",   position: "ผู้ช่วยเหรัญญิก",     school: "โรงเรียนกกตูมประชาสรรค์รัชมังคลาภิเษก" },
  { id: 9,  sort_order: 9,  photo_id: "1yPTkv8BIJlDnwOEgTiPWK5XliMS46gOb", name: "นางสุภัคชญา นารากิจศิริ",  position: "ปฏิคม",               school: "โรงเรียนนาวาราชกิจพิทยานุสรณ์" },
  { id: 10, sort_order: 10, photo_id: "1Olf8VtHNEfqIc-G5wlNrHFJYd_2NAAe-", name: "นายวัชรา สุตาวงศ์",        position: "ผู้ช่วยปฏิคม",        school: "โรงเรียนเหล่าประชาอุทิศ" },
  { id: 11, sort_order: 11, photo_id: "1F2PuAVH6T7j2t6aEuk8fsqBb8a6OSJWa", name: "นายธวัชชัย สิงห์ขัน",      position: "นายทะเบียน",          school: "โรงเรียนแวงใหญ่พิทยาสรรค์" },
  { id: 12, sort_order: 12, photo_id: "1lTS94qqQ4LFp2D_JFxPEI8YUGU3Gwoen", name: "นายธีระศักดิ์ คนตรง",      position: "ผู้ช่วยนายทะเบียน",   school: "โรงเรียนคำบกวิทยาคาร" },
  { id: 13, sort_order: 13, photo_id: "1P4zVuu-DdK2bxkBKu2_26Vuiab7Y4Ust", name: "นายวินิจ พลธะรัตน์",       position: "ประชาสัมพันธ์",       school: "โรงเรียนคำสร้อยพิทยาสรรค์" },
  { id: 14, sort_order: 14, photo_id: "1GereWVJShzt931VEC5-nuGzfhKk91HJ8", name: "นายพิภพ นาทองลาย",         position: "ผู้ช่วยประชาสัมพันธ์", school: "โรงเรียนหนองแวงวิทยาคม" },
  { id: 15, sort_order: 15, photo_id: "1daQL9F72z8Luut1CgS7xHzpYj_DF5QMB", name: "นายปานไทย ภูล้นแก้ว",      position: "สันทนาการ",           school: "โรงเรียนคำชะอีพิทยาคม" },
  { id: 16, sort_order: 16, photo_id: "1lsmXyzihlJ-Ff-CtLEZ546zlTRxt76J0", name: "นายจิตติ ช่างแกะ",          position: "ผู้ช่วยสันทนาการ",    school: "โรงเรียนเมืองมุกวิทยาคม" },
  { id: 17, sort_order: 17, photo_id: "156YtZU0uqwE3Arzs96XyTfUJjBwfkOJz", name: "นายบุญเลี่ยม บุญศรี",      position: "วิชาการ",             school: "โรงเรียนดอนตาลวิทยา" },
  { id: 18, sort_order: 18, photo_id: "19O8nPFj7Wlm3CrldAsF4ExmkWJiZCCpk", name: "นายไกรศรี ภิรมย์",         position: "ผู้ช่วยวิชาการ",       school: "โรงเรียนดงเย็นวิทยาคม" },
  { id: 19, sort_order: 19, photo_id: "1tszRMs9tyHted2DKori5O3sVu6VJsHIF", name: "นายพรชัย ทวีโคตร",         position: "สวัสดิการ",           school: "โรงเรียนนาโสกวิทยาคาร" },
  { id: 20, sort_order: 20, photo_id: "18EE_nyMAtH0gP2x7K9zZoxI490XoGjxX", name: "นายศิริพร บุญทะระ",        position: "ผู้ช่วยสวัสดิการ",    school: "โรงเรียนดงมอนวิทยาคม" },
];

async function fetchCommittee(): Promise<CommitteeMember[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("committee")
      .select("id, sort_order, photo_id, name, position, school")
      .order("sort_order");
    if (error || !data?.length) return fallback;
    return data as CommitteeMember[];
  } catch {
    return fallback;
  }
}

export default async function CommitteeSection() {
  const members = await fetchCommittee();
  return <CommitteeClient members={members} />;
}
