"use client"

import { Children, isValidElement, useState, type ReactNode } from "react"
import { Search, X } from "lucide-react"
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
}

export function MobileFilterBar({
  children,
  onSearch,
  searchLabel = "Search",
  clearLabel = "Clear all",
}: MobileFilterBarProps) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(0)

  const items = Children.toArray(children).filter(isFilterBarItem)
  const hasValues = items.some((item) => item.props.value !== null)

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
    <div className="w-full md:hidden">
      {/* Trigger pill */}
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-full border border-border bg-background px-4 py-3 shadow-sm"
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

      {/* Full-screen dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          {/* Close button */}
          <div className="flex h-14 items-center justify-end px-4">
            <button
              onClick={handleClose}
              className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Accordion sections */}
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

          {/* Footer */}
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
  )
}
