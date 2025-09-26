"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AccountantRow({ req, onValidate, onReturn }:{
  req:any; onValidate: ()=>void; onReturn:(note:string)=>void;
}) {
  const [showReturn, setShowReturn] = useState(false);
  const [note, setNote] = useState("");
  return (
    <tr className="border-b hover:bg-slate-50">
      <td className="px-4 py-3">{req.id}</td>
      <td className="px-4 py-3">{req.concept}</td>
      <td className="px-4 py-3">{req.program}</td>
      <td className="px-4 py-3">₡{req.amount.toLocaleString()}</td>
      <td className="px-4 py-3 flex gap-2">
        <Button size="sm" onClick={onValidate} className="bg-emerald-600 hover:bg-emerald-700 text-white">Validar</Button>
        <Button size="sm" variant="outline" onClick={()=>setShowReturn(v=>!v)}>Devolver</Button>
        {showReturn && (
          <div className="flex gap-2">
            <input className="rounded-md border px-2 py-1 text-sm" placeholder="Motivo" value={note} onChange={e=>setNote(e.target.value)} />
            <Button size="sm" variant="destructive" onClick={()=>onReturn(note)}>Confirmar</Button>
          </div>
        )}
      </td>
    </tr>
  );
}
