import { describe, it, expect } from "vitest";
import { translateApiMessage } from "../utils/errorMessages.js";

describe("translateApiMessage", () => {
  it("should return empty string for falsy values", () => {
    expect(translateApiMessage(null)).toBe("");
    expect(translateApiMessage(undefined)).toBe("");
    expect(translateApiMessage("")).toBe("");
  });

  it("should translate exact authentication error messages", () => {
    expect(translateApiMessage("Email is already in use")).toBe(
      "Email này đã được sử dụng",
    );
    expect(translateApiMessage("Username is already in use")).toBe(
      "Tên đăng nhập này đã được sử dụng",
    );
    expect(translateApiMessage("Phone number is already in use")).toBe(
      "Số điện thoại này đã được sử dụng",
    );
    expect(translateApiMessage("Email or password is incorrect")).toBe(
      "Email hoặc mật khẩu không chính xác",
    );
    expect(translateApiMessage("Account is locked")).toBe(
      "Tài khoản của bạn hiện đang bị khóa",
    );
  });

  it("should translate success messages from backend", () => {
    expect(translateApiMessage("User registered successfully")).toBe(
      "Đăng ký tài khoản thành công!",
    );
    expect(translateApiMessage("Login successfully")).toBe(
      "Đăng nhập thành công!",
    );
    expect(translateApiMessage("Order created successfully")).toBe(
      "Tạo đơn hàng thành công!",
    );
    expect(translateApiMessage("Item added to cart successfully")).toBe(
      "Đã thêm sản phẩm vào giỏ hàng!",
    );
  });

  it("should translate Zod schema validation errors", () => {
    expect(translateApiMessage("Username must be at least 3 characters")).toBe(
      "Tên đăng nhập phải có ít nhất 3 ký tự",
    );
    expect(translateApiMessage("Invalid email address")).toBe(
      "Địa chỉ email không hợp lệ",
    );
    expect(translateApiMessage("Invalid Vietnamese phone number")).toBe(
      "Số điện thoại chưa đúng chuẩn Việt Nam",
    );
  });

  it("should translate array of error messages", () => {
    const errors = ["Invalid email address", "Password is required"];
    const result = translateApiMessage(errors);
    expect(result).toBe("Địa chỉ email không hợp lệ, Vui lòng nhập mật khẩu");
  });

  it("should support pattern matching for dynamic backend strings", () => {
    const dynamicMsg = "Error: Email is already in use by another user";
    expect(translateApiMessage(dynamicMsg)).toBe("Email này đã được sử dụng");
  });

  it("should fallback to original message for untranslated strings", () => {
    const customMsg = "Some untranslated custom backend message";
    expect(translateApiMessage(customMsg)).toBe(customMsg);
  });
});
