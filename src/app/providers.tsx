// src/app/providers.tsx
"use client";

import * as React from "react";
import { ToastProviderCustom } from "@/hooks/use-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProviderCustom>{children}</ToastProviderCustom>;
}
