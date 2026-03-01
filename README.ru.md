# Collapsible Search

Поисковая шапка в стиле Airbnb — сворачивается в компактную pill-кнопку при скролле. Включает мобильные фильтры на весь экран и диалог продвинутых фильтров.

[Живое демо](https://collapsible-search.vercel.app/)

![Демо](./public/image.png)

## Установка

Требуется React 18+, Tailwind CSS v4 и CSS-переменные [shadcn/ui](https://ui.shadcn.com).

**1.** Установите зависимости:

```bash
npm i lucide-react radix-ui
```

**2.** Скопируйте 5 файлов в свой проект:

```
components/collapsible-search/
  search-bar-context.tsx    ← контекст для состояния collapse/expand
  filter-bar.tsx            ← десктопная поисковая строка с фильтрами
  compact-search-bar.tsx    ← компактная pill-кнопка в свёрнутом виде
  mobile-filter-bar.tsx     ← мобильный полноэкранный аккордеон-диалог
  filters-dialog.tsx        ← модал продвинутых фильтров (использует radix-ui Dialog)
```

Готово. Код ваш — меняйте как угодно.

## Использование

### Базовое (только десктоп)

```tsx
import { useState } from "react"
import { FilterBar } from "@/components/collapsible-search"

const CATEGORIES = ["Технологии", "Дизайн", "Маркетинг", "Бизнес"]

export function MySearch() {
  const [category, setCategory] = useState<string | null>(null)

  return (
    <FilterBar onSearch={() => console.log({ category })}>
      <FilterBar.Item
        label="Категория"
        value={category}
        placeholder="Любая"
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

Добавьте больше `<FilterBar.Item>` для каждого фильтра. При выборе значения вызовите `next()` — фокус автоматически перейдёт к следующему фильтру.

### Десктоп + Мобайл

Элементы `FilterBar.Item` используются совместно для десктопной и мобильной версий — определяйте их как **массив** (не Fragment), чтобы `React.Children.toArray` мог их итерировать:

```tsx
import { FilterBar, MobileFilterBar } from "@/components/collapsible-search"

export function MySearch() {
  const [category, setCategory] = useState<string | null>(null)

  const filterItems = [
    <FilterBar.Item key="category" label="Категория" value={category}
      placeholder="Любая" onClear={() => setCategory(null)}>
      {(next) => /* содержимое dropdown */}
    </FilterBar.Item>,
    // больше фильтров...
  ]

  return (
    <div className="w-full">
      {/* Десктоп */}
      <div className="hidden md:block">
        <FilterBar onSearch={handleSearch}>{filterItems}</FilterBar>
      </div>

      {/* Мобайл */}
      <MobileFilterBar onSearch={handleSearch}>{filterItems}</MobileFilterBar>
    </div>
  )
}
```

### Диалог продвинутых фильтров

`FiltersDialog` — кнопка-триггер + модал. Передайте любое содержимое через children — слайдеры цены, чекбоксы, датапикеры и т.д.:

```tsx
import { FiltersDialog } from "@/components/collapsible-search"

function MyFiltersDialog() {
  const [rating, setRating] = useState<string | null>(null)
  const filterCount = rating ? 1 : 0

  return (
    <FiltersDialog
      filterCount={filterCount}
      onReset={() => setRating(null)}
      title="Ещё фильтры"
      resetLabel="Сбросить"
      applyLabel="Показать результаты"
    >
      {/* ваши элементы управления фильтрами */}
    </FiltersDialog>
  )
}
```

### Полная сворачиваемая шапка

Для полного поведения со всеми компонентами смотрите рабочий пример в [`src/components/example/`](src/components/example/):

- [`collapsible-header.tsx`](src/components/example/collapsible-header.tsx) — шапка со скролл-слушателем, pill, collapse/expand. Принимает `filtersSlot` — отображается **рядом с pill** при `hasActiveFilters || hasDialogFilters`
- [`example-search.tsx`](src/components/example/example-search.tsx) — `ExampleSearch` (FilterBar + MobileFilterBar) и `ExampleFiltersDialog` (продвинутые фильтры со своим состоянием)
- [`demo-page.tsx`](src/components/example/demo-page.tsx) — полная страница

```tsx
// Паттерн demo-page.tsx:
<CollapsibleHeader
  search={<ExampleSearch />}
  filtersSlot={<ExampleFiltersDialog />}  // появляется рядом с pill после поиска
  logo="My App"
  nav={<nav>...</nav>}
/>
```

## Запуск демо

```bash
git clone https://github.com/Imba-Sharik/collapsible-search.git
cd collapsible-search
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) и проскролльте вниз.

---

<details>
<summary><strong>Справочник по API</strong></summary>

### FilterBar

| Проп | Тип | По умолчанию | Описание |
|---|---|---|---|
| `onSearch` | `() => void` | — | Колбэк кнопки Search (рендерит кнопку на последнем item) |
| `searchLabel` | `string` | `"Search"` | Текст кнопки поиска |
| `defaultActive` | `number \| null` | `null` | Изначально открытый фильтр |
| `onActiveChange` | `(i: number \| null) => void` | — | Вызывается при смене активного фильтра |
| `className` | `string` | — | Классы для корневого элемента |
| `dropdownClassName` | `string` | — | Классы для контейнера dropdown |

### FilterBar.Item

| Проп | Тип | По умолчанию | Описание |
|---|---|---|---|
| `label` | `string` | обязательный | Название фильтра (напр. "Категория") |
| `value` | `string \| null` | обязательный | Выбранное значение, `null` если пусто |
| `placeholder` | `string` | обязательный | Текст когда значение не выбрано |
| `onClear` | `() => void` | — | Кнопка сброса (видна когда фильтр активен и есть значение) |
| `flex` | `number` | `1` | Пропорция ширины относительно других item |
| `children` | `(next: () => void) => ReactNode` | обязательный | Содержимое dropdown. Вызовите `next()` для перехода к следующему фильтру. |

> **Важно:** При совместном использовании фильтров в `FilterBar` и `MobileFilterBar` определяйте их как массив `[<FilterBar.Item .../>, ...]`, а не как `<>...</>` фрагмент. `React.Children.toArray` не разворачивает фрагменты.

### MobileFilterBar

| Проп | Тип | По умолчанию | Описание |
|---|---|---|---|
| `children` | `FilterBar.Item[]` | обязательный | Те же item что и в FilterBar — переиспользуются |
| `onSearch` | `() => void` | — | Вызывается при нажатии кнопки поиска |
| `searchLabel` | `string` | `"Search"` | Текст кнопки поиска |
| `clearLabel` | `string` | `"Clear all"` | Текст кнопки сброса |

### FiltersDialog

| Проп | Тип | По умолчанию | Описание |
|---|---|---|---|
| `children` | `ReactNode` | обязательный | Элементы управления продвинутыми фильтрами |
| `filterCount` | `number` | `0` | Количество активных продвинутых фильтров — отображается в бейдже |
| `onReset` | `() => void` | — | Сброс всех продвинутых фильтров |
| `triggerLabel` | `string` | `"Filters"` | Текст кнопки-триггера |
| `title` | `string` | `"Filters"` | Заголовок диалога |
| `resetLabel` | `string` | `"Reset all"` | Текст кнопки сброса |
| `applyLabel` | `string` | `"Apply"` | Текст кнопки применения |

### CompactSearchBar

| Проп | Тип | Описание |
|---|---|---|
| `labels` | `string[]` | Текстовые лейблы в pill-кнопке |
| `onExpand` | `(index?: number) => void` | Обработчик клика |

### useSearchBar()

Хук для связи поисковых компонентов со сворачиваемой шапкой.

| Поле | Тип | Описание |
|---|---|---|
| `isCollapsed` | `boolean` | Свёрнута ли строка? |
| `hasActiveFilters` | `boolean` | Были ли основные фильтры активны при последнем сворачивании? |
| `hasDialogFilters` | `boolean` | Активны ли продвинутые (диалоговые) фильтры? |
| `expandIndex` | `number \| null` | Какой фильтр открыть при развороте |
| `collapse(labels, hasFilters)` | `fn` | Свернуть с указанными лейблами |
| `expand(index?)` | `fn` | Развернуть, опционально открыть фильтр |
| `updateLabels(labels)` | `fn` | Обновить лейблы в pill без сворачивания |
| `reportDropdownOpen(open)` | `fn` | Блокировать сворачивание пока dropdown открыт |
| `reportDialogFilters(hasFilters)` | `fn` | Уведомить шапку о закрытии диалога продвинутых фильтров |

### CollapsibleHeader (пример)

| Проп | Тип | Описание |
|---|---|---|
| `search` | `ReactNode` | Развёрнутая поисковая область (FilterBar + MobileFilterBar) |
| `filtersSlot` | `ReactNode` | Отображается рядом с pill при `hasActiveFilters \|\| hasDialogFilters` |
| `logo` | `ReactNode` | Логотип |
| `nav` | `ReactNode` | Навигационные ссылки |

</details>

## Лицензия

MIT
