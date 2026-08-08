import { describe, it, expect } from "vitest";

describe("Cart calculations and logic", () => {
  it("should calculate total items and total price correctly", () => {
    const mockCart = {
      cartId: "1",
      items: [
        {
          cartItemId: "101",
          productId: "1",
          name: "Paracetamol 500mg",
          price: 50000,
          quantity: 2,
        },
        {
          cartItemId: "102",
          productId: "2",
          name: "Vitamin C 1000mg",
          price: 120000,
          quantity: 1,
        },
      ],
    };

    const totalItems = mockCart.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = mockCart.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );

    expect(totalItems).toBe(3);
    expect(totalPrice).toBe(220000);
  });

  it("should handle empty cart gracefully", () => {
    const emptyCart = {
      cartId: "2",
      items: [],
    };

    const totalItems = emptyCart.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = emptyCart.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    );

    expect(totalItems).toBe(0);
    expect(totalPrice).toBe(0);
  });

  it("should handle optimistic item update in cart", () => {
    const prevCart = {
      items: [{ productId: "1", quantity: 2, price: 50000 }],
    };

    // Optimistic addition of 3 items
    const updatedItems = prevCart.items.map((item) =>
      item.productId === "1"
        ? { ...item, quantity: item.quantity + 3 }
        : item,
    );

    expect(updatedItems[0].quantity).toBe(5);
  });
});
