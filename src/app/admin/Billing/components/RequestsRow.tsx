"use client";
export default function RequestsRow({ req }: { req: any }) {
  const badge = (s:string) =>
    s==="approved" ? "bg-green-100 text-green-700" :
    s==="validated"? "bg-blue-100 text-blue-700" :
    s==="rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700";
  return (
    <tr className="border-b hover:bg-slate-50">
      <td className="px-4 py-3">{req.id}</td>
      <td className="px-4 py-3">{req.concept}</td>
      <td className="px-4 py-3">{req.program}</td>
      <td className="px-4 py-3">₡{req.amount.toLocaleString()}</td>
      <td className="px-4 py-3">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge(req.status)}`}>
          {req.status}
        </span>
      </td>
    </tr>
  );
}
