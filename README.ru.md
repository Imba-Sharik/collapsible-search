# Collapsible Search

Поисковая шапка в стиле Airbnb — сворачивается в компактную pill-кнопку при скролле.

<!-- TODO: заменить на реальный GIF -->
<!-- ![Демо](./demo.gif) -->

## Установка

Требуется React 18+, Tailwind CSS v4 и CSS-переменные [shadcn/ui](https://ui.shadcn.com).

**1.** Установите единственную внешнюю зависимость:

```bash
npm i lucide-react
```

**2.** Скопируйте 3 файла в свой проект:

```
components/collapsible-search/
  search-bar-context.tsx   ← контекст для состояния collapse/expand
  filter-bar.tsx           ← поисковая строка с выпадающими фильтрами
  compact-search-bar.tsx   ← компактная pill-кнопка в свёрнутом виде
```

Готово. Код ваш — меняйте как угодно.

## Использование

```tsx
import { useState } from "react"
import { FilterBar } from "@/components/collapsible-search/filter-bar"

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

### Сворачиваемая шапка

Чтобы получить полное поведение (поисковая строка сворачивается в pill при скролле, разворачивается обратно наверху), смотрите рабочий пример в [`src/components/example/`](src/components/example/):

- [`collapsible-header.tsx`](src/components/example/collapsible-header.tsx) — шапка со скролл-слушателем, pill, collapse/expand
- [`example-search.tsx`](src/components/example/example-search.tsx) — 3 фильтра, подключённых к шапке через `useSearchBar()`
- [`demo-page.tsx`](src/components/example/demo-page.tsx) — полная страница, собирающая всё вместе

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

### CompactSearchBar

| Проп | Тип | Описание |
|---|---|---|
| `labels` | `string[]` | Текстовые лейблы в pill-кнопке |
| `onExpand` | `(index?: number) => void` | Обработчик клика |

### useSearchBar()

Хук для связи поиска со сворачиваемой шапкой.

| Поле | Тип | Описание |
|---|---|---|
| `isCollapsed` | `boolean` | Свёрнута ли строка? |
| `expandIndex` | `number \| null` | Какой фильтр открыть при развороте |
| `collapse(labels, hasFilters)` | `fn` | Свернуть с указанными лейблами |
| `expand(index?)` | `fn` | Развернуть, опционально открыть фильтр |
| `updateLabels(labels)` | `fn` | Обновить лейблы в pill |
| `reportDropdownOpen(open)` | `fn` | Блокировать сворачивание пока dropdown открыт |

</details>

## Лицензия

MIT
