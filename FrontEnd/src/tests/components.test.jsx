import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ErrorBoundary from "../components/ErrorBoundary.jsx";

// Mock react-router-dom Link
vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/", search: "" }),
}));

describe("Frontend Component Tests", () => {
  it("renders ErrorBoundary and catches rendering errors cleanly", () => {
    const BadComponent = () => {
      throw new Error("Test render crash");
    };

    // Suppress console.error for expected test crash
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BadComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Có lỗi xảy ra")).toBeInTheDocument();
    expect(screen.getByText("Tải lại trang")).toBeInTheDocument();

    spy.mockRestore();
  });
});
