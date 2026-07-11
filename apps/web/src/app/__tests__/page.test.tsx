import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";

describe("Home page", () => {
  it("renders the CrossMart heading", () => {
    render(<Page />);
    expect(screen.getByText("CrossMart")).toBeDefined();
  });
});
