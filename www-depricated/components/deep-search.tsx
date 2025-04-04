import { Search, CheckCircle, Maximize2, Type } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="max-w-5xl mx-auto w-full border border-border rounded-lg shadow-sm my-8">
        <div className="flex">
          {/* Left sidebar */}
          <div className="w-64 border-r border-border p-4">
            <div className="flex items-center gap-2 mb-6">
              <Search className="w-5 h-5 text-foreground-muted" />
              <div>
                <div className="font-medium text-foreground">DeepSearch</div>
                <div className="text-sm text-muted-foreground">65Sources</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Thinking</span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Exploring anime sourcing</span>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-foreground mt-0.5" fill="currentColor" fillOpacity={0.1} />
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
                <ul className="list-disc pl-6 space-y-4">
                  <li>
                    From this search, it's working, and manage the mapping between Anilist and Gogoanime IDs properly.
                  </li>
                  <li>
                    To integrate anime streaming into your website, you can follow these steps: fetch anime metadata
                    using Anilist API, get streaming links from Gogoanime or StreamSB, and embed the stream in an iframe
                    or video player on your Next.js site.
                  </li>
                  <li>
                    There's a lot here, and I'm curious about how to make this process smooth for them. Let's break it
                    down into clear steps for their Next.js site.
                  </li>
                </ul>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium mb-3">Planning integration steps</h2>
                <ul className="list-disc pl-6 space-y-4">
                  <li>
                    I'm outlining the process for their Next.js site, starting with fetching anime metadata. Let's use
                    Anilist API for that, as it has detailed info like titles and episodes.
                  </li>
                  <li>
                    Next, I'll focus on getting streaming links, maybe using Gogoanime API. This should help them embed
                    videos smoothly on their site.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-muted-foreground" />
            <Type className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <div className="flex">
              <div className="w-5 h-5 bg-foreground/80 rounded-full border-2 border-background"></div>
              <div className="w-5 h-5 bg-foreground/60 rounded-full border-2 border-background -ml-2"></div>
            </div>
            <span>65 web pages</span>
          </div>
        </div>
      </div>
    </div>
  )
}

