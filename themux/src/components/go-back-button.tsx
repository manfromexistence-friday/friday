"use client";

import { useRouter } from "next/navigation";
import { ComponentProps, MouseEvent } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function GoBackButton({
  children,
  className,
  ...props
}: ComponentProps<typeof Button>) {
  const router = useRouter();

  const goBack = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.back();
  };

  return (
    <Button {...props} className={cn(className)} onClick={goBack}>
      {children}
    </Button>
  );
}
