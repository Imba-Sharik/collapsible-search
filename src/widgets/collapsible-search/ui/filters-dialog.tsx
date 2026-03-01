"use client"

import { useCallback, type ReactNode } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import { Dialog } from "radix-ui"
import { useSearchBar } from "../model/search-bar-context"

interface FiltersDialogProps {
  /** The dialog content — your advanced filter controls */
  children: ReactNode
  /** Number of active advanced filters — drives the badge */
  filterCount?: number
  onReset?: () => void
  triggerLabel?: string
  title?: string
  resetLabel?: string
  applyLabel?: string
}

export function FiltersDialog({
  children,
  filterCount = 0,
  onReset,
  triggerLabel = "Filters",
  title = "Filters",
  resetLabel = "Reset all",
  applyLabel = "Apply",
}: FiltersDialogProps) {
  const { reportDialogFilters } = useSearchBar()

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) reportDialogFilters(filterCount > 0)
    },
    [filterCount, reportDialogFilters],
  )

  return (
    <Dialog.Root onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          className={`relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-border px-4 shadow-sm transition-colors hover:bg-muted ${
            filterCount > 0 ? "border-2 border-foreground/80" : ""
          }`}
        >
          <SlidersHorizontal className="size-4" />
          <span className="text-sm font-medium">{triggerLabel}</span>
          {filterCount > 0 && (
            <span className="absolute -right-0.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background ring-[3px] ring-background">
              {filterCount}
            </span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-border bg-background shadow-lg focus:outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title className="text-base font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-muted">
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable content */}
          <div className="-mr-1 flex-1 space-y-5 overflow-y-auto px-6 py-4 pr-5">
            {children}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
            <button
              className="text-sm text-muted-foreground underline-offset-2 hover:underline disabled:opacity-40"
              onClick={onReset}
              disabled={filterCount === 0}
            >
              {resetLabel}
            </button>
            <Dialog.Close asChild>
              <button className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                {applyLabel}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
