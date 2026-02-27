"use client"

import { createContext, useContext } from "react"

interface SearchBarContextValue {
  isCollapsed: boolean
  expandIndex: number | null
  hasActiveFilters: boolean
  hasDialogFilters: boolean
  collapse: (labels: string[], hasFilters: boolean) => void
  expand: (index?: number) => void
  updateLabels: (labels: string[]) => void
  reportDropdownOpen: (open: boolean) => void
  reportDialogFilters: (hasFilters: boolean) => void
}

export const SearchBarContext = createContext<SearchBarContextValue>({
  isCollapsed: false,
  expandIndex: null,
  hasActiveFilters: false,
  hasDialogFilters: false,
  collapse: () => {},
  expand: () => {},
  updateLabels: () => {},
  reportDropdownOpen: () => {},
  reportDialogFilters: () => {},
})

export function useSearchBar() {
  return useContext(SearchBarContext)
}
