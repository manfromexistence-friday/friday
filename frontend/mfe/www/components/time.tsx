"use client"

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type TimeLevel = 'minutes' | 'hours';

const Time = () => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const scrollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [timeLevel, setTimeLevel] = React.useState<TimeLevel>('hours');
    const [showLeftScroll, setShowLeftScroll] = React.useState(false);
    const [showRightScroll, setShowRightScroll] = React.useState(false);

    // Add timer effect to update current time every minute
    React.useEffect(() => {
        // Update immediately to next minute
        const now = new Date();
        const timeToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

        // First timeout to sync with minute changes
        const initialTimeout = setTimeout(() => {
            setCurrentTime(new Date());

            // Then set up interval for subsequent updates
            const interval = setInterval(() => {
                setCurrentTime(new Date());
            }, 60000); // Update every minute

            return () => clearInterval(interval);
        }, timeToNextMinute);

        return () => clearTimeout(initialTimeout);
    }, []);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey) {
                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    setTimeLevel(prev => prev === 'hours' ? 'minutes' : 'minutes');
                } else if (e.key === '-') {
                    e.preventDefault();
                    setTimeLevel(prev => prev === 'minutes' ? 'hours' : 'hours');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const renderTimeMarkers = () => {
        switch (timeLevel) {
            case 'minutes':
                return Array.from({ length: 60 }, (_, i) => (
                    <div
                        key={i}
                        id={`minute-${i}`}
                        className={cn(
                            "relative flex h-full min-w-[20px] flex-col items-center justify-center hover:bg-primary-foreground",
                            currentTime.getMinutes() === i && "bg-primary-foreground",
                            i % 5 === 0 ? "min-w-[40px]" : "min-w-[12px]" // Wider space for numbered minutes
                        )}
                    >
                        {i % 5 === 0 ? (
                            // Numbered minute markers (0, 5, 10, etc.)
                            <span className="text-xs font-medium">
                                {i === 0 ? '0' : i.toString()}
                            </span>
                        ) : (
                            // Small border marks for in-between minutes
                            <div className="h-4 w-px bg-border" />
                        )}
                        {/* <div className="h-[20px] w-[1px] bg-border absolute right-0" /> */}
                    </div>
                ));

            case 'hours':
                return Array.from({ length: 24 }, (_, i) => (
                    <div
                        key={i}
                        id={`hour-${i}`}
                        className={cn(
                            "relative flex h-full min-w-[20px] flex-col items-center justify-center hover:bg-primary-foreground",
                            currentTime.getHours() === i && "bg-primary-foreground",
                            i % 3 === 0 ? "min-w-[40px]" : "min-w-[12px]" // Wider space for numbered hours
                        )}
                    >
                        {i % 3 === 0 ? (
                            // Numbered hour markers (0, 3, 6, etc.)
                            <span className="text-xs font-medium">
                                {i === 0 ? '0' : i.toString()}
                            </span>
                        ) : (
                            // Small border marks for in-between hours
                            <div className="h-4 w-px bg-border" />
                        )}
                    </div>
                ));
        }
    };

    React.useEffect(() => {
        // Center the current time marker on load and when timeLevel changes
        const getCurrentId = () => {
            switch (timeLevel) {
                case 'minutes':
                    return `minute-${currentTime.getMinutes()}`;
                case 'hours':
                    return `hour-${currentTime.getHours()}`;
            }
        };

        const element = document.getElementById(getCurrentId());
        if (element && scrollRef.current) {
            const containerWidth = scrollRef.current.offsetWidth;
            const scrollPosition = element.offsetLeft - containerWidth / 2 + element.offsetWidth / 2;
            scrollRef.current.scrollLeft = scrollPosition;
        }
    }, [timeLevel, currentTime]);

    // Add scroll visibility check
    const checkScrollButtons = React.useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const maxScroll = scrollWidth - clientWidth;
            
            // Add a small threshold (1px) to account for floating point precision
            setShowLeftScroll(scrollLeft > 1);
            setShowRightScroll(maxScroll > 1 && scrollLeft < maxScroll - 1);
        }
    }, []);

    // Updated scroll handler with improved speed and smoother scrolling
    const handleScrollStart = (direction: 'left' | 'right') => {
        let scrollSpeed = 0;
        const maxSpeed = 500; // Increased maximum scroll speed
        const acceleration = 50; // Increased acceleration

        const doScroll = () => {
            if (scrollRef.current) {
                scrollSpeed = Math.min(scrollSpeed + acceleration, maxSpeed);
                const scrollAmount = direction === 'left' ? -scrollSpeed : scrollSpeed;
                
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                
                // Check if we can scroll in the requested direction
                if ((direction === 'left' && scrollLeft <= 0) || 
                    (direction === 'right' && scrollLeft >= scrollWidth - clientWidth)) {
                    handleScrollEnd();
                    return;
                }

                scrollRef.current.scrollBy({
                    left: scrollAmount,
                    behavior: 'auto'
                });

                // Update scroll buttons visibility after scrolling
                checkScrollButtons();
            }
        };

        doScroll();
        scrollIntervalRef.current = setInterval(doScroll, 16);
    };

    const handleScrollEnd = () => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    };

    // Clean up interval on unmount
    React.useEffect(() => {
        return () => {
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
            }
        };
    }, []);

    // Monitor scroll position
    React.useEffect(() => {
        const element = scrollRef.current;
        if (element) {
            checkScrollButtons();
            element.addEventListener('scroll', checkScrollButtons);
            window.addEventListener('resize', checkScrollButtons);

            return () => {
                element.removeEventListener('scroll', checkScrollButtons);
                window.removeEventListener('resize', checkScrollButtons);
            };
        }
    }, [checkScrollButtons]);

    // Make sure to call checkScrollButtons when content changes
    React.useEffect(() => {
        checkScrollButtons();
    }, [timeLevel, checkScrollButtons]);

    return (
        <div className="fixed bottom-0 left-12 right-0 border-t bg-background">
            <div className="relative">
                {showLeftScroll && (
                    <Button
                        onMouseDown={() => handleScrollStart('left')}
                        onMouseUp={handleScrollEnd}
                        onMouseLeave={handleScrollEnd}
                        onTouchStart={() => handleScrollStart('left')}
                        onTouchEnd={handleScrollEnd}
                        className="absolute left-1 top-1/2 z-10 size-6 -translate-y-1/2 rounded-full p-0"
                        size="icon"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                )}
                {showRightScroll && (
                    <Button
                        onMouseDown={() => handleScrollStart('right')}
                        onMouseUp={handleScrollEnd}
                        onMouseLeave={handleScrollEnd}
                        onTouchStart={() => handleScrollStart('right')}
                        onTouchEnd={handleScrollEnd}
                        className="absolute right-1 top-1/2 z-10 size-6 -translate-y-1/2 rounded-full p-0"
                        size="icon"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                )}
                <div
                    className="flex w-full select-none items-center justify-center overflow-x-hidden transition-all duration-200 ease-in-out"
                    ref={scrollRef}
                >
                    <div className="flex h-8 items-center">
                        {renderTimeMarkers()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Time;