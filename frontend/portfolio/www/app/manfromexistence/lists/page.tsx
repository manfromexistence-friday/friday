import * as React from "react";
import IOSDOCk from '@/components/dock';

export default function Home() {
    return (
        <div className="container flex h-screen flex-col items-center justify-center space-y-8 pb-[75px]">
            <IOSDOCk />
            <span className="text-3xl font-bold md:text-4xl lg:text-5xl xl:text-6xl">Lists are coming...</span>
        </div>
    );
}