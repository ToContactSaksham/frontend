"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { Minus, Plus, RefreshCw, Search, ShoppingBag, Trash2, X, Zap } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { ApiResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { ShelfProduct } from "@/data/demos/shelf-products";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/toast-provider";
import { Switch } from "@/components/demos/aurora/switch";
import { cartReducer, cartTotals, money, type CartAction, type CartLine } from "./cart";

interface Payload {
  items: ShelfProduct[];
  total: number;
  categories: readonly string[];
}

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-xs tracking-tight text-warning" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(full)}
      <span className="text-fg-subtle">{"★".repeat(5 - full)}</span>
    </span>
  );
}

/**
 * Headless storefront: product list from a REST endpoint with debounced
 * search and category filters; cart mutations use useOptimistic +
 * useTransition so the UI updates instantly and rolls back when the
 * (optionally chaotic) API rejects the change.
 */
export function ShelfStore() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState("All");
  const [chaos, setChaos] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [optimisticCart, applyOptimistic] = useOptimistic(cart, cartReducer);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 250);
    return () => window.clearTimeout(t);
  }, [query]);

  const params = new URLSearchParams();
  if (debounced) params.set("q", debounced);
  if (category !== "All") params.set("category", category);
  const url = `/api/demos/shelf/products${params.size ? `?${params}` : ""}`;
  const { data, loading, stale, error, durationMs, refetch } = useApi<Payload>(url);

  const mutate = (action: CartAction) =>
    startTransition(async () => {
      applyOptimistic(action);
      const body =
        action.type === "add"
          ? { action: "add", productId: action.product.id }
          : action.type === "remove"
            ? { action: "remove", productId: action.id }
            : { action: "setQty", productId: action.id, qty: action.qty };
      try {
        const res = await fetch("/api/demos/shelf/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(chaos ? { "X-Chaos": "1" } : {}),
          },
          body: JSON.stringify(body),
        });
        const json = (await res.json()) as ApiResponse<unknown>;
        if (!json.ok) throw new Error(`${json.error.code}: ${json.error.message}`);
        setCart((c) => cartReducer(c, action));
      } catch (err) {
        // Not calling setCart means the optimistic state rolls back automatically.
        toast({
          title: "Cart update rolled back",
          description: err instanceof Error ? err.message : "Network error",
          variant: "error",
        });
      }
    });

  const totals = cartTotals(optimisticCart);
  const categories = ["All", ...(data?.categories ?? ["Audio", "Desk", "Lighting", "Accessories"])];

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="card flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <label className="relative flex-1 md:max-w-sm">
          <span className="sr-only">Search products</span>
          <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-10 w-full rounded-full border border-border bg-bg pl-9 pr-4 text-sm outline-none focus:border-accent"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition",
                category === c ? "border-fg bg-fg text-bg" : "border-border text-fg-muted hover:text-fg",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <div className="w-44">
            <Switch
              checked={chaos}
              onChange={setChaos}
              label="Chaos mode"
              description="50% of cart calls fail"
            />
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart, ${totals.count} items`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-fg transition hover:bg-surface-hover"
          >
            <ShoppingBag size={18} aria-hidden />
            {totals.count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 font-mono text-[10px] font-bold text-accent-fg">
                {totals.count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Status */}
      <p className="font-mono text-xs text-fg-subtle" aria-live="polite">
        {data
          ? `GET ${url} → ${data.total} products in ${durationMs} ms${stale ? " · updating…" : ""}`
          : loading
            ? "Loading products…"
            : ""}
      </p>

      {error && (
        <div className="card flex items-center justify-between gap-4 p-5">
          <p className="text-sm">
            <span className="font-semibold text-danger">{error.code}</span>{" "}
            <span className="text-fg-muted">{error.message}</span>
          </p>
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw size={14} aria-hidden /> Retry
          </Button>
        </div>
      )}

      {/* Grid */}
      <ul
        className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity", stale && "opacity-60")}
        aria-busy={loading}
      >
        {loading && !data &&
          Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="card overflow-hidden">
              <Skeleton className="aspect-[4/3] rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-9 w-full rounded-full" />
              </div>
            </li>
          ))}
        {data?.items.map((p) => {
          const inCart = optimisticCart.find((l) => l.id === p.id)?.qty ?? 0;
          return (
            <li key={p.id} className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
              <div
                className="relative aspect-[4/3]"
                style={{ background: `linear-gradient(135deg, ${p.gradient[0]}, ${p.gradient[1]})` }}
              >
                <div aria-hidden className="absolute inset-0 bg-grid opacity-25 mix-blend-overlay" />
                <span className="absolute left-3 top-3 rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
                  {p.category}
                </span>
                {p.stock <= 5 && (
                  <span className="absolute right-3 top-3 rounded-full bg-warning px-2 py-0.5 text-[10px] font-semibold text-black">
                    Only {p.stock} left
                  </span>
                )}
                <span className="absolute bottom-3 left-3 text-3xl font-bold text-white drop-shadow">
                  {p.name.split(" ")[0]}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug">{p.name}</h3>
                  <span className="font-mono text-sm tabular-nums">{money(p.price)}</span>
                </div>
                <p className="mt-1 text-xs text-fg-muted">{p.blurb}</p>
                <p className="mt-2 flex items-center gap-2">
                  <Stars rating={p.rating} />
                  <span className="text-[11px] text-fg-subtle">({p.reviews.toLocaleString("en")})</span>
                </p>
                <Button
                  size="sm"
                  variant={inCart ? "outline" : "primary"}
                  className="mt-4 w-full"
                  onClick={() => mutate({ type: "add", product: p })}
                >
                  <Plus size={14} aria-hidden />
                  {inCart ? `In cart · ${inCart}` : "Add to cart"}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {data && data.total === 0 && (
        <div className="card p-10 text-center">
          <p className="font-medium">Nothing matches “{debounced}”.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQuery(""); setCategory("All"); }}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Cart drawer */}
      <div
        className={cn("fixed inset-0 z-[70] transition", cartOpen ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!cartOpen}
      >
        <button
          type="button"
          aria-label="Close cart"
          tabIndex={cartOpen ? 0 : -1}
          onClick={() => setCartOpen(false)}
          className={cn("absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300", cartOpen ? "opacity-100" : "opacity-0")}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          inert={!cartOpen}
          className={cn(
            "absolute right-0 top-0 flex h-full w-[min(100vw,26rem)] flex-col bg-bg-elevated shadow-lg transition-transform duration-400 ease-out-expo",
            cartOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShoppingBag size={18} aria-hidden /> Cart
              <span className="font-mono text-xs text-fg-muted">({totals.count})</span>
            </h2>
            <div className="flex items-center gap-2">
              {isPending && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-fg-muted">
                  <Zap size={12} className="animate-pulse text-accent" aria-hidden /> syncing
                </span>
              )}
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="rounded-full p-2 text-fg-muted hover:bg-surface-hover hover:text-fg"
              >
                <X size={18} aria-hidden />
              </button>
            </div>
          </div>

          <ul className="flex-1 space-y-3 overflow-y-auto p-5">
            {optimisticCart.length === 0 && (
              <li className="py-16 text-center text-sm text-fg-muted">Your cart is empty.</li>
            )}
            {optimisticCart.map((l) => (
              <li key={l.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <span
                  aria-hidden
                  className="h-12 w-12 shrink-0 rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${l.gradient[0]}, ${l.gradient[1]})` }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="font-mono text-xs text-fg-muted">{money(l.price * l.qty)}</p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-border">
                  <button
                    type="button"
                    aria-label={`Decrease quantity of ${l.name}`}
                    onClick={() => mutate({ type: "setQty", id: l.id, qty: l.qty - 1 })}
                    className="grid h-7 w-7 place-items-center rounded-full hover:bg-surface-hover"
                  >
                    <Minus size={12} aria-hidden />
                  </button>
                  <span className="w-5 text-center font-mono text-xs tabular-nums">{l.qty}</span>
                  <button
                    type="button"
                    aria-label={`Increase quantity of ${l.name}`}
                    onClick={() => mutate({ type: "setQty", id: l.id, qty: l.qty + 1 })}
                    className="grid h-7 w-7 place-items-center rounded-full hover:bg-surface-hover"
                  >
                    <Plus size={12} aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${l.name}`}
                  onClick={() => mutate({ type: "remove", id: l.id })}
                  className="rounded-full p-1.5 text-fg-subtle hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              </li>
            ))}
          </ul>

          <div className="border-t border-border p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-fg-muted">Subtotal</span>
              <span className="font-mono font-semibold tabular-nums">{money(totals.subtotal)}</span>
            </div>
            <Button
              className="mt-4 w-full"
              disabled={optimisticCart.length === 0}
              onClick={() => toast({ title: "Demo checkout", description: "No payment is taken, promise.", variant: "default" })}
            >
              Checkout
            </Button>
            <p className="mt-3 text-center text-[11px] text-fg-subtle">
              Every change POSTs to /api/demos/shelf/cart. Turn on chaos mode to watch rollbacks.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
