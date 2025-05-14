"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, FileText, ShieldCheck } from "lucide-react";

export function CardsDonationForm() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Make a donation</CardTitle>
        <CardDescription>
          Support our mission with a one-time or recurring donation
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="h-12">
            $10
          </Button>
          <Button variant="outline" className="h-12">
            $25
          </Button>
          <Button variant="outline" className="h-12">
            $50
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs font-semibold uppercase">
            <span className="bg-card text-muted-foreground px-2 py-2">
              Or enter custom amount
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Donation Amount</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                $
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="anonymous" />
            <Label htmlFor="anonymous" className="text-sm font-normal">
              Make this donation anonymous
            </Label>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button className="w-full" variant="default">
          <CreditCard className="mr-2 h-4 w-4" /> Proceed to payment
        </Button>
        <div className="text-muted-foreground flex w-full items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure payment</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="ml-2 h-4 w-4" />
            <span>Tax deductible</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
