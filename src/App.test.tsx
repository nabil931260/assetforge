import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App theme toggle", () => {
  it("switches the app shell between light and dark mode", async () => {
    const { container } = render(<App />);
    const appShell = container.querySelector(".app-shell");

    expect(appShell).toHaveAttribute("data-theme", "light");

    fireEvent.click(screen.getByLabelText("Dark mode"));

    expect(appShell).toHaveAttribute("data-theme", "dark");
  });
});
