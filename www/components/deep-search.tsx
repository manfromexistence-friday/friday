import { Search, CheckCircle, Maximize2, Type } from "lucide-react"

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen">
      <div className="border-border mx-auto my-8 w-full max-w-5xl rounded-lg border shadow-sm">
        <div className="flex">
          {/* Left sidebar */}
          <div className="border-border w-64 border-r p-4">
            <div className="mb-6 flex items-center gap-2">
              <Search className="text-foreground-muted size-5" />
              <div>
                <div className="text-foreground font-medium">DeepSearch</div>
                <div className="text-muted-foreground text-sm">65Sources</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="text-muted-foreground mt-0.5 size-5" />
                <span className="text-muted-foreground">Thinking</span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="text-muted-foreground mt-0.5 size-5" />
                <span className="text-muted-foreground">Exploring anime sourcing</span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="text-foreground mt-0.5 size-5" fill="currentColor" fillOpacity={0.1} />
                <span className="text-foreground font-medium">Planning integration steps</span>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div>
                <p className="mb-2">
                  Anilist API and embed streams with Gogoanime links. This could work well for their site. (
                  <a href="#" className="text-primary underline">
                    Anilist
                  </a>
                  )
                </p>
                <ul className="list-disc space-y-4 pl-6">
                  <li>
                    From this search, it&apos;s working, and manage the mapping between Anilist and Gogoanime IDs properly.
                  </li>
                  <li>
                    To integrate anime streaming into your website, you can follow these steps: fetch anime metadata
                    using Anilist API, get streaming links from Gogoanime or StreamSB, and embed the stream in an iframe
                    or video player on your Next.js site.
                  </li>
                  <li>
                    There&apos;s a lot here, and I&apos;m curious about how to make this process smooth for them. Let&apos;s break it
                    down into clear steps for their Next.js site.
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h2 className="mb-3 text-lg font-medium">Planning integration steps</h2>
                <ul className="list-disc space-y-4 pl-6">
                  <li>
                    I&apos;m outlining the process for their Next.js site, starting with fetching anime metadata. Let&apos;s use
                    Anilist API for that, as it has detailed info like titles and episodes.
                  </li>
                  <li>
                    Next, I&apos;ll focus on getting streaming links, maybe using Gogoanime API. This should help them embed
                    videos smoothly on their site.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-border flex items-center justify-between border-t p-3">
          <div className="flex items-center gap-2">
            <Maximize2 className="text-muted-foreground size-4" />
            <Type className="text-muted-foreground size-4" />
          </div>

          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <div className="flex">
              <div className="bg-foreground/80 border-background size-5 rounded-full border-2"></div>
              <div className="bg-foreground/60 border-background -ml-2 size-5 rounded-full border-2"></div>
            </div>
            <span>65 web pages</span>
          </div>
        </div>
      </div>
    </div>
  )
}

