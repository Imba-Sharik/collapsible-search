"use client"

import { useCallback, useEffect, useState } from "react"
import { FilterBar } from "@/components/collapsible-search"
import { useSearchBar } from "@/components/collapsible-search"

const CATEGORIES = ["Technology", "Design", "Marketing", "Business", "Science"]
const LOCATIONS = ["New York", "London", "Tokyo", "Berlin", "Remote"]
const PRICE_RANGES = ["Free", "$1 – $50", "$50 – $100", "$100+"]

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

export function ExampleSearch() {
  const [category, setCategory] = useState<string | null>(null)
  const [location, setLocation] = useState<string | null>(null)
  const [price, setPrice] = useState<string | null>(null)
  const { collapse, updateLabels, expandIndex, reportDropdownOpen } = useSearchBar()

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
    collapse([
      category ?? "Category",
      location ?? "Location",
      price ?? "Price",
    ], hasFilters)
  }

  return (
    <FilterBar onSearch={handleSearch} defaultActive={expandIndex} onActiveChange={handleActiveChange}>
      <FilterBar.Item label="Category" value={category} placeholder="Any category" onClear={() => setCategory(null)}>
        {(close) => (
          <SimpleList items={CATEGORIES} selected={category} onSelect={(v) => { setCategory(v); close() }} />
        )}
      </FilterBar.Item>

      <FilterBar.Item label="Location" value={location} placeholder="Anywhere" onClear={() => setLocation(null)} flex={1}>
        {(close) => (
          <SimpleList items={LOCATIONS} selected={location} onSelect={(v) => { setLocation(v); close() }} />
        )}
      </FilterBar.Item>

      <FilterBar.Item label="Price" value={price} placeholder="Any price" onClear={() => setPrice(null)} flex={1.4}>
        {(close) => (
          <SimpleList items={PRICE_RANGES} selected={price} onSelect={(v) => { setPrice(v); close() }} />
        )}
      </FilterBar.Item>
    </FilterBar>
  )
}
