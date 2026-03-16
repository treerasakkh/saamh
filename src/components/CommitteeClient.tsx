"use client";
import { useState } from "react";
import type { CommitteeMember } from "./CommitteeSection";

function getInitials(name: string): string {
  const cleaned = name.replace(/^(นายแพทย์|นางสาว|ดร\.|ศ\.|รศ\.|ผศ\.|นาย|นาง)\s*/u, "");
  const parts = cleaned.trim().split(/\s+/);
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return cleaned.slice(0, 2);
}

function gdriveThumbnail(id: string) {
  return `https://drive.google.com/thumbnail?id=${id}&sz=w200-h200`;
}

const avatarColors = [
  "from-blue-600 to-blue-800",
  "from-indigo-500 to-indigo-700",
  "from-sky-500 to-sky-700",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-blue-600",
  "from-cyan-500 to-blue-600",
  "from-blue-400 to-blue-700",
  "from-indigo-400 to-purple-600",
  "from-sky-600 to-indigo-700",
  "from-blue-700 to-indigo-800",
];

function Avatar({ member, index, size = "md" }: { member: CommitteeMember; index: number; size?: "lg" | "md" }) {
  const [imgError, setImgError] = useState(false);
  const dim = size === "lg" ? "w-24 h-24 text-2xl" : "w-16 h-16 text-base";
  const ring = size === "lg" ? "ring-4 ring-yellow-400/70" : "ring-2 ring-blue-200";

  if (member.photo_id && !imgError) {
    return (
      <img
        src={gdriveThumbnail(member.photo_id)}
        alt={member.name}
        onError={() => setImgError(true)}
        className={`${dim} rounded-full object-cover ${ring} shadow-lg`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center font-black text-white ${ring} shadow-lg`}>
      {getInitials(member.name)}
    </div>
  );
}

export default function CommitteeClient({ members }: { members: CommitteeMember[] }) {
  const president = members[0];
  const rest = members.slice(1);

  return (
    <section id="committee" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-2">COMMITTEE</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">คณะกรรมการ</h2>
          <div className="mt-3 mx-auto w-16 h-1 bg-yellow-400 rounded-full" />
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            คณะกรรมการบริหารสมาคมผู้บริหารโรงเรียนมัธยมศึกษาจังหวัดมุกดาหาร
          </p>
        </div>

        {/* President */}
        <div className="flex justify-center mb-10">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-8 text-center text-white shadow-xl w-full max-w-xs hover:-translate-y-1 transition-transform">
            <div className="flex justify-center mb-4">
              <Avatar member={president} index={0} size="lg" />
            </div>
            <div className="inline-block px-3 py-1 bg-yellow-400 text-blue-900 text-xs font-bold rounded-full mb-3">
              {president.position}
            </div>
            <h3 className="text-lg font-bold">{president.name}</h3>
            <p className="text-blue-300 text-sm mt-1">{president.school}</p>
          </div>
        </div>

        {/* Rest of committee */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {rest.map((member, i) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all"
            >
              <div className="flex justify-center mb-3">
                <Avatar member={member} index={i + 1} size="md" />
              </div>
              <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-2 leading-tight">
                {member.position}
              </div>
              <h3 className="text-gray-900 font-bold text-sm leading-snug">{member.name}</h3>
              <p className="text-gray-400 text-xs mt-1 leading-tight">{member.school}</p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-gray-400 text-xs">
          ทั้งหมด {members.length} ท่าน
        </p>
      </div>
    </section>
  );
}
