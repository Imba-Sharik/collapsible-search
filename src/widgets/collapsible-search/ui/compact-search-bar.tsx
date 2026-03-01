"use client"

import { Fragment } from "react"
import { Search } from "lucide-react"

interface CompactSearchBarProps {
  labels: string[]
  onExpand: (index?: number) => void
}

export function CompactSearchBar({ labels, onExpand }: CompactSearchBarProps) {
  return (
    <div
      className="flex cursor-pointer items-center rounded-full border border-border shadow-sm transition-shadow hover:shadow-md"
    >
      {labels.map((label, i) => (
        <Fragment key={i}>
          {i > 0 && <div className="h-6 w-px shrink-0 bg-border" />}
          <button
            onClick={() => onExpand(i)}
            className="whitespace-nowrap px-4 py-2 text-sm font-medium cursor-pointer"
          >
            {label}
          </button>
        </Fragment>
      ))}
      <div className="my-1.5 mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Search className="size-4" />
      </div>
    </div>
  )
}
