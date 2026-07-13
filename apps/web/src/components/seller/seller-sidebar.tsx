"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Ship,
  BarChart3,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SellerSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/seller",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/seller/products",
    icon: Package,
  },
  {
    label: "Orders",
    href: "/seller/orders",
    icon: ShoppingCart,
  },
  {
    label: "Cargo",
    href: "/seller/cargo",
    icon: Ship,
  },
  {
    label: "Reports",
    href: "/seller/reports",
    icon: BarChart3,
  },
];

export function SellerSidebar({ collapsed = false, onToggle }: SellerSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/seller") {
      return pathname === "/seller";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight">Seller Panel</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Sidebar Footer */}
      <div className="p-4">
        {!collapsed && (
          <p className="text-xs text-muted-foreground">
            CrossMart Seller v1.0
          </p>
        )}
      </div>
    </aside>
  );
}
