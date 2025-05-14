import { Metadata } from "next";

import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { ContainerWrapper, SectionWrapper } from "@/components/wrappers";

export const metadata: Metadata = {
  title: "Fonts",
};

export default function FontsPage() {
  return (
    <>
      <ContainerWrapper className="@container" withCane>
        <SectionWrapper>
          <PageHeader>
            <PageHeaderHeading>Fonts page</PageHeaderHeading>
            <PageHeaderDescription>
              This will be inspired on Google Fonts.
            </PageHeaderDescription>
          </PageHeader>
        </SectionWrapper>
      </ContainerWrapper>

      <Separator />

      <ContainerWrapper withCane>
        <SectionWrapper>
          <p className="text-6xl font-bold">this is a 6xl text</p>
          <p className="text-5xl font-bold">this is a 5xl text</p>
          <p className="text-4xl font-bold">this is a 4xl text</p>
          <p className="text-3xl font-bold">this is a 3xl text</p>
          <p className="text-2xl font-semibold">this is a semibold 2xl text</p>
          <p className="text-xl font-semibold">this is a semibold xl text</p>
          <p className="text-lg">this is lg text</p>
          <p className="text-md">this is a md text</p>
          <p className="text-sm">this is a sm text</p>
          <p className="text-xs">this is a xs text</p>
        </SectionWrapper>
      </ContainerWrapper>

      <Separator />

      <ContainerWrapper withCane>
        <SectionWrapper>
          <p className="font-sans">this is a regular sans font text</p>
          <p className="font-sans font-semibold">
            this is a semibold sans font text
          </p>
          <p className="font-sans font-bold">this is a bold sans font text</p>
        </SectionWrapper>
      </ContainerWrapper>

      <Separator />

      <ContainerWrapper withCane>
        <SectionWrapper>
          <p className="font-mono">this is a regular mono font text</p>
          <p className="font-mono font-semibold">
            this is a semibold mono font text
          </p>
          <p className="font-mono font-bold">this is a bold mono font text</p>
        </SectionWrapper>
      </ContainerWrapper>
    </>
  );
}
