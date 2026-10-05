import type { ShelfProduct } from "@/data/demos/shelf-products";

export interface CartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
  gradient: [string, string];
}

export type CartAction =
  | { type: "add"; product: ShelfProduct }
  | { type: "remove"; id: string }
  | { type: "setQty"; id: string; qty: number };

/** Pure reducer shared by the optimistic and the confirmed cart state. */
export function cartReducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "add": {
      const existing = state.find((l) => l.id === action.product.id);
      if (existing) {
        return state.map((l) => (l.id === existing.id ? { ...l, qty: Math.min(20, l.qty + 1) } : l));
      }
      const { id, name, price, gradient } = action.product;
      return [...state, { id, name, price, qty: 1, gradient }];
    }
    case "remove":
      return state.filter((l) => l.id !== action.id);
    case "setQty":
      if (action.qty < 1) return state.filter((l) => l.id !== action.id);
      return state.map((l) => (l.id === action.id ? { ...l, qty: Math.min(20, action.qty) } : l));
  }
}

export function cartTotals(lines: CartLine[]) {
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const subtotal = lines.reduce((a, l) => a + l.qty * l.price, 0);
  return { count, subtotal };
}

export const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
