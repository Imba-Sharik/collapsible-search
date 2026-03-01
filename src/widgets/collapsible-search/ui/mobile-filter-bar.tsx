"use client"

import { Children, isValidElement, useState, type ReactNode } from "react"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Dialog } from "radix-ui"
import type { FilterBarItemProps } from "./filter-bar"

function isFilterBarItem(
  child: unknown,
): child is React.ReactElement<FilterBarItemProps> {
  return (
    isValidElement(child) &&
    (child.type as { displayName?: string }).displayName === "FilterBar.Item"
  )
}

interface MobileFilterBarProps {
  /** Same FilterBar.Item children as FilterBar — shared between mobile and desktop */
  children: ReactNode
  onSearch?: () => void
  searchLabel?: string
  clearLabel?: string
  /** Advanced filters content rendered in a bottom sheet */
  advancedFilters?: ReactNode
  /** Number of active advanced filters — drives badge + button visibility */
  advancedFiltersCount?: number
  advancedFiltersTitle?: string
  advancedFiltersResetLabel?: string
  advancedFiltersApplyLabel?: string
  onAdvancedFiltersReset?: () => void
}

export function MobileFilterBar({
  children,
  onSearch,
  searchLabel = "Search",
  clearLabel = "Clear all",
  advancedFilters,
  advancedFiltersCount = 0,
  advancedFiltersTitle = "Filters",
  advancedFiltersResetLabel = "Reset all",
  advancedFiltersApplyLabel = "Apply",
  onAdvancedFiltersReset,
}: MobileFilterBarProps) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(0)

  const items = Children.toArray(children).filter(isFilterBarItem)
  const hasValues = items.some((item) => item.props.value !== null)

  // Advanced button visible when main filters are set OR advanced filters are active
  const showAdvancedButton = !!advancedFilters && (hasValues || advancedFiltersCount > 0)

  const handleClear = () => {
    items.forEach((item) => item.props.onClear?.())
    setExpanded(0)
  }

  const handleClose = () => {
    setOpen(false)
    setExpanded(0)
  }

  const primary = items[0]
  const rest = items.slice(1)

  return (
    // Dialog.Root wraps everything so the bottom-sheet Trigger and Portal are connected
    <Dialog.Root>
      <div className="w-full md:hidden">
        {/* Trigger row: main filter pill + optional advanced filters button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-full border border-border bg-background px-4 py-3 shadow-sm"
          >
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1 text-left">
              <p
                className={`truncate text-sm font-medium ${
                  primary?.props.value ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {primary?.props.value ?? primary?.props.label ?? ""}
              </p>
              {rest.length > 0 && (
                <p className="truncate text-xs text-muted-foreground">
                  {rest.map((item, i) => (
                    <span key={i}>
                      {i > 0 && " · "}
                      <span className={item.props.value ? "text-foreground" : ""}>
                        {item.props.value ?? item.props.placeholder}
                      </span>
                    </span>
                  ))}
                </p>
              )}
            </div>
          </button>

          {/* Advanced filters button — same pattern as anirum's Drawer trigger */}
          {showAdvancedButton && (
            <Dialog.Trigger asChild>
              <button
                className={`relative flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:bg-muted ${
                  advancedFiltersCount > 0 ? "border-2 border-foreground/80" : ""
                }`}
              >
                <SlidersHorizontal className="size-4 text-foreground" />
                {advancedFiltersCount > 0 && (
                  <span className="absolute -right-0.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background ring-[3px] ring-background">
                    {advancedFiltersCount}
                  </span>
                )}
              </button>
            </Dialog.Trigger>
          )}
        </div>

        {/* Main filters — full-screen accordion dialog */}
        {open && (
          <div className="fixed inset-0 z-50 flex flex-col bg-background">
            <div className="flex h-14 items-center justify-end px-4">
              <button
                onClick={handleClose}
                className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {items.map((item, index) => {
                const { label, value, placeholder, onClear, children: content } =
                  item.props
                const isExpanded = expanded === index
                const close = () =>
                  setExpanded(index + 1 < items.length ? index + 1 : null)

                if (!isExpanded) {
                  return (
                    <button
                      key={index}
                      className={`${index > 0 ? "mt-3" : ""} flex w-full items-center justify-between rounded-2xl border border-border px-5 py-4 shadow-sm`}
                      onClick={() => setExpanded(index)}
                    >
                      <span className="text-base text-muted-foreground">
                        {label}
                      </span>
                      <span
                        className={`text-base ${
                          value
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {value ?? placeholder}
                      </span>
                    </button>
                  )
                }

                return (
                  <section
                    key={index}
                    className={`${index > 0 ? "mt-3" : ""} rounded-3xl border border-border p-4 shadow-sm`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-2xl font-semibold">{label}</h2>
                      {value !== null && onClear && (
                        <button
                          className="text-xs text-muted-foreground hover:text-foreground"
                          onClick={onClear}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {content(close)}
                  </section>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <button
                className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
                onClick={handleClear}
                disabled={!hasValues}
              >
                {clearLabel}
              </button>
              <button
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  handleClose()
                  onSearch?.()
                }}
              >
                <Search className="size-4" />
                {searchLabel}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced filters — bottom sheet (slides up from bottom) */}
      {advancedFilters && (
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border-t border-border bg-background shadow-lg focus:outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex shrink-0 items-center justify-between px-4 py-3">
              <Dialog.Title className="text-base font-semibold">
                {advancedFiltersTitle}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="flex size-7 items-center justify-center rounded-full transition-colors hover:bg-muted">
                  <X className="size-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-4 py-2">
              {advancedFilters}
            </div>

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <button
                className="text-sm text-muted-foreground underline-offset-2 hover:underline disabled:opacity-40"
                onClick={onAdvancedFiltersReset}
                disabled={advancedFiltersCount === 0}
              >
                {advancedFiltersResetLabel}
              </button>
              <Dialog.Close asChild>
                <button className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  {advancedFiltersApplyLabel}
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  )
}
