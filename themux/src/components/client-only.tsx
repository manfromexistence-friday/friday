"use client";

import { useMounted } from "@/hooks/use-mounted";
import React from "react";

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const isMounted = useMounted();

  return isMounted ? <>{children}</> : fallback;
}
