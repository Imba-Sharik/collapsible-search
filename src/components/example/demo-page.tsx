"use client"

import { CollapsibleHeader } from "./collapsible-header"
import { ExampleSearch } from "./example-search"

const NAV_LINKS = (
  <>
    <a
      href="#"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      Explore
    </a>
    <a
      href="#"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      Guides
    </a>
    <a
      href="#"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      About
    </a>
  </>
)

const PLACEHOLDER_ITEMS = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: `Item ${i + 1}`,
  description: "A placeholder card to demonstrate scroll behavior.",
}))

export function DemoPage() {
  return (
    <div className="min-h-screen">
      <CollapsibleHeader
        search={<ExampleSearch />}
        logo="Collapsible Search"
        nav={NAV_LINKS}
      />

      <main className="pt-34">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              Airbnb-style Collapsible Search
            </h1>
            <p className="mt-2 text-muted-foreground">
              Scroll down to see the header collapse into a compact pill.
              Click the pill or scroll back to top to expand.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {PLACEHOLDER_ITEMS.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="mb-3 h-32 rounded-lg bg-muted" />
                <h3 className="font-medium">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
