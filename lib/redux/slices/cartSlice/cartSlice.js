import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'qh_cart_v1';
const TAX_RATE = 0.18;

function flattenI18nName(n) {
  if (n && typeof n === 'object' && !Array.isArray(n)) {
    return n.en || Object.values(n)[0] || 'Service';
  }
  return n || 'Service';
}

function loadInitial() {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    // Heal any cart items that were persisted before the i18n-object fix —
    // their `name` may still be { en, hi, ... } and crash on render.
    const items = parsed.items.map((i) => ({ ...i, name: flattenI18nName(i.name) }));
    return { items };
  } catch {
    return { items: [] };
  }
}

function recalculate(state) {
  const subtotal = state.items.reduce(
    (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
    0,
  );
  state.subtotal = Number(subtotal.toFixed(2));
  state.tax = Number((subtotal * TAX_RATE).toFixed(2));
  state.total = Number((state.subtotal + state.tax).toFixed(2));
}

function persist(state) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }));
  } catch {
    /* ignore quota errors */
  }
}

const initialState = (() => {
  const base = { items: [], subtotal: 0, tax: 0, total: 0 };
  const persisted = loadInitial();
  base.items = persisted.items;
  recalculate(base);
  return base;
})();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const incoming = action.payload || {};
      const id = incoming.id || incoming.serviceId;
      if (!id) return;
      const existing = state.items.find((i) => (i.id || i.serviceId) === id);
      if (existing) {
        existing.quantity = Number(existing.quantity || 1) + Number(incoming.quantity || 1);
      } else {
        state.items.push({
          id,
          serviceId: incoming.serviceId || id,
          name: flattenI18nName(incoming.name),
          image: incoming.image || null,
          duration: incoming.duration || '',
          price: Number(incoming.price || 0),
          quantity: Number(incoming.quantity || 1),
          meta: incoming.meta || null,
        });
      }
      recalculate(state);
      persist(state);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload || {};
      const item = state.items.find((i) => (i.id || i.serviceId) === id);
      if (item) {
        item.quantity = Math.max(1, Number(quantity || 1));
        recalculate(state);
        persist(state);
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((i) => (i.id || i.serviceId) !== id);
      recalculate(state);
      persist(state);
    },
    clearCart: (state) => {
      state.items = [];
      recalculate(state);
      persist(state);
    },
    hydrateCart: (state) => {
      const persisted = loadInitial();
      state.items = persisted.items;
      recalculate(state);
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  hydrateCart,
} = cartSlice.actions;

export const selectCart = (state) => state.cart;
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((n, i) => n + Number(i.quantity || 1), 0);

export default cartSlice.reducer;
