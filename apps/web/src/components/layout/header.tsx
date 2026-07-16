'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X, ChevronRight, Heart, Package, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/lib/services/cart.service';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/products?category=electronics', label: 'Categories' },
  { href: '/seller/cargo', label: 'Cargo Tracking' },
  { href: '/products?sort=deals', label: 'Deals' },
];

const popularSearches = [
  'Thai Skincare',
  'Electronics',
  'Fashion',
  'Beauty Products',
  'Home Decor',
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: cart } = useCart();
  const cartItemCount = cart?.data?.itemCount ?? 0;
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchFocus = () => {
    if (searchQuery.length === 0) {
      setShowSearchSuggestions(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchSuggestions(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSearchSuggestions(false);
    window.location.href = `/products?search=${encodeURIComponent(suggestion)}`;
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled
        ? 'bg-background/98 backdrop-blur-lg shadow-sm border-b'
        : 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:block">CrossMart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products, brands..."
                className="pl-10 pr-4 h-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
              />

              {/* Search Suggestions Dropdown */}
              {showSearchSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50">
                  {searchQuery.length === 0 ? (
                    <div className="p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                        Popular Searches
                      </p>
                      <div className="space-y-1">
                        {popularSearches.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                          >
                            <Search className="h-4 w-4 text-muted-foreground" />
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-2">
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition-colors text-left"
                      >
                        <Search className="h-4 w-4 text-muted-foreground" />
                        Search for &ldquo;{searchQuery}&rdquo;
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Wishlist */}
            <Button variant="ghost" size="icon" className="relative hidden sm:flex" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary text-primary-foreground animate-pulse">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="px-3 py-2 border-b mb-2">
                  <p className="text-sm font-medium">Guest User</p>
                  <p className="text-xs text-muted-foreground">Sign in for the best experience</p>
                </div>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/login" className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sign In
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/register" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Create Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/profile" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/orders" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg">
                  <Link href="/wishlist" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Wishlist
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search - Visible on smaller screens */}
        <div className="lg:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden border-t bg-background overflow-hidden transition-all duration-300 ${
        mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <nav className="container mx-auto px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ))}
          <div className="pt-2 border-t mt-2">
            <Link
              href="/wishlist"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="h-4 w-4" />
              Wishlist
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
