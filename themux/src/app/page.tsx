import { FrameHighlight } from "@/components/frame-highlight";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { ContainerWrapper, SectionWrapper } from "@/components/wrappers";

export default function Page() {
  return (
    <ContainerWrapper withCane>
      <SectionWrapper className="@container">
        <PageHeader className="grow">
          <PageHeaderHeading>
            shadcn/ui customizer supporting
            <FrameHighlight>Tailwind v4</FrameHighlight>
          </PageHeaderHeading>
          <PageHeaderDescription>
            Generate a theme for your app and copy-paste the css variables.
            Compatible with
            <FrameHighlight className="font-semibold">
              Tailwind v3
            </FrameHighlight>
            and supports <code className="font-mono font-semibold">oklch</code>
            {", "}
            <code className="font-mono font-semibold">hsl</code>
            {", "}
            <code className="font-mono font-semibold">rbg</code>
            {" and "}
            <code className="font-mono font-semibold">hex</code>.
          </PageHeaderDescription>
        </PageHeader>
      </SectionWrapper>
    </ContainerWrapper>
  );
}
