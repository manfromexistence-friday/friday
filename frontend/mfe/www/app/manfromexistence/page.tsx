"use client"
import * as React from "react";
import { cn } from '@/lib/utils';
import { Separator } from "@/components/ui/separator"
import Link from 'next/link';
import type { SVGProps } from "react";
import { BigProjects, ProductionGradeProjects, SocialMedias } from "@/components/blog-card-section";
import { Briefcase, CircleSlash2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import IOSDOCk from '@/components/dock';
import { SiteFooter } from "@/components/site-footer";
import PixelatedText from "@/components/pixel"

export default function Home() {

  const Icon = ({ className, ...rest }: any) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        width={24}
        height={24}
        strokeWidth="1"
        stroke="currentColor"
        {...rest}
        className={cn('absolute z-[100000]  size-6', className)}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
      </svg>
    );
  };

  return (
    <div className="container flex max-w-screen-xl flex-col items-center space-y-8 pb-[75px]">

      <IOSDOCk />
      <div className="mt-2 w-full space-y-8">
        {/* <PixelatedText fontSize={45} pixelSize={3} position="left" className="py-2">
          Developing Solutions for Problems with <PixelatedText.Rainbow>Curiosity</PixelatedText.Rainbow> and <PixelatedText.Rainbow>Thoughts</PixelatedText.Rainbow>
        </PixelatedText> */}
        <PixelatedText fontSize={65} pixelSize={3} position="left" className="py-2">
        Crafting Experiences with <PixelatedText.Rainbow>Pixels</PixelatedText.Rainbow> and <PixelatedText.Rainbow>Logic</PixelatedText.Rainbow>
        </PixelatedText>
        {/* <span className="text-3xl font-bold md:text-4xl lg:text-5xl xl:text-6xl">Developing Solutions for Problems with Curiosity and Thoughts</span> */}
        <div className="flex w-full flex-col justify-between space-y-4 text-muted-foreground md:flex-row md:space-y-0">
          <div className="flex flex-col space-y-2 md:max-h-[200px] md:w-3/5">
            <span>Delusions? I turn them into reality. Trying to solve as many problems as possible.</span>
            <div className="flex h-full flex-col space-y-2 md:justify-end">
              <div className="flex flex-col">
                <span>Now</span>
                <div className="flex items-center text-foreground">
                  <CircleSlash2 className="mr-2 size-4" /> Jobless, Working on my own projects.
                </div>
              </div>
              <div className="flex flex-col">
                <span>Previously</span>
                <div className="flex items-center text-foreground">
                  <Briefcase className="mr-2 size-4" /> Freelancer at Fiverr & Upwork.
                </div>
              </div>
            </div>
          </div>
          <div className='w-full md:max-w-[400px]'>
            <div className="relative min-h-[150px] border border-dashed">
              <Icon className="-left-3 -top-3" />
              <Icon className="-right-3 -top-3" />
              <Icon className="-bottom-3 -left-3" />
              <Icon className="-bottom-3 -right-3" />
              <div className={cn('flex flex-col p-4')}>
                <div className='flex w-full items-center justify-center space-x-4 rounded-md p-2 hover:bg-primary-foreground hover:text-primary md:justify-evenly'>
                  <Image width={50} height={50} src='/MANFROMEXISTENCE.jpg' alt='manfromexistnece' className='rounded-md' />
                  <div className='flex flex-col'>
                    <span className='text-foreground'>manfromexistence</span>
                    <span>Currently Does Exists</span>
                  </div>
                  <div className='flex size-10 items-center justify-center rounded-full border p-1'>
                    ❤
                  </div>
                </div>
                <Separator className="my-4" />
                <div className='flex items-center justify-center space-x-2'>
                  <Link href={"https://www.youtube.com/@manfromexistence"} className='flex size-12 items-center justify-center rounded-full bg-primary-foreground text-primary'>
                    <YouTube />
                  </Link>
                  <Link href={"https://x.com/manfrexistence"} className='flex size-12 items-center justify-center rounded-full bg-primary-foreground text-primary'>
                    <XformerlyTwitter className="invert dark:invert-0" />
                  </Link>
                  <Link href={"https://github.com/manfromexistence"} className='flex size-12 items-center justify-center rounded-full bg-primary-foreground text-primary'>
                    <Github className="invert dark:invert-0" />
                  </Link>
                  <Link href={"https://www.linkedin.com/in/man-from-existence-a50180314/"} className='flex size-12 items-center justify-center rounded-full bg-primary-foreground text-primary'>
                    <LinkedIn />
                  </Link>
                  <Link href={"https://www.threads.net/@manfromexistence?xmt=AQGzX0O_Vpo7BfxG054NKG79SDenEBx2ZFmcE11qaGLN5uw"} className='flex size-12 items-center justify-center rounded-full bg-primary-foreground text-primary'>
                    <Threads className="invert dark:invert-0" />
                  </Link>
                  <Link target="_blank" href={"mailto:ajju40959@gmail.com"} className='flex size-12 items-center justify-center rounded-full bg-primary-foreground text-primary'>
                    <Gmail />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex w-full flex-col gap-8 md:flex-row md:gap-4'>
          <div className='w-full lg:w-[30%]'>
            <div className="relative flex min-h-full items-center justify-center border border-dashed">
              <Icon className="-left-3 -top-3" />
              <Icon className="-right-3 -top-3" />
              <Icon className="-bottom-3 -left-3" />
              <Icon className="-bottom-3 -right-3" />
              <div className={cn('flex flex-col space-y-4 p-4')}>
                <span className='font-bold text-muted-foreground'>DESIGN, BUILD, INSPIRE.</span>
                <span className='text-muted-foreground'>Branding, design, writing, product creation, development – I wear many hats, fueled by an insatiable passion for innovation. Think of me as your multi-faceted partner, bridging the gap between dream concepts and polished realities.</span>
                <Button variant={'secondary'}>Let&apos;s not work togather, will work later😁</Button>
              </div>
            </div>
          </div>
          <div className='w-full lg:w-[70%]'>
            <div className="relative min-h-full border border-dashed">
              <Icon className="-left-3 -top-3" />
              <Icon className="-right-3 -top-3" />
              <Icon className="-bottom-3 -left-3" />
              <Icon className="-bottom-3 -right-3" />
              <div className={cn('xs:grid-cols-1 grid min-h-full md:grid-cols-3')}>
                <div className='relative flex w-full flex-col items-center justify-center border border-l-0 border-t-0 border-dashed p-8 hover:bg-primary-foreground hover:text-primary'>
                  <Icon className="-bottom-3 -right-3" />
                  <span className='text-7xl'>6+</span>
                  <span className='text-muted-foreground'>Products</span>
                </div>
                <div className='relative flex w-full flex-col items-center justify-center border border-l-0 border-t-0 border-dashed p-8 hover:bg-primary-foreground hover:text-primary'>
                  <Icon className="-bottom-3 -right-3" />
                  <span className='text-7xl'>2+</span>
                  <span className='text-muted-foreground'>Clients</span>
                </div>
                <div className='relative flex w-full flex-col items-center justify-center border border-x-0 border-t-0 border-dashed p-8 hover:bg-primary-foreground hover:text-primary'>
                  <span className='text-7xl'>1+</span>
                  <span className='text-muted-foreground'>Facilitator</span>
                </div>
                <div className='relative flex w-full flex-col items-center justify-center border border-l-0 border-t-0 border-dashed p-8 hover:bg-primary-foreground hover:text-primary md:border-b-0'>
                  <span className='text-7xl'>1+</span>
                  <span className='text-muted-foreground'>Talks</span>
                </div>
                <div className='relative flex w-full flex-col items-center justify-center border border-l-0 border-t-0 border-dashed p-8 hover:bg-primary-foreground hover:text-primary md:border-b-0'>
                  <span className='text-7xl'>0</span>
                  <span className='text-muted-foreground'>Books</span>
                </div>
                <div className='relative flex w-full flex-col items-center justify-center border border-y-0 border-l-0 border-dashed p-8 hover:bg-primary-foreground hover:text-primary'>
                  <span className='text-7xl'>∞</span>
                  <span className='text-muted-foreground'>Passion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <BigProjects />
      <ProductionGradeProjects /> */}
      <SocialMedias />
      <SiteFooter />
    </div>
  );
}

