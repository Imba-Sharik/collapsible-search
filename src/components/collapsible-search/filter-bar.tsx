"use client";

import {
  Children,
  Fragment,
  isValidElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Search, X } from "lucide-react";

// --- Types ---

export interface FilterBarItemProps {
  label: string;
  value: string | null;
  placeholder: string;
  onClear?: () => void;
  flex?: number;
  children: (close: () => void) => ReactNode;
}

interface FilterBarProps {
  children: ReactNode;
  onSearch?: () => void;
  searchLabel?: string;
  dropdownClassName?: string;
  className?: string;
  defaultActive?: number | null;
  onActiveChange?: (active: number | null) => void;
}

// --- FilterBar.Item (config-component, rendered by parent) ---

function FilterBarItem({}: FilterBarItemProps): ReactNode {
  return null;
}
FilterBarItem.displayName = "FilterBar.Item";

// --- FilterBar ---

function FilterBarRoot({
  children,
  onSearch,
  searchLabel = "Search",
  dropdownClassName,
  className,
  defaultActive,
  onActiveChange,
}: FilterBarProps) {
  const [active, setActive] = useState<number | null>(defaultActive ?? null);
  const [prevDefaultActive, setPrevDefaultActive] = useState(defaultActive);
  if (defaultActive !== prevDefaultActive) {
    setPrevDefaultActive(defaultActive);
    if (defaultActive !== undefined && defaultActive !== null) {
      setActive(defaultActive);
    }
  }

  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  const [hovered, setHovered] = useState<number | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<Map<number, HTMLElement>>(new Map());
  const pillRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const prevActive = useRef<number | null>(null);
  const prevDropdownHeight = useRef(0);

  const items = Children.toArray(children).filter(
    (child): child is React.ReactElement<FilterBarItemProps> =>
      isValidElement(child) && child.type === FilterBarItem,
  );

  const isActive = active !== null;
  const next = useCallback(() => {
    setActive((prev) => {
      if (prev === null) return null;
      return prev + 1 < items.length ? prev + 1 : prev;
    });
  }, [items.length]);

  const registerRef = useCallback((index: number, el: HTMLElement | null) => {
    if (el) blockRefs.current.set(index, el);
    else blockRefs.current.delete(index);
  }, []);

  // --- Positioning (resize-aware) ---

  const syncPositions = useCallback(() => {
    const p = pillRef.current;
    const d = dropdownRef.current;
    if (active === null) {
      if (p) p.style.opacity = "0";
      return;
    }
    const el = blockRefs.current.get(active);
    if (!el) return;

    if (p) {
      p.style.left = `${el.offsetLeft}px`;
      p.style.width = `${el.offsetWidth}px`;
    }
    if (d) {
      const border = barRef.current?.clientLeft ?? 0;
      d.style.left = `${el.offsetLeft + border}px`;
      d.style.minWidth = `${el.offsetWidth}px`;
    }
  }, [active]);

  // --- Click outside ---

  useEffect(() => {
    if (active === null) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setActive(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [active]);

  // --- Animations (pill + dropdown) ---

  useLayoutEffect(() => {
    const p = pillRef.current;
    const d = dropdownRef.current;
    const isFirst = prevActive.current === null;
    const oldLeft = d?.style.left ?? "";
    const oldMinWidth = d?.style.minWidth ?? "";

    // Pill
    if (p) {
      if (active === null) {
        p.style.opacity = "0";
      } else {
        if (isFirst) {
          p.style.transition = "none";
          syncPositions();
          void p.offsetHeight;
          p.style.transition = "";
        } else {
          syncPositions();
        }
        p.style.opacity = "1";
      }
    }

    // Dropdown
    if (d && active !== null) {
      const el = blockRefs.current.get(active);
      if (el) {
        const border = barRef.current?.clientLeft ?? 0;
        const left = `${el.offsetLeft + border}px`;
        const minWidth = `${el.offsetWidth}px`;

        d.style.height = "auto";
        const newHeight = d.scrollHeight;

        if (isFirst) {
          d.style.transition = "none";
          d.style.left = left;
          d.style.minWidth = minWidth;
          d.style.height = `${newHeight}px`;
          void d.offsetHeight;
          d.style.transition = "";
        } else {
          d.style.transition = "none";
          d.style.left = oldLeft;
          d.style.minWidth = oldMinWidth;
          d.style.height = `${prevDropdownHeight.current}px`;
          void d.offsetHeight;
          d.style.transition = "";
          d.style.left = left;
          d.style.minWidth = minWidth;
          d.style.height = `${newHeight}px`;
        }

        prevDropdownHeight.current = newHeight;
      }
    }

    prevActive.current = active;
  }, [active, syncPositions]);

  // --- Resize ---

  useEffect(() => {
    if (!barRef.current) return;
    const ro = new ResizeObserver(syncPositions);
    ro.observe(barRef.current);
    return () => ro.disconnect();
  }, [syncPositions]);

  // --- Dynamic dropdown height ---

  useEffect(() => {
    const d = dropdownRef.current;
    const content = dropdownContentRef.current;
    if (!d || !content || active === null) return;
    const ro = new ResizeObserver(() => {
      const style = window.getComputedStyle(d);
      const paddingV = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      d.style.height = `${content.scrollHeight + paddingV}px`;
    });
    ro.observe(content);
    return () => ro.disconnect();
  }, [active]);

  // --- Helpers ---

  function isDividerHidden(left: number, right: number) {
    return isActive || hovered === left || hovered === right;
  }

  function getBlockClass(index: number) {
    if (!isActive) return "rounded-full hover:bg-muted";
    if (active === index) return "relative z-30";
    if (hovered !== index) return "relative z-10";

    const isAdjacent = active !== null && Math.abs(index - active) === 1;
    if (isAdjacent) {
      const rounding = active! < index ? "rounded-r-full" : "rounded-l-full";
      const shadow =
        active! < index
          ? "shadow-[-48px_0_0_0_var(--color-foreground)]/5"
          : "shadow-[48px_0_0_0_var(--color-foreground)]/5";
      return `relative z-10 bg-foreground/5 ${rounding} ${shadow}`;
    }
    return "relative z-10 rounded-full bg-foreground/5";
  }

  // --- Render ---

  return (
    <div ref={wrapperRef} className={`relative w-full max-w-3xl ${className ?? ""}`}>
      <div
        ref={barRef}
        className={`relative flex items-center overflow-hidden rounded-full border border-border shadow-sm ${
          isActive ? "bg-muted" : "bg-background"
        }`}
      >
        {/* Sliding pill */}
        <div
          ref={pillRef}
          className="pointer-events-none absolute top-0 bottom-0 z-20 rounded-full bg-background opacity-0 shadow-sm transition-[left,width] duration-300 ease-out"
        />

        {items.map((item, index) => {
          const { label, value, placeholder, onClear, flex } = item.props;
          const isLast = index === items.length - 1;
          const hasSearch = isLast && !!onSearch;
          const showClear = active === index && value !== null && !!onClear;

          const blockClass = getBlockClass(index);
          const handlers = {
            onClick: () => setActive(active === index ? null : index),
            onMouseEnter: () => setHovered(index),
            onMouseLeave: () => setHovered(null),
          };
          const labelEl = (
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold">{label}</div>
                <div className={`truncate text-sm ${value ? "text-foreground" : "text-muted-foreground"}`}>
                  {value ?? placeholder}
                </div>
              </div>
              {showClear && (
                <div
                  role="button"
                  tabIndex={0}
                  className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-foreground/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation();
                      onClear();
                    }
                  }}
                >
                  <X className="size-3" />
                </div>
              )}
            </div>
          );

          return (
            <Fragment key={index}>
              {index > 0 && (
                <div
                  className={`h-8 w-px shrink-0 transition-colors ${
                    isDividerHidden(index - 1, index) ? "bg-transparent" : "bg-border"
                  }`}
                />
              )}

              {hasSearch ? (
                <div
                  ref={(el) => registerRef(index, el)}
                  style={{ flex: flex ?? 1.8 }}
                  className={`flex cursor-pointer items-center ${blockClass}`}
                  {...handlers}
                >
                  <div className="flex-1 px-6 py-3 text-left">{labelEl}</div>
                  <button
                    className={`my-2 mr-3 flex h-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground transition-all duration-200 hover:bg-primary/90 ${
                      isActive ? "w-24 gap-2 px-4" : "w-10 px-0"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSearch?.();
                    }}
                  >
                    <Search className="size-4 shrink-0" />
                    <span
                      className={`whitespace-nowrap text-sm font-semibold ${
                        isActive ? "opacity-100" : "w-0 opacity-0"
                      }`}
                    >
                      {searchLabel}
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  ref={(el) => registerRef(index, el)}
                  style={{ flex: flex ?? 1 }}
                  className={`cursor-pointer px-6 py-3 text-left ${blockClass}`}
                  {...handlers}
                >
                  {labelEl}
                </button>
              )}
            </Fragment>
          );
        })}
      </div>

      {/* Dropdown */}
      {isActive && active !== null && items[active] && (
        <div
          ref={dropdownRef}
          className={`absolute z-50 mt-2 overflow-hidden rounded-2xl border border-foreground/4 bg-background p-2 shadow-[0px_1px_8px_0px_rgba(0,0,0,0.1)] transition-[left,min-width,height] duration-300 ease-out ${dropdownClassName ?? ""}`}
        >
          <div ref={dropdownContentRef}>
            {items[active].props.children(next)}
          </div>
        </div>
      )}
    </div>
  );
}
FilterBarRoot.displayName = "FilterBar";

// --- Export ---

export const FilterBar = Object.assign(FilterBarRoot, {
  Item: FilterBarItem,
});
