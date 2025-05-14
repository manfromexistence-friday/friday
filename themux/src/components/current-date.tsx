"use client";

import { useState } from "react";

export function CurrentDate() {
  const [date] = useState(new Date());
  const year = date.getFullYear();

  return <span className="text-sm">{year}</span>;
}
