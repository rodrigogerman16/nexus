import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAutoCollapseSidebarOnTablet } from "@/hooks/useAutoCollapseSidebarOnTablet";
import { useUIStore } from "@/lib/store/useUIStore";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  // setState on a persisted store writes through to localStorage, so it
  // must run before the clear — otherwise the reset itself leaves behind
  // exactly the "user already has a preference" state these tests exist to
  // distinguish from a genuinely first-ever load.
  useUIStore.setState({ sidebarCollapsed: false });
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useAutoCollapseSidebarOnTablet", () => {
  it("collapses the sidebar on first load at a tablet width", () => {
    mockMatchMedia(true);
    renderHook(() => useAutoCollapseSidebarOnTablet());
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
  });

  it("leaves the sidebar expanded on first load outside the tablet range", () => {
    mockMatchMedia(false);
    renderHook(() => useAutoCollapseSidebarOnTablet());
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it("never overrides an existing persisted preference", () => {
    localStorage.setItem("acc-ui-store", JSON.stringify({ state: { sidebarCollapsed: false }, version: 0 }));
    mockMatchMedia(true);
    renderHook(() => useAutoCollapseSidebarOnTablet());
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });
});
