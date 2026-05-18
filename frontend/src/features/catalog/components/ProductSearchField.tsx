import { useEffect, useId, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../catalogApi'
import type { CatalogProduct } from '../catalogTypes'

const SUGGEST_MIN_CHARS = 2
const SUGGEST_LIMIT = 8
const DEBOUNCE_MS = 250

function formatAud(price: number): string {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(price)
}

function SearchSubmitIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

type ProductSearchFieldProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  category?: string
}

export function ProductSearchField({ value, onChange, onSubmit, category }: ProductSearchFieldProps) {
  const navigate = useNavigate()
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  const [suggestions, setSuggestions] = useState<CatalogProduct[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const trimmed = value.trim()
  const showSuggestions = isOpen && trimmed.length >= SUGGEST_MIN_CHARS
  const optionCount = suggestions.length + 1

  useEffect(() => {
    if (trimmed.length < SUGGEST_MIN_CHARS) {
      setSuggestions([])
      setSuggestionsLoading(false)
      setHighlightIndex(-1)
      return
    }

    const controller = new AbortController()
    setSuggestionsLoading(true)

    const timer = window.setTimeout(() => {
      getProducts(
        {
          search: trimmed,
          limit: SUGGEST_LIMIT,
          page: 1,
          category: category || undefined,
          sort: 'name_asc',
        },
        controller.signal,
      )
        .then((result) => {
          setSuggestions(result.products)
          setHighlightIndex(-1)
        })
        .catch((err) => {
          if (err instanceof Error && err.name === 'AbortError') return
          setSuggestions([])
        })
        .finally(() => {
          setSuggestionsLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed, category])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  function selectProduct(product: CatalogProduct) {
    setIsOpen(false)
    navigate(`/shop/${product.slug}`)
  }

  function submitSearchTerm() {
    setIsOpen(false)
    onSubmit()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
      selectProduct(suggestions[highlightIndex])
      return
    }
    submitSearchTerm()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) {
      if (event.key === 'Escape') setIsOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightIndex((index) => (index + 1) % optionCount)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightIndex((index) => (index <= 0 ? optionCount - 1 : index - 1))
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      setHighlightIndex(-1)
      return
    }

    if (event.key === 'Enter' && highlightIndex === suggestions.length) {
      event.preventDefault()
      submitSearchTerm()
    }
  }

  return (
    <div ref={rootRef} className="relative z-20 min-w-0 flex-1">
      <form
        onSubmit={handleSubmit}
        className="flex min-w-0 flex-1 overflow-hidden rounded-lg border border-neutral-200/90 bg-white shadow-sm"
        role="search"
      >
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          type="search"
          placeholder="Search products"
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-0"
          aria-label="Search products by name"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            highlightIndex >= 0 && highlightIndex < suggestions.length
              ? `${listboxId}-option-${highlightIndex}`
              : undefined
          }
        />
        {value ? (
          <button
            type="button"
            className="flex h-9 w-8 shrink-0 items-center justify-center text-neutral-400 transition hover:text-neutral-700"
            aria-label="Clear search"
            onClick={() => {
              onChange('')
              setSuggestions([])
              setIsOpen(false)
            }}
          >
            <span className="text-lg leading-none" aria-hidden>
              ×
            </span>
          </button>
        ) : null}
        <button
          type="submit"
          className="flex h-9 w-9 shrink-0 items-center justify-center border-l border-neutral-200/80 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
          aria-label="Search"
        >
          <SearchSubmitIcon className="h-4 w-4" />
        </button>
      </form>

      {showSuggestions ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-80 overflow-auto rounded-lg border border-neutral-200/90 bg-white py-1 shadow-lg"
        >
          {suggestionsLoading ? (
            <li className="px-3 py-2.5 text-sm text-neutral-500" role="presentation">
              Searching…
            </li>
          ) : null}

          {!suggestionsLoading && suggestions.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-neutral-500" role="presentation">
              No products match &ldquo;{trimmed}&rdquo;
            </li>
          ) : null}

          {!suggestionsLoading
            ? suggestions.map((product, index) => {
                const isHighlighted = highlightIndex === index
                return (
                  <li key={product.id} role="presentation">
                    <button
                      type="button"
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      aria-selected={isHighlighted}
                      className={[
                        'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition',
                        isHighlighted ? 'bg-neutral-100' : 'hover:bg-neutral-50',
                      ].join(' ')}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectProduct(product)}
                    >
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-md border border-neutral-200/80 bg-neutral-50 object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-neutral-900">
                          {product.name}
                        </span>
                        <span className="block truncate text-xs text-neutral-500">
                          {product.shortDescription}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-medium tabular-nums text-neutral-700">
                        {formatAud(product.price)}
                      </span>
                    </button>
                  </li>
                )
              })
            : null}

          {!suggestionsLoading ? (
            <li role="presentation" className="border-t border-neutral-100">
              <button
                type="button"
                role="option"
                aria-selected={highlightIndex === suggestions.length}
                className={[
                  'w-full px-3 py-2.5 text-left text-sm font-medium transition',
                  highlightIndex === suggestions.length
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
                ].join(' ')}
                onMouseEnter={() => setHighlightIndex(suggestions.length)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={submitSearchTerm}
              >
                View all results for &ldquo;{trimmed}&rdquo;
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  )
}

