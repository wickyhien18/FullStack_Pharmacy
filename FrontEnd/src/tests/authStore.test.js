import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../stores/auth.store.js";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it("should initialize with default unauthenticated state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("should set user and token correctly on setAuth", () => {
    const mockUser = {
      userId: "1",
      email: "pharmacist@test.com",
      role: "ROLE_ADMIN",
    };
    const mockToken = "mock.jwt.token";

    useAuthStore.getState().setAuth(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem("hasSession")).toBe("true");
  });

  it("should update accessToken on setAccessToken", () => {
    const newToken = "refreshed.jwt.token";
    useAuthStore.getState().setAccessToken(newToken);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(newToken);
  });

  it("should reset state and clear session on clearAuth", () => {
    useAuthStore.getState().setAuth({ userId: "2" }, "temp.token");
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem("hasSession")).toBeNull();
  });
});
