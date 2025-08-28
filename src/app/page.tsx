// src/app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/landing"); // ✅ en vez de "/"
}
