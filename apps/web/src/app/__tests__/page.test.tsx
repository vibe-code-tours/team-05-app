import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../page";

describe("Home page", () => {
  it("renders the CrossMart heading", () => {
    render(<Page />);
    // Multiple CrossMart headings exist (Header logo + Footer logo)
    const headings = screen.getAllByText("CrossMart");
    expect(headings.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the homepage sections", () => {
    render(<Page />);
    expect(screen.getByText("Featured Products")).toBeDefined();
    expect(screen.getByText("Browse Categories")).toBeDefined();
    // "New Arrivals" may appear in hero banner and promo sections
    const newArrivals = screen.getAllByText("New Arrivals");
    expect(newArrivals.length).toBeGreaterThanOrEqual(1);
  });
});
