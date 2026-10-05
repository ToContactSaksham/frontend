export interface ShelfProduct {
  id: string;
  name: string;
  category: "Audio" | "Desk" | "Lighting" | "Accessories";
  /** Price in cents */
  price: number;
  rating: number;
  reviews: number;
  stock: number;
  gradient: [string, string];
  blurb: string;
}

export const shelfCategories = ["Audio", "Desk", "Lighting", "Accessories"] as const;

export const shelfProducts: ShelfProduct[] = [
  { id: "p-aero-buds", name: "Aero Buds", category: "Audio", price: 12900, rating: 4.6, reviews: 812, stock: 42, gradient: ["#7c3aed", "#06b6d4"], blurb: "Adaptive ANC earbuds with 30-hour battery." },
  { id: "p-studio-one", name: "Studio One Monitor", category: "Audio", price: 24900, rating: 4.8, reviews: 233, stock: 9, gradient: ["#0ea5e9", "#22c55e"], blurb: "Near-field monitor tuned for small rooms." },
  { id: "p-pulse-speaker", name: "Pulse Speaker", category: "Audio", price: 8900, rating: 4.3, reviews: 1410, stock: 3, gradient: ["#f97316", "#ef4444"], blurb: "Pocket speaker, surprisingly big low end." },
  { id: "p-ridge-desk", name: "Ridge Standing Desk", category: "Desk", price: 59900, rating: 4.7, reviews: 318, stock: 14, gradient: ["#14b8a6", "#6366f1"], blurb: "Dual-motor, memory presets, bamboo top." },
  { id: "p-float-monitor-arm", name: "Float Monitor Arm", category: "Desk", price: 14900, rating: 4.5, reviews: 675, stock: 27, gradient: ["#a855f7", "#ec4899"], blurb: "Gas-spring arm for up to 34-inch displays." },
  { id: "p-cable-weave", name: "Cable Weave Tray", category: "Desk", price: 3900, rating: 4.2, reviews: 2210, stock: 120, gradient: ["#64748b", "#0f172a"], blurb: "Under-desk tray that swallows every cable." },
  { id: "p-kinetic-lamp", name: "Kinetic Desk Lamp", category: "Lighting", price: 14900, rating: 4.9, reviews: 97, stock: 5, gradient: ["#f59e0b", "#db2777"], blurb: "Warm-to-cool light with a gesture dimmer." },
  { id: "p-halo-strip", name: "Halo Light Strip", category: "Lighting", price: 4900, rating: 4.1, reviews: 1890, stock: 64, gradient: ["#22d3ee", "#a78bfa"], blurb: "Bias lighting that follows your screen." },
  { id: "p-nova-panel", name: "Nova Wall Panels", category: "Lighting", price: 19900, rating: 4.4, reviews: 402, stock: 11, gradient: ["#ec4899", "#8b5cf6"], blurb: "Modular hexagons, 16M colours, touch-reactive." },
  { id: "p-grip-mat", name: "Grip Desk Mat", category: "Accessories", price: 2900, rating: 4.6, reviews: 3120, stock: 200, gradient: ["#0891b2", "#164e63"], blurb: "Vegan leather, stitched edge, 90×40 cm." },
  { id: "p-keycap-set", name: "Dusk Keycap Set", category: "Accessories", price: 7900, rating: 4.7, reviews: 540, stock: 2, gradient: ["#6d28d9", "#1e1b4b"], blurb: "PBT dye-sub, Cherry profile, 140 keys." },
  { id: "p-dock-mini", name: "Dock Mini", category: "Accessories", price: 9900, rating: 4.0, reviews: 760, stock: 33, gradient: ["#10b981", "#0ea5e9"], blurb: "8-in-1 USB-C dock with 100 W passthrough." },
];
