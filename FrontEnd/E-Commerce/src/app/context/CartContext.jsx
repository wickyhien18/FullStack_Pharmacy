import { createContext, useContext, useState } from "react";
const CartContext = createContext(null);
function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // const [wishlist, setWishlist] = useState([]);
  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i,
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  };
  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };
  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: qty } : i,
      ),
    );
  };
  const clearCart = () => setItems([]);
  // const toggleWishlist = (productId) => {
  //   setWishlist(
  //     (prev) => prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
  //   );
  // };
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        // wishlist,
        // toggleWishlist
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
export { CartProvider, useCart };
