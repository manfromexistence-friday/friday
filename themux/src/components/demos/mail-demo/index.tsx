import { BlockViewer } from "@/components/block-viewer";
import { Mail } from "@/components/demos/mail-demo/components/mail";
import { accounts, mails } from "@/components/demos/mail-demo/data";

export function MailPage() {
  return <Mail accounts={accounts} mails={mails} navCollapsedSize={4} />;
}

export function MailDemo() {
  return (
    <BlockViewer name="mail" internalUrl={`/mail`}>
      <MailPage />
    </BlockViewer>
  );
}
