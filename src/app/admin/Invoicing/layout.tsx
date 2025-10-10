"use client";
import QueryProvider from "../../providers/QueryProvider";

export default function InvoicingLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}
