"use client";

import { scan, Options } from "react-scan";
import { useEffect } from "react";

interface ReactScanProps {
  options?: Options;
}

export function ReactScan({ options }: ReactScanProps) {
  useEffect(() => {
    scan({
      ...options,
    });
  }, [options]);
  return <></>;
}
