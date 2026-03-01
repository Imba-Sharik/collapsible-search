"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { CompactSearchBar } from "./compact-search-bar"
import { SearchBarContext } from "../model/search-bar-context"

interface CollapsibleHeaderProps {
  /** The expanded search bar (e.g. <ExampleSearch />) */
  search: ReactNode
  /** Shown next to the compact pill when hasActiveFilters or hasDialogFilters (e.g. <ExampleFiltersDialog />) */
  filtersSlot?: ReactNode
  /** Logo text or element */
  logo?: ReactNode
  /** Navigation links */
  nav?: ReactNode
}

/**
 * Example header that collapses on scroll and shows a compact pill.
 * Copy and adapt to your project's layout.
 */
export function CollapsibleHeader({
  search,
  filtersSlot,
  logo = "Logo",
  nav,
}: CollapsibleHeaderProps) {
  const [isCollapsed, setCollapsed] = useState(false)
  const [labels, setLabels] = useState<string[]>([])
  const [expandIndex, setExpandIndex] = useState<number | null>(null)
  const [hasActiveFilters, setHasActiveFilters] = useState(false)
  const [hasDialogFilters, setHasDialogFilters] = useState(false)

  const labelsRef = useRef(labels)
  const dropdownOpenRef = useRef(false)
  const dialogFiltersRef = useRef(false)

  const reportDropdownOpen = useCallback((open: boolean) => {
    dropdownOpenRef.current = open
    if (!open) {
      if (window.scrollY > 10 && labelsRef.current.length > 0) {
        setCollapsed(true)
      }
    }
  }, [])

  const reportDialogFilters = useCallback((hasFilters: boolean) => {
    dialogFiltersRef.current = hasFilters
    setHasDialogFilters(hasFilters)
    if (hasFilters && labelsRef.current.length > 0) {
      setCollapsed(true)
    } else if (!hasFilters) {
      if (window.scrollY <= 10) {
        setCollapsed(false)
      }
    }
  }, [])

  const collapse = useCallback((newLabels: string[], hasFilters: boolean) => {
    labelsRef.current = newLabels
    setLabels(newLabels)
    setExpandIndex(null)
    setCollapsed(true)
    setHasActiveFilters(hasFilters)
  }, [])

  const expand = useCallback((index?: number) => {
    setExpandIndex(index ?? null)
    setCollapsed(false)
    // Reset only ref (scroll-pinning), keep state so
    // filtersSlot stays visible in compact bar on next scroll down
    dialogFiltersRef.current = false
  }, [])

  const updateLabels = useCallback((newLabels: string[]) => {
    labelsRef.current = newLabels
    setLabels(newLabels)
  }, [])

  // Scroll: collapse on scroll down, expand at top
  useEffect(() => {
    const onScroll = () => {
      if (dropdownOpenRef.current) return
      if (window.scrollY > 10) {
        if (labelsRef.current.length > 0) setCollapsed(true)
      } else if (!dialogFiltersRef.current) {
        setCollapsed(false)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <SearchBarContext.Provider
      value={{
        isCollapsed,
        expandIndex,
        hasActiveFilters,
        hasDialogFilters,
        collapse,
        expand,
        updateLabels,
        reportDropdownOpen,
        reportDialogFilters,
      }}
    >
      <header className="fixed top-0 right-0 left-0 z-50 bg-background">
        {/* Top row */}
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="shrink-0 text-xl font-semibold">{logo}</div>

          {/* Center: nav or compact pill */}
          <div className="relative flex flex-1 items-center justify-center">
            <nav
              className={`hidden md:flex items-center gap-6 transition-opacity duration-300 ${
                isCollapsed
                  ? "pointer-events-none opacity-0"
                  : "opacity-100"
              }`}
            >
              {nav}
            </nav>

            <div
              className={`absolute hidden md:flex items-center gap-2 transition-all duration-300 ease-out ${
                isCollapsed
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none translate-y-6 scale-[1.4] opacity-0"
              }`}
            >
              <CompactSearchBar labels={labels} onExpand={expand} />
              {(hasActiveFilters || hasDialogFilters) && filtersSlot}
            </div>
          </div>

          <div className="shrink-0" />
        </div>

        {/* Bottom row: expanded search */}
        <div
          className={`grid transition-[grid-template-rows] duration-300 ${
            isCollapsed ? "grid-rows-[1fr] md:grid-rows-[0fr]" : "grid-rows-[1fr]"
          }`}
        >
          <div className={isCollapsed ? "md:overflow-hidden" : ""}>
            <div className="mx-auto flex max-w-5xl justify-center px-4 py-4">
              {search}
            </div>
          </div>
        </div>

        <div className="border-b border-border" />
      </header>
    </SearchBarContext.Provider>
  )
}
