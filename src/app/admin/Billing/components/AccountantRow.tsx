"use client";
import { Button } from "@/components/ui/button";

export default function AccountantRow({
  req,
  onValidate,
  onReturnClick, // <- ahora solo abre modal
}: {
  req: { id: number | string; concept?: string; program?: string; amount?: number | null };
  onValidate: () => void;
  onReturnClick: () => void;
}) {
  const safeAmount =
    typeof req.amount === "number" ? `₡${req.amount.toLocaleString()}` : "—";
  const safeProgram = req.program ?? "—";
  const concept = req.concept ?? "—";

  return (
    <tr className="border-b hover:bg-slate-50">
      <td className="px-4 py-3">{req.id}</td>
      <td className="px-4 py-3">{concept}</td>
      <td className="px-4 py-3">{safeProgram}</td>
      <td className="px-4 py-3">{safeAmount}</td>
      <td className="px-4 py-3 flex flex-col gap-2 sm:flex-row">
        <Button
          size="sm"
          onClick={onValidate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Validar
        </Button>
        <Button size="sm" variant="outline" onClick={onReturnClick}>
          Devolver
        </Button>
      </td>
    </tr>
  );
}
