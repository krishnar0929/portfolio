/** Plain GET form to /search so it works without JavaScript. */
export function SearchBox({ defaultValue = "", autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form action="/search" method="get" role="search" className="flex w-full gap-2">
      <label htmlFor="q" className="sr-only">
        City or ZIP code
      </label>
      <div className="relative flex-1">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          minLength={2}
          required
          placeholder="Search by city or ZIP code — e.g. Atlanta or 30303"
          className="w-full rounded-full border border-white/10 bg-ink-900/80 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <button type="submit" className="btn-primary px-6">
        Search
      </button>
    </form>
  );
}
