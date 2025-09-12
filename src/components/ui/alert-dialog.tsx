"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

// ✅ AlertDialog principal
export function AlertDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-white rounded-lg shadow-lg border w-full max-w-lg p-6">
        {children}
      </div>
    </div>
  );
}

// ✅ AlertDialogContent
export function AlertDialogContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

// ✅ AlertDialogHeader
export function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

// ✅ AlertDialogFooter
export function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2 mt-4">{children}</div>;
}

// ✅ AlertDialogTitle
export function AlertDialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

// ✅ AlertDialogDescription
export function AlertDialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600">{children}</p>;
}

// ✅ AlertDialogAction
export function AlertDialogAction({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={buttonVariants({ variant: "default" })}>
      {children}
    </button>
  );
}

// ✅ AlertDialogCancel
export function AlertDialogCancel({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={buttonVariants({ variant: "outline" })}>
      {children}
    </button>
  );
}