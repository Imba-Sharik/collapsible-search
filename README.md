# Collapsible Search

[Русская версия](README.ru.md)

Airbnb-style search header that collapses into a compact pill on scroll. Includes mobile full-screen filters and an advanced filters dialog.

[Live Demo](https://collapsible-search.vercel.app/)

![Demo](./public/image.png)

## Install

Requires React 18+, Tailwind CSS v4, and [shadcn/ui](https://ui.shadcn.com) CSS variables.

**1.** Install dependencies:

```bash
npm i lucide-react radix-ui
```

**2.** Copy the widget folder into your project:

```
widgets/collapsible-search/
  ui/
    filter-bar.tsx            ← desktop search bar with filter dropdowns
    compact-search-bar.tsx    ← compact pill shown when collapsed
    mobile-filter-bar.tsx     ← mobile full-screen accordion dialog
    filters-dialog.tsx        ← advanced filters modal (uses radix-ui Dialog)
    collapsible-header.tsx    ← header with scroll-collapse behavior
  model/
    search-bar-context.tsx    ← context for collapse/expand state
  index.ts
```

Done. You own the code — customize freely.

## Usage

### Basic (desktop only)

```tsx
import { useState } from "react"
import { FilterBar } from "@/widgets/collapsible-search"

const CATEGORIES = ["Technology", "Design", "Marketing", "Business"]

export function MySearch() {
  const [category, setCategory] = useState<string | null>(null)

  return (
    <FilterBar onSearch={() => console.log({ category })}>
      <FilterBar.Item
        label="Category"
        value={category}
        placeholder="Any category"
        onClear={() => setCategory(null)}
      >
        {(next) =>
          CATEGORIES.map((item) => (
            <button
              key={item}
              onClick={() => { setCategory(item); next() }}
              className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
            >
              {item}
            </button>
          ))
        }
      </FilterBar.Item>
    </FilterBar>
  )
}
```

Add more `<FilterBar.Item>` for each filter. When the user picks a value, call `next()` to auto-advance to the next filter.

### Desktop + Mobile

`FilterBar.Item` elements are shared between desktop and mobile — define them as an **array** (not a Fragment) so `React.Children.toArray` can iterate them:

```tsx
import { FilterBar, MobileFilterBar } from "@/widgets/collapsible-search"

export function MySearch() {
  const [category, setCategory] = useState<string | null>(null)

  const filterItems = [
    <FilterBar.Item key="category" label="Category" value={category}
      placeholder="Any category" onClear={() => setCategory(null)}>
      {(next) => /* your dropdown content */}
    </FilterBar.Item>,
    // more items...
  ]

  return (
    <div className="w-full">
      {/* Desktop */}
      <div className="hidden md:block">
        <FilterBar onSearch={handleSearch}>{filterItems}</FilterBar>
      </div>

      {/* Mobile */}
      <MobileFilterBar onSearch={handleSearch}>{filterItems}</MobileFilterBar>
    </div>
  )
}
```

### Advanced filters dialog

`FiltersDialog` is a trigger button + modal. Pass any content as children — price sliders, checkboxes, date pickers, etc.:

```tsx
import { FiltersDialog } from "@/widgets/collapsible-search"

function MyFiltersDialog() {
  const [rating, setRating] = useState<string | null>(null)
  const filterCount = rating ? 1 : 0

  return (
    <FiltersDialog
      filterCount={filterCount}
      onReset={() => setRating(null)}
      title="More filters"
      resetLabel="Reset"
      applyLabel="Show results"
    >
      {/* your advanced filter controls */}
    </FiltersDialog>
  )
}
```

### Full collapsible header

For the full scroll-collapse behavior with all components wired together, see the working example in [`src/components/example/`](src/components/example/):

- [`collapsible-header.tsx`](src/widgets/collapsible-search/ui/collapsible-header.tsx) — header with scroll listener, compact pill, expand/collapse. Accepts `filtersSlot` — shown **next to the pill** when `hasActiveFilters || hasDialogFilters`
- [`example-search.tsx`](src/components/example/example-search.tsx) — `ExampleSearch` (FilterBar + MobileFilterBar) and `ExampleFiltersDialog` (advanced filters with own state)
- [`demo-page.tsx`](src/components/example/demo-page.tsx) — full page putting it all together

```tsx
// demo-page.tsx pattern:
<CollapsibleHeader
  search={<ExampleSearch />}
  filtersSlot={<ExampleFiltersDialog />}  // appears next to pill after search
  logo="My App"
  nav={<nav>...</nav>}
/>
```

## Run the demo

```bash
git clone https://github.com/Imba-Sharik/collapsible-search.git
cd collapsible-search
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and scroll down.

---

<details>
<summary><strong>API Reference</strong></summary>

### FilterBar

| Prop | Type | Default | Description |
|---|---|---|---|
| `onSearch` | `() => void` | — | Search button callback (renders button on last item) |
| `searchLabel` | `string` | `"Search"` | Search button text |
| `defaultActive` | `number \| null` | `null` | Initially open filter index |
| `onActiveChange` | `(i: number \| null) => void` | — | Active filter changed |
| `className` | `string` | — | Root wrapper classes |
| `dropdownClassName` | `string` | — | Dropdown container classes |

### FilterBar.Item

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | required | Filter name (e.g. "Category") |
| `value` | `string \| null` | required | Selected value, `null` if empty |
| `placeholder` | `string` | required | Shown when value is null |
| `onClear` | `() => void` | — | Clear button (shown when active + has value) |
| `flex` | `number` | `1` | Width ratio relative to other items |
| `children` | `(next: () => void) => ReactNode` | required | Dropdown content. Call `next()` to advance. |

> **Note:** When sharing filter items between `FilterBar` and `MobileFilterBar`, define them as an array `[<FilterBar.Item .../>, ...]`, not a `<>...</>` fragment. React.Children.toArray does not flatten fragments.

### MobileFilterBar

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `FilterBar.Item[]` | required | Same items as FilterBar — shared between both |
| `onSearch` | `() => void` | — | Called when user taps the search button |
| `searchLabel` | `string` | `"Search"` | Search button text |
| `clearLabel` | `string` | `"Clear all"` | Clear all button text |
| `advancedFilters` | `ReactNode` | — | Advanced filters content rendered in a bottom sheet |
| `advancedFiltersCount` | `number` | `0` | Number of active advanced filters — drives badge + button visibility |
| `advancedFiltersTitle` | `string` | `"Filters"` | Bottom sheet title |
| `advancedFiltersResetLabel` | `string` | `"Reset all"` | Reset button text |
| `advancedFiltersApplyLabel` | `string` | `"Apply"` | Apply button text |
| `onAdvancedFiltersReset` | `() => void` | — | Reset all advanced filters |

> The advanced filters button (SlidersHorizontal icon) appears next to the main pill trigger when main filters have a value or `advancedFiltersCount > 0`. It opens a bottom sheet dialog.

### FiltersDialog

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | required | Advanced filter controls |
| `filterCount` | `number` | `0` | Number of active advanced filters — drives the badge |
| `onReset` | `() => void` | — | Reset all advanced filters |
| `triggerLabel` | `string` | `"Filters"` | Trigger button text |
| `title` | `string` | `"Filters"` | Dialog title |
| `resetLabel` | `string` | `"Reset all"` | Reset button text |
| `applyLabel` | `string` | `"Apply"` | Apply button text |

### CompactSearchBar

| Prop | Type | Description |
|---|---|---|
| `labels` | `string[]` | Text labels in the pill |
| `onExpand` | `(index?: number) => void` | Click handler |

### useSearchBar()

Hook for connecting your search components to a collapsible header.

| Field | Type | Description |
|---|---|---|
| `isCollapsed` | `boolean` | Is the bar collapsed? |
| `hasActiveFilters` | `boolean` | Were main filters active at last collapse? |
| `hasDialogFilters` | `boolean` | Are advanced (dialog) filters active? |
| `expandIndex` | `number \| null` | Filter to open on expand |
| `collapse(labels, hasFilters)` | `fn` | Collapse with these labels |
| `expand(index?)` | `fn` | Expand, optionally open a filter |
| `updateLabels(labels)` | `fn` | Update pill labels without collapsing |
| `reportDropdownOpen(open)` | `fn` | Block scroll-collapse while dropdown is open |
| `reportDialogFilters(hasFilters)` | `fn` | Notify header that advanced filters dialog closed |

### CollapsibleHeader (example)

| Prop | Type | Description |
|---|---|---|
| `search` | `ReactNode` | The expanded search area (FilterBar + MobileFilterBar) |
| `filtersSlot` | `ReactNode` | Shown next to compact pill when `hasActiveFilters \|\| hasDialogFilters` |
| `logo` | `ReactNode` | Logo element |
| `nav` | `ReactNode` | Navigation links |

</details>

## License

MIT
