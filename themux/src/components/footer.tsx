import { CurrentDate } from "./current-date";
import { ExternalLink } from "./external-link";
import { GitHub } from "./icons/github";

export function Footer() {
  return (
    <footer className="bg-background py-12 font-mono">
      <div className="grid gap-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <CurrentDate />
            <ExternalLink href="https://github.com/llanesluis" showIcon>
              <span>
                llanes<span className="text-primary font-semibold">luis</span>
              </span>
            </ExternalLink>
          </div>
          <ExternalLink href="https://github.com/llanesluis" showIcon>
            <GitHub />
          </ExternalLink>
        </div>

        <span className="text-muted-foreground text-sm">
          This project is{" "}
          <ExternalLink href="https://github.com/llanesluis/themux" showIcon>
            opensource
          </ExternalLink>
          {", "}
          heavily inspired by{" "}
          <ExternalLink
            href={"https://ui.shadcn.com/"}
            className="font-semibold"
            showIcon
          >
            shadcn/ui
          </ExternalLink>
        </span>
      </div>
    </footer>
  );
}
