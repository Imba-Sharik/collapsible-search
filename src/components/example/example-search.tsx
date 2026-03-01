"use client"

import { useCallback, useEffect, useState } from "react"
import {
  FilterBar,
  FiltersDialog,
  MobileFilterBar,
  useSearchBar,
} from "@/components/collapsible-search"

// --- Main filter data ---

const CATEGORIES = ["Technology", "Design", "Marketing", "Business", "Science"]
const LOCATIONS = ["New York", "London", "Tokyo", "Berlin", "Remote"]
const PRICE_RANGES = ["Free", "$1 – $50", "$50 – $100", "$100+"]

// --- Advanced filter data ---

const RATINGS = ["2+", "3+", "4+", "5"]
const SORT_OPTIONS = [
  "Most Popular",
  "Newest",
  "Price: Low to High",
  "Price: High to Low",
]

// --- Shared sub-components ---

function SimpleList({
  items,
  selected,
  onSelect,
}: {
  items: string[]
  selected: string | null
  onSelect: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
            selected === item ? "bg-muted font-medium" : ""
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

// --- Advanced filters content ---
// Generic example: Rating + Sort. Replace with your own controls.

function AdvancedContent({
  rating,
  setRating,
  sort,
  setSort,
}: {
  rating: string | null
  setRating: (v: string | null) => void
  sort: string | null
  setSort: (v: string | null) => void
}) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-sm font-semibold">Minimum Rating</h3>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((r) => (
            <button
              key={r}
              onClick={() => setRating(rating === r ? null : r)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                rating === r
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:bg-muted"
              }`}
            >
              ★ {r}
            </button>
          ))}
        </div>
      </section>

      <div className="border-t border-border" />

      <section>
        <h3 className="mb-3 text-sm font-semibold">Sort by</h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSort(sort === s ? null : s)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                sort === s ? "bg-muted font-medium" : ""
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

// --- ExampleSearch ---
// Renders FilterBar (desktop) + MobileFilterBar (mobile).
// FiltersDialog lives separately in ExampleFiltersDialog — passed as filtersSlot to CollapsibleHeader.

export function ExampleSearch() {
  const [category, setCategory] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [price, setPrice] = useState<string | null>(null)

  const { collapse, updateLabels, expandIndex, reportDropdownOpen } =
    useSearchBar()

  const handleActiveChange = useCallback(
    (a: number | null) => reportDropdownOpen(a !== null),
    [reportDropdownOpen],
  )

  useEffect(() => {
    updateLabels([
      category ?? "Category",
      location ?? "Location",
      price ?? "Price",
    ])
  }, [category, location, price, updateLabels])

  const handleSearch = () => {
    const hasFilters = category !== null || location !== null || price !== null
    collapse(
      [category ?? "Category", location ?? "Location", price ?? "Price"],
      hasFilters,
    )
  }

  // Must be an array (not a Fragment) so React.Children.toArray() can iterate them.
  const filterItems = [
    <FilterBar.Item
      key="category"
      label="Category"
      value={category}
      placeholder="Any category"
      onClear={() => setCategory(null)}
    >
      {(close) => (
        <SimpleList
          items={CATEGORIES}
          selected={category}
          onSelect={(v) => {
            setCategory(v)
            close()
          }}
        />
      )}
    </FilterBar.Item>,

    <FilterBar.Item
      key="location"
      label="Location"
      value={location}
      placeholder="Anywhere"
      onClear={() => setLocation(null)}
      flex={1}
    >
      {(close) => (
        <SimpleList
          items={LOCATIONS}
          selected={location}
          onSelect={(v) => {
            setLocation(v)
            close()
          }}
        />
      )}
    </FilterBar.Item>,

    <FilterBar.Item
      key="price"
      label="Price"
      value={price}
      placeholder="Any price"
      onClear={() => setPrice(null)}
      flex={1.4}
    >
      {(close) => (
        <SimpleList
          items={PRICE_RANGES}
          selected={price}
          onSelect={(v) => {
            setPrice(v)
            close()
          }}
        />
      )}
    </FilterBar.Item>,
  ]

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:block">
        <FilterBar
          onSearch={handleSearch}
          defaultActive={expandIndex}
          onActiveChange={handleActiveChange}
        >
          {filterItems}
        </FilterBar>
      </div>

      {/* Mobile */}
      <MobileFilterBar onSearch={handleSearch}>
        {filterItems}
      </MobileFilterBar>
    </div>
  )
}

// --- ExampleFiltersDialog ---
// Pass this as filtersSlot to CollapsibleHeader.
// CollapsibleHeader shows it next to the compact pill only when hasActiveFilters || hasDialogFilters.

export function ExampleFiltersDialog() {
  const [rating, setRating] = useState<string | null>(null)
  const [sort, setSort] = useState<string | null>(null)
  const filterCount = [rating, sort].filter(Boolean).length

  return (
    <FiltersDialog
      filterCount={filterCount}
      onReset={() => {
        setRating(null)
        setSort(null)
      }}
      title="More filters"
      resetLabel="Reset"
      applyLabel="Show results"
    >
      <AdvancedContent
        rating={rating}
        setRating={setRating}
        sort={sort}
        setSort={setSort}
      />
    </FiltersDialog>
  )
}
