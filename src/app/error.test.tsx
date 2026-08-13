import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

import ErrorPage from "@/app/error";

describe("ErrorPage", () => {
  it("shows the fallback message and logs the error", () => {
    const error = Object.assign(new Error("boom"), { digest: "abc123" });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<ErrorPage error={error} reset={vi.fn()} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });

  it("calls reset when 'Try again' is clicked", async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<ErrorPage error={new Error("boom")} reset={reset} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("navigates home when 'Go home' is clicked", async () => {
    push.mockClear();
    const user = userEvent.setup();
    render(<ErrorPage error={new Error("boom")} reset={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Go home" }));
    expect(push).toHaveBeenCalledWith("/");
  });
});