const XformerlyTwitter = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 1200 1227" {...props}><path fill="#fff" d="M714.163 519.284 1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026ZM569.165 687.828l-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026Z" /></svg>;
const Github = (props: SVGProps<SVGSVGElement>) => <svg viewBox="0 0 256 250" width="1em" height="1em" fill="#fff" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" {...props}><path d="M128.001 0C57.317 0 0 57.307 0 128.001c0 56.554 36.676 104.535 87.535 121.46 6.397 1.185 8.746-2.777 8.746-6.158 0-3.052-.12-13.135-.174-23.83-35.61 7.742-43.124-15.103-43.124-15.103-5.823-14.795-14.213-18.73-14.213-18.73-11.613-7.944.876-7.78.876-7.78 12.853.902 19.621 13.19 19.621 13.19 11.417 19.568 29.945 13.911 37.249 10.64 1.149-8.272 4.466-13.92 8.127-17.116-28.431-3.236-58.318-14.212-58.318-63.258 0-13.975 5-25.394 13.188-34.358-1.329-3.224-5.71-16.242 1.24-33.874 0 0 10.749-3.44 35.21 13.121 10.21-2.836 21.16-4.258 32.038-4.307 10.878.049 21.837 1.47 32.066 4.307 24.431-16.56 35.165-13.12 35.165-13.12 6.967 17.63 2.584 30.65 1.255 33.873 8.207 8.964 13.173 20.383 13.173 34.358 0 49.163-29.944 59.988-58.447 63.157 4.591 3.972 8.682 11.762 8.682 23.704 0 17.126-.148 30.91-.148 35.126 0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128.002 256 57.307 198.691 0 128.001 0Zm-80.06 182.34c-.282.636-1.283.827-2.194.39-.929-.417-1.45-1.284-1.15-1.922.276-.655 1.279-.838 2.205-.399.93.418 1.46 1.293 1.139 1.931Zm6.296 5.618c-.61.566-1.804.303-2.614-.591-.837-.892-.994-2.086-.375-2.66.63-.566 1.787-.301 2.626.591.838.903 1 2.088.363 2.66Zm4.32 7.188c-.785.545-2.067.034-2.86-1.104-.784-1.138-.784-2.503.017-3.05.795-.547 2.058-.055 2.861 1.075.782 1.157.782 2.522-.019 3.08Zm7.304 8.325c-.701.774-2.196.566-3.29-.49-1.119-1.032-1.43-2.496-.726-3.27.71-.776 2.213-.558 3.315.49 1.11 1.03 1.45 2.505.701 3.27Zm9.442 2.81c-.31 1.003-1.75 1.459-3.199 1.033-1.448-.439-2.395-1.613-2.103-2.626.301-1.01 1.747-1.484 3.207-1.028 1.446.436 2.396 1.602 2.095 2.622Zm10.744 1.193c.036 1.055-1.193 1.93-2.715 1.95-1.53.034-2.769-.82-2.786-1.86 0-1.065 1.202-1.932 2.733-1.958 1.522-.03 2.768.818 2.768 1.868Zm10.555-.405c.182 1.03-.875 2.088-2.387 2.37-1.485.271-2.861-.365-3.05-1.386-.184-1.056.893-2.114 2.376-2.387 1.514-.263 2.868.356 3.061 1.403Z" /></svg>;
const YouTube = (props: SVGProps<SVGSVGElement>) => <svg viewBox="0 0 256 180" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" {...props}><path d="M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134Z" fill="red" /><path fill="#FFF" d="m102.421 128.06 66.328-38.418-66.328-38.418z" /></svg>;
const Gmail = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 49.4 512 399.42" width="1em" height="1em" {...props}><g fill="none" fillRule="evenodd"><g fillRule="nonzero"><path fill="#4285f4" d="M34.91 448.818h81.454V251L0 163.727V413.91c0 19.287 15.622 34.91 34.91 34.91z" /><path fill="#34a853" d="M395.636 448.818h81.455c19.287 0 34.909-15.622 34.909-34.909V163.727L395.636 251z" /><path fill="#fbbc04" d="M395.636 99.727V251L512 163.727v-46.545c0-43.142-49.25-67.782-83.782-41.891z" /></g><path fill="#ea4335" d="M116.364 251V99.727L256 204.455 395.636 99.727V251L256 355.727z" /><path fill="#c5221f" fillRule="nonzero" d="M0 117.182v46.545L116.364 251V99.727L83.782 75.291C49.25 49.4 0 74.04 0 117.18z" /></g></svg>;
const Threads = (props: SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" aria-label="Threads" viewBox="0 0 192 192" width="1em" height="1em" {...props}><path fill="#fff" d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.194 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.067c.224 28.617 6.882 51.447 19.788 67.854C47.292 182.358 68.882 191.806 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553ZM98.44 129.507c-10.44.588-21.286-4.098-21.82-14.135-.397-7.442 5.296-15.746 22.461-16.735 1.966-.114 3.895-.169 5.79-.169 6.235 0 12.068.606 17.371 1.765-1.978 24.702-13.58 28.713-23.802 29.274Z" className="x19hqcy" /></svg>;
const LinkedIn = (props: SVGProps<SVGSVGElement>) => <svg width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 256" {...props}><path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453" fill="#0A66C2" /></svg>;
