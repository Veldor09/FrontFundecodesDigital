"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DirectorRow({ req, onApprove, onReject }:{
  req:any; onApprove: ()=>void; onReject:(obs:string)=>void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [obs, setObs] = useState("");
  return (
    <tr className="border-b hover:bg-slate-50">
      <td className="px-4 py-3">{req.id}</td>
      <td className="px-4 py-3">{req.concept}</td>
      <td className="px-4 py-3">{req.program}</td>
      <td className="px-4 py-3">₡{req.amount.toLocaleString()}</td>
      <td className="px-4 py-3 flex gap-2">
        <Button size="sm" onClick={onApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white">Aprobar</Button>
        <Button size="sm" variant="destructive" onClick={()=>setShowReject(v=>!v)}>Rechazar</Button>
        {showReject && (
          <div className="flex gap-2">
            <input className="rounded-md border px-2 py-1 text-sm" placeholder="Observaciones" value={obs} onChange={e=>setObs(e.target.value)} />
            <Button size="sm" variant="destructive" onClick={()=>onReject(obs)}>Confirmar</Button>
          </div>
        )}
      </td>
    </tr>
  );
}
