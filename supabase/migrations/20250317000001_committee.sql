-- Committee table
create table if not exists committee (
  id          serial primary key,
  sort_order  integer not null default 0,
  photo_id    text,
  name        text    not null,
  position    text    not null,
  school      text    not null,
  created_at  timestamptz default now()
);

-- Enable RLS (read-only for public)
alter table committee enable row level security;
create policy "Public read" on committee for select using (true);

-- Seed data
insert into committee (sort_order, photo_id, name, position, school) values
(1,  '1WeVnVhXBEixqV0SLN5xIFx8Sz5dzFS7x', 'นายธนิต ทองอาจ',          'นายกสมาคม',          'โรงเรียนมุกดาหาร'),
(2,  '111hqwndip68EOfpVcE_EMLYpEbKpTNhD', 'นายบุญชอบ อุสาย',          'อุปนายกคนที่ 1',      'โรงเรียนคำชะอีวิทยาคาร'),
(3,  '18fQydpQhc1K3ZYH1kgUwx_qCLZuPZqAd', 'นายศักดิ์ รุ่งแสง',        'อุปนายกคนที่ 2',      'โรงเรียนวิทยาศาสตร์จุฬาภรณราชวิทยาลัย มุกดาหาร'),
(4,  '10mGoykX1q7kIBMM9b8V2DSfV4Lps5a2_', 'นายเนรมิต กฤตาคม',         'อุปนายกคนที่ 3',      'โรงเรียนหนองสูงสามัคคีวิทยา'),
(5,  '1Ye6hORndyF-ZJoF2C1gmPzAwwlBaXw_B', 'นายธวัชชัย อยู่พุก',       'เลขานุการ',           'โรงเรียนคำป่าหลายสรรพวิทย์'),
(6,  '1Nqj9NKWH7uG7rYRr-EHSkEQmnpPsA8vp', 'นายกิตติชัย ปัญญารมย์',    'ผู้ช่วยเลขานุการ',    'โรงเรียนโพธิ์ไทรวิทยา'),
(7,  '1oy5xrUX0Nz7nL6ovtzxY08hde3ZsCMTT', 'นายปิโย ลุสุข',             'เหรัญญิก',            'โรงเรียนผาเทิบวิทยา'),
(8,  '1-T60U1d7Noa6vwAvV0teRs9os-NAbVx3', 'นางทิพวรรณ สุวรรณไตรย์',   'ผู้ช่วยเหรัญญิก',     'โรงเรียนกกตูมประชาสรรค์รัชมังคลาภิเษก'),
(9,  '1yPTkv8BIJlDnwOEgTiPWK5XliMS46gOb', 'นางสุภัคชญา นารากิจศิริ',  'ปฏิคม',               'โรงเรียนนาวาราชกิจพิทยานุสรณ์'),
(10, '1Olf8VtHNEfqIc-G5wlNrHFJYd_2NAAe-', 'นายวัชรา สุตาวงศ์',        'ผู้ช่วยปฏิคม',        'โรงเรียนเหล่าประชาอุทิศ'),
(11, '1F2PuAVH6T7j2t6aEuk8fsqBb8a6OSJWa', 'นายธวัชชัย สิงห์ขัน',      'นายทะเบียน',          'โรงเรียนแวงใหญ่พิทยาสรรค์'),
(12, '1lTS94qqQ4LFp2D_JFxPEI8YUGU3Gwoen', 'นายธีระศักดิ์ คนตรง',      'ผู้ช่วยนายทะเบียน',   'โรงเรียนคำบกวิทยาคาร'),
(13, '1P4zVuu-DdK2bxkBKu2_26Vuiab7Y4Ust', 'นายวินิจ พลธะรัตน์',       'ประชาสัมพันธ์',       'โรงเรียนคำสร้อยพิทยาสรรค์'),
(14, '1GereWVJShzt931VEC5-nuGzfhKk91HJ8', 'นายพิภพ นาทองลาย',         'ผู้ช่วยประชาสัมพันธ์', 'โรงเรียนหนองแวงวิทยาคม'),
(15, '1daQL9F72z8Luut1CgS7xHzpYj_DF5QMB', 'นายปานไทย ภูล้นแก้ว',      'สันทนาการ',           'โรงเรียนคำชะอีพิทยาคม'),
(16, '1lsmXyzihlJ-Ff-CtLEZ546zlTRxt76J0', 'นายจิตติ ช่างแกะ',          'ผู้ช่วยสันทนาการ',    'โรงเรียนเมืองมุกวิทยาคม'),
(17, '156YtZU0uqwE3Arzs96XyTfUJjBwfkOJz', 'นายบุญเลี่ยม บุญศรี',      'วิชาการ',             'โรงเรียนดอนตาลวิทยา'),
(18, '19O8nPFj7Wlm3CrldAsF4ExmkWJiZCCpk', 'นายไกรศรี ภิรมย์',         'ผู้ช่วยวิชาการ',       'โรงเรียนดงเย็นวิทยาคม'),
(19, '1tszRMs9tyHted2DKori5O3sVu6VJsHIF', 'นายพรชัย ทวีโคตร',         'สวัสดิการ',           'โรงเรียนนาโสกวิทยาคาร'),
(20, '18EE_nyMAtH0gP2x7K9zZoxI490XoGjxX', 'นายศิริพร บุญทะระ',        'ผู้ช่วยสวัสดิการ',    'โรงเรียนดงมอนวิทยาคม');
