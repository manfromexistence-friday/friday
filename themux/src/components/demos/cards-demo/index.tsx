import { CardsActivityGoal } from "@/components/demos/cards-demo/activity-goal";
import { CardsCalendar } from "@/components/demos/cards-demo/calendar";
import { CardsDonationForm } from "@/components/demos/cards-demo/card-donation";
import { CardsChat } from "@/components/demos/cards-demo/chat";
import { CardsCookieSettings } from "@/components/demos/cards-demo/cookie-settings";
import { CardsCreateAccount } from "@/components/demos/cards-demo/create-account";
import { CardsDataTable } from "@/components/demos/cards-demo/data-table";
import { CardsMetric } from "@/components/demos/cards-demo/metric";
import { CardsPaymentMethod } from "@/components/demos/cards-demo/payment-method";
import { CardsReportIssue } from "@/components/demos/cards-demo/report-issue";
import { CardsShare } from "@/components/demos/cards-demo/share";
import { CardsStats } from "@/components/demos/cards-demo/stats";
import { CardsTeamMembers } from "@/components/demos/cards-demo/team-members";

export function CardsDemo() {
  return (
    <div className="@container">
      <div className="@3xl:grid-col-2 grid @3xl:gap-4 @5xl:grid-cols-10 @7xl:grid-cols-11 @7xl:gap-4">
        <div className="space-y-4 @5xl:col-span-4 @7xl:col-span-6 @7xl:space-y-4">
          <CardsStats />
          <div className="grid gap-1 @lg:grid-cols-[260px_1fr] @3xl:hidden">
            <CardsCalendar />
            <div className="pt-3 @lg:pt-0 @lg:pl-2 @7xl:pl-4">
              <CardsActivityGoal />
            </div>
            <div className="pt-3 @lg:col-span-2 @7xl:pt-4">
              <CardsMetric />
            </div>
          </div>
          <div className="grid gap-4 @3xl:grid-cols-2 @5xl:grid-cols-1 @7xl:grid-cols-2">
            <div className="space-y-4 @7xl:space-y-4">
              <CardsTeamMembers />
              <CardsCookieSettings />
              <CardsPaymentMethod />
            </div>
            <div className="space-y-4 @7xl:space-y-4">
              <CardsChat />
              <CardsCreateAccount />

              <div className="hidden @3xl:grid @5xl:hidden">
                <CardsDonationForm />
              </div>
              <div className="hidden @7xl:block">
                <CardsReportIssue />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4 @5xl:col-span-6 @7xl:col-span-5 @7xl:space-y-4">
          <div className="hidden gap-1 @lg:grid-cols-[260px_1fr] @3xl:grid">
            <CardsCalendar />
            <div className="pt-3 @lg:pt-0 @lg:pl-2 @7xl:pl-3">
              <CardsActivityGoal />
            </div>
            <div className="pt-3 @lg:col-span-2 @7xl:pt-3">
              <CardsMetric />
            </div>
          </div>
          <div className="hidden @3xl:block">
            <CardsDataTable />
          </div>
          <CardsShare />
          <div className="@7xl:hidden">
            <CardsReportIssue />
          </div>
        </div>
      </div>
    </div>
  );
}
