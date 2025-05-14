"use client";

import { HTMLAttributes, useEffect, useState } from "react";

type VisuallyHiddenProps = HTMLAttributes<HTMLSpanElement>;

export function VisuallyHidden({ children, ...props }: VisuallyHiddenProps) {
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    // In production children will be kept hidden
    // thanks to the "sr-only" classname wrapping children
    if (process.env.NODE_ENV === "production") return;

    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Alt") {
        setForceShow(true);
      }
    };

    const handleKeyUp = (ev: KeyboardEvent) => {
      if (ev.key === "Alt") {
        setForceShow(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  if (forceShow) {
    return (
      <span className="text-muted-foreground pointer-events-none">
        {children}
      </span>
    );
  }

  return (
    <span className="sr-only" {...props}>
      {children}
    </span>
  );
}
