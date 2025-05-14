"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { FrameHighlight } from "@/components/frame-highlight";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ContainerWrapper } from "@/components/wrappers";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useMediaQuery } from "@/hooks/use-media-query";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export function MainNavigation() {
  return (
    <nav className="flex items-center gap-4">
      <Link href={"/"} className="font-base pr-4 font-bold">
        themux
      </Link>
      <div className="contents max-md:hidden">
        {NAV_LINKS.map(({ href, title }) => (
          <NavLink href={href} title={title} key={href} />
        ))}
      </div>
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMobile && isOpen) {
      //  Close the mobile menu if the screen size gets larger and it's open
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  useClickOutside(mobileMenuRef, () => setIsOpen(false));

  return (
    <div ref={mobileMenuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="inline-flex md:hidden"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Menu
          className={cn(
            "size-4 transition duration-200",
            isOpen ? "absolute scale-0" : "scale-100",
          )}
        />
        <X
          className={cn(
            "size-4 transition duration-200",
            !isOpen ? "absolute scale-0" : "scale-100",
          )}
        />
      </Button>
      <div
        className={cn(
          "bg-background absolute inset-x-0 top-full z-40 grid grid-rows-[0fr] gap-2 overflow-hidden transition-all duration-200 ease-out md:grid-rows-[0fr]",
          isOpen && isMobile ? "grid-rows-[1fr] border-b" : "",
        )}
      >
        <ContainerWrapper className="overflow-hidden">
          <Label className="text-muted-foreground text-xs">Navigation</Label>
          <div className="flex flex-col gap-2.5 pt-2 pb-4">
            {NAV_LINKS.map(({ href, title }) => {
              const isSamePathname = pathname === href;
              return (
                <button
                  key={href}
                  className="m-0 h-fit p-0 text-left"
                  onClick={() => {
                    if (isSamePathname) return;
                    // Only close the mobile menu if the link clicked has a different pathname
                    setIsOpen(false);
                  }}
                >
                  <NavLink href={href} title={title} />
                </button>
              );
            })}
          </div>
        </ContainerWrapper>
      </div>
    </div>
  );
}

function NavLink({ href, title }: { href: string; title: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      key={href}
      href={href}
      className={cn(
        "text-muted-foreground hover:text-accent-foreground relative text-sm transition-all ease-out",
        isActive && "text-foreground hover:text-foreground",
      )}
      onNavigate={(e) => {
        if (isActive) e.preventDefault();
      }}
    >
      {isActive ? <FrameHighlight>{title}</FrameHighlight> : title}
    </Link>
  );
}
