import { createClient } from "@/lib/supabase/server";
import MembersClient from "./MembersClient";

export type Member = {
  id: number;
  code: string;
  member_type: "กิตติมศักดิ์" | "สามัญ" | "วิสามัญ";
  name: string;
  school: string;
  note: string;
};

const fallback: Member[] = [
  // กิตติมศักดิ์
  { id: 1,  code: "ก001", member_type: "กิตติมศักดิ์", name: "นายยงยุทธ สายคง",          school: "อดีต ผอ.สพม.22",               note: "-" },
  { id: 2,  code: "ก002", member_type: "กิตติมศักดิ์", name: "นายเลียง ผางพันธ์",          school: "อดีต ผอ.ร.ร.มุกดาหาร",          note: "-" },
  { id: 3,  code: "ก003", member_type: "กิตติมศักดิ์", name: "นายประดิษฐ์ศักดิ์ ภักดีพล", school: "อดีต ผอ.ร.ร.ดอนตาลวิทยา",      note: "-" },
  // สามัญ
  { id: 4,  code: "001",  member_type: "สามัญ", name: "นายสุรพงษ์ รัตนวงศ์",           school: "มุกดาหาร",                                      note: "เกษียณ" },
  { id: 5,  code: "002",  member_type: "สามัญ", name: "นายศักดิ์ รุ่งแสง",              school: "วิทยาศาสตร์จุฬาภรณราชวิทยาลัย มุกดาหาร",       note: "-" },
  { id: 6,  code: "003",  member_type: "สามัญ", name: "นายธนิต ทองอาจ",                school: "มุกดาหาร",                                      note: "-" },
  { id: 7,  code: "004",  member_type: "สามัญ", name: "นายสวาสดิ์ สมประสงค์",           school: "โชคชัยวิทยา",                                   note: "-" },
  { id: 8,  code: "005",  member_type: "สามัญ", name: "นายราชัน อาจวิชัย",              school: "ร่มเกล้าพิทยาสรรค์",                            note: "-" },
  { id: 9,  code: "006",  member_type: "สามัญ", name: "ว่าที่ ร.ต.อัศดา อัญฤๅชัย",     school: "คำสร้อยพิทยาสรรค์",                            note: "เกษียณ" },
  { id: 10, code: "007",  member_type: "สามัญ", name: "นายบุญเลี่ยม บุญศรี",            school: "ดอนตาลวิทยา",                                   note: "-" },
  { id: 11, code: "008",  member_type: "สามัญ", name: "นางสุภัคชญา นารากิจศิริ",        school: "นาวาราชกิจพิทยานุสรณ์",                         note: "-" },
  { id: 12, code: "009",  member_type: "สามัญ", name: "นายธวัชชัย อยู่พุก",             school: "คำป่าหลายสรรพวิทย์",                            note: "-" },
  { id: 13, code: "010",  member_type: "สามัญ", name: "นายอภินันท์ อินลี",              school: "หว้านใหญ่วิทยา",                                 note: "-" },
  { id: 14, code: "011",  member_type: "สามัญ", name: "นายเสกสรร ปัญญาแก้ว",            school: "ผึ่งแดดวิทยาคาร",                               note: "-" },
  { id: 15, code: "012",  member_type: "สามัญ", name: "นายวินิจ พลธะรัตน์",             school: "เมืองมุกวิทยาคม",                               note: "-" },
  { id: 16, code: "013",  member_type: "สามัญ", name: "นายศิริพร บุญทะระ",              school: "ดงมอนวิทยาคม",                                  note: "-" },
  { id: 17, code: "014",  member_type: "สามัญ", name: "นายปิโย ลุสุข",                  school: "ผาเทิบวิทยา",                                   note: "-" },
  { id: 18, code: "015",  member_type: "สามัญ", name: "นายเมฆสุวรรณ วังวงศ์",           school: "นวมินทราชูทิศ อีสาน",                           note: "-" },
  { id: 19, code: "016",  member_type: "สามัญ", name: "นายวิษณุกร จันทรา",              school: "มุกดาวิทยานุกูล",                               note: "-" },
  { id: 20, code: "017",  member_type: "สามัญ", name: "นายธวัช สุขบัติ",                school: "คำบกวิทยาคาร",                                  note: "เกษียณ" },
  { id: 21, code: "018",  member_type: "สามัญ", name: "นายปานไทย ภูล้นแก้ว",            school: "คำชะอีพิทยาคม",                                 note: "-" },
  { id: 22, code: "019",  member_type: "สามัญ", name: "นายวิชัย ช่างถม",                school: "ดงหลวงวิทยา",                                   note: "-" },
  { id: 23, code: "020",  member_type: "สามัญ", name: "นายบุญชอบ อุสาย",                school: "คำชะอีวิทยาคาร",                                note: "-" },
  { id: 24, code: "021",  member_type: "สามัญ", name: "สิบเอกจิตติ ช่างแกะ",            school: "เมืองมุกวิทยาคม",                               note: "-" },
  { id: 25, code: "022",  member_type: "สามัญ", name: "นายพรชัย ทวีโคตร",               school: "นาโสกวิทยาคาร",                                 note: "-" },
  { id: 26, code: "023",  member_type: "สามัญ", name: "นายกิตติชัย ปัญญารมย์",          school: "โพธิ์ไทรวิทยา",                                 note: "-" },
  { id: 27, code: "024",  member_type: "สามัญ", name: "นายธวัชชัย สิงห์ขัน",            school: "แวงใหญ่พิทยาสรรค์",                             note: "-" },
  { id: 28, code: "025",  member_type: "สามัญ", name: "นายไกรศรี ภิรมย์",               school: "ดงเย็นวิทยาคม",                                 note: "-" },
  { id: 29, code: "026",  member_type: "สามัญ", name: "นายพิภพ นาทองลาย",               school: "หนองแวงวิทยาคม",                                note: "-" },
  { id: 30, code: "027",  member_type: "สามัญ", name: "นายธีระศักดิ์ คนตรง",            school: "คำบกวิทยาคาร",                                  note: "-" },
  { id: 31, code: "028",  member_type: "สามัญ", name: "นางทิพวรรณ สุวรรณไตรย์",         school: "กกตูมประชาสรรค์รัชมังคลาภิเษก",                 note: "-" },
  { id: 32, code: "029",  member_type: "สามัญ", name: "นายวัชรา สุตาวงค์",              school: "เหล่าประชาอุทิศ",                               note: "-" },
  { id: 33, code: "030",  member_type: "สามัญ", name: "นายพุฒิชัย สุวรรณไตรย์",         school: "ชัยปัญญาวิทยานุสรณ์",                           note: "-" },
  { id: 34, code: "031",  member_type: "สามัญ", name: "นายเนรมิต กฤตาคม",               school: "หนองสูงสามัคคีวิทยา",                           note: "-" },
  // วิสามัญ
  { id: 35, code: "ว001", member_type: "วิสามัญ", name: "นายธีระศักดิ์ คนตรง",          school: "วิทยาศาสตร์จุฬาภรณราชวิทยาลัย มุกดาหาร",       note: "เปลี่ยนตำแหน่ง" },
  { id: 36, code: "ว002", member_type: "วิสามัญ", name: "นางสาวศุภานัน กลางประพันธ์",   school: "มุกดาหาร",                                      note: "-" },
  { id: 37, code: "ว003", member_type: "วิสามัญ", name: "นายพรชัย ทวีโคตร",             school: "มุกดาวิทยานุกูล",                               note: "เปลี่ยนตำแหน่ง" },
  { id: 38, code: "ว004", member_type: "วิสามัญ", name: "นายคำแถน สุคำภา",              school: "ดงหลวงวิทยา",                                   note: "เปลี่ยนตำแหน่ง" },
  { id: 39, code: "ว005", member_type: "วิสามัญ", name: "นายวัชรา สุตาวงศ์",            school: "คำสร้อยพิทยาสรรค์",                             note: "เปลี่ยนตำแหน่ง" },
  { id: 40, code: "ว006", member_type: "วิสามัญ", name: "นายไพรวรรณ์ บุษบงค์",          school: "หนองสูงสามัคคีวิทยา",                           note: "-" },
  { id: 41, code: "ว007", member_type: "วิสามัญ", name: "นายสอนนารินทร์ ปัททุม",        school: "หนองสูงสามัคคีวิทยา",                           note: "-" },
  { id: 42, code: "ว008", member_type: "วิสามัญ", name: "นายกิตติศักดิ์ ม่อมพะเนาว์",   school: "หว้านใหญ่วิทยา",                                note: "เปลี่ยนตำแหน่ง" },
  { id: 43, code: "ว009", member_type: "วิสามัญ", name: "นางอุลิยา ศรีบุรมย์",          school: "คำชะอีวิทยาคาร",                                note: "-" },
  { id: 44, code: "ว010", member_type: "วิสามัญ", name: "นายนววิช จันเต็ม",             school: "มุกดาหาร",                                      note: "-" },
  { id: 45, code: "ว011", member_type: "วิสามัญ", name: "นายทรัพย์ภวัฎ สายสมาน",        school: "ดงเย็นวิทยาคม",                                 note: "เปลี่ยนตำแหน่ง" },
  { id: 46, code: "ว012", member_type: "วิสามัญ", name: "นายวิชิต บุรัตน์",             school: "คำชะอีวิทยาคาร",                                note: "-" },
  { id: 47, code: "ว013", member_type: "วิสามัญ", name: "นางปานใจ สุขเสมอ",             school: "ร่มเกล้าพิทยาสรรค์",                            note: "-" },
  { id: 48, code: "ว014", member_type: "วิสามัญ", name: "นายอนุชา ยืนยง",               school: "มุกดาวิทยานุกูล",                               note: "-" },
  { id: 49, code: "ว015", member_type: "วิสามัญ", name: "นางกาญจนา ณหนองคาย",           school: "ดงหลวงวิทยา",                                   note: "-" },
  { id: 50, code: "ว016", member_type: "วิสามัญ", name: "นายณัชฐวัชฐ์ กลางประพันธ์",    school: "คำชะอีวิทยาคาร",                                note: "เปลี่ยนตำแหน่ง" },
  { id: 51, code: "ว017", member_type: "วิสามัญ", name: "นางทิพวรรณ สุวรรณไตรย์",       school: "ดงหลวงวิทยา",                                   note: "เปลี่ยนตำแหน่ง" },
  { id: 52, code: "ว018", member_type: "วิสามัญ", name: "ว่าที่ร้อยตรีชโย สุพร",         school: "ชัยปัญญาวิทยานุสรณ์",                           note: "-" },
  { id: 53, code: "ว019", member_type: "วิสามัญ", name: "นางสาวอุลัยพร สิงห์ขัน",       school: "คำสร้อยพิทยาสรรค์",                             note: "-" },
  { id: 54, code: "ว020", member_type: "วิสามัญ", name: "นางสาวพรวลี ตรีประภากร",       school: "นาวาราชกิจพิทยานุสรณ์",                         note: "-" },
  { id: 55, code: "ว021", member_type: "วิสามัญ", name: "นายวิชาญ วาปี",                school: "มุกดาหาร",                                      note: "-" },
];

async function fetchMembers(): Promise<Member[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("members")
      .select("id, code, member_type, name, school, note")
      .order("code");
    if (error || !data?.length) return fallback;
    return data as Member[];
  } catch {
    return fallback;
  }
}

export default async function MembersSection() {
  const members = await fetchMembers();
  return <MembersClient members={members} />;
}
