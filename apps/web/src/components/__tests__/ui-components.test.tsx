import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import "@testing-library/jest-dom"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

describe("UI Components", () => {
  describe("Button", () => {
    it("renders button with text", () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
    })

    it("renders button with different variants", () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole("button", { name: /secondary/i })).toBeInTheDocument()
    })

    it("renders button with different sizes", () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole("button", { name: /small/i })).toBeInTheDocument()
    })
  })

  describe("Card", () => {
    it("renders card with title and content", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card content</p>
          </CardContent>
        </Card>
      )
      expect(screen.getByText("Test Card")).toBeInTheDocument()
      expect(screen.getByText("Card content")).toBeInTheDocument()
    })
  })

  describe("Input", () => {
    it("renders input with placeholder", () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument()
    })

    it("renders input with different types", () => {
      render(<Input type="email" placeholder="Email" />)
      expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email")
    })
  })

  describe("Badge", () => {
    it("renders badge with text", () => {
      render(<Badge>New</Badge>)
      expect(screen.getByText("New")).toBeInTheDocument()
    })

    it("renders badge with different variants", () => {
      render(<Badge variant="success">Success</Badge>)
      expect(screen.getByText("Success")).toBeInTheDocument()
    })
  })

  describe("Label", () => {
    it("renders label with text", () => {
      render(<Label>Email</Label>)
      expect(screen.getByText("Email")).toBeInTheDocument()
    })
  })
})
