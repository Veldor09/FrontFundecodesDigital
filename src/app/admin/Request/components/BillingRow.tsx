"use client";
import { useState } from "react";
import { Eye, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FinalInvoice } from "../types/billing.types";

interface Props {
  invoice: FinalInvoice;
  onView: () => void;
  onDelete: () => void | Promise<void>;
}

export default function BillingRow({ invoice, onView, onDelete }: Props) {
  const [busy, setBusy] = useState<"none" | "delete">("none");

  const execDelete = async () => {
    if (busy !== "none") return;
    setBusy("delete");
    try {
      await Promise.resolve(onDelete());
    } finally {
      setBusy("none");
    }
  };

  return (
    <tr
      className={`border-b hover:bg-slate-50 transition ${
        busy !== "none" ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      <td className="px-4 py-3 text-slate-800 font-medium">
        {invoice.number}
      </td>
      <td className="px-4 py-3 text-slate-600">
        {new Date(invoice.date).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-slate-600">
        {invoice.currency} {invoice.total.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-slate-600">
        {invoice.isValid ? (
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            Válida
          </span>
        ) : (
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            Rechazada
          </span>
        )}
      </td>
      <td className="px-4 py-3 flex gap-2">
        <Button size="icon" variant="ghost" onClick={onView} title="Ver factura">
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={execDelete}
          className="text-red-600 hover:text-red-800"
          title="Eliminar factura"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
