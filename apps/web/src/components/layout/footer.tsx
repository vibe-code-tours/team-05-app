'use client'

import * as React from 'react'
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const footerLinks = {
  quickLinks: [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Shipping', href: '/shipping' },
  ],
  categories: [
    { name: 'Electronics', href: '/category/electronics' },
    { name: 'Fashion', href: '/category/fashion' },
    { name: 'Beauty', href: '/category/beauty' },
    { name: 'Food', href: '/category/food' },
  ],
  customerService: [
    { name: 'Track Order', href: '/track-order' },
    { name: 'Returns', href: '/returns' },
    { name: 'Payment Methods', href: '/payment-methods' },
  ],
}

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { name: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
]

export interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const [email, setEmail] = React.useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      // Handle newsletter signup
      console.log('Newsletter signup:', email)
      setEmail('')
    }
  }

  return (
    <footer className={cn('bg-foreground text-background', className)}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold">CrossMart</span>
            </div>
            <p className="text-sm text-background/70 mb-4 leading-relaxed">
              Myanmar's Most Trusted Cross-Border Marketplace. Shop from Thailand
              and get it delivered to your doorstep.
            </p>
            <div className="flex flex-col gap-2 text-sm text-background/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Yangon, Myanmar</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+95 9 123 456 789</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@crossmart.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-background mb-4 uppercase tracking-wide text-sm">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-background mb-4 uppercase tracking-wide text-sm">
              Categories
            </h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service & Newsletter */}
          <div>
            <h3 className="font-semibold text-background mb-4 uppercase tracking-wide text-sm">
              Customer Service
            </h3>
            <ul className="space-y-2 mb-6">
              {footerLinks.customerService.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            {/* Newsletter Signup */}
            <div>
              <h3 className="font-semibold text-background mb-4 uppercase tracking-wide text-sm">
                Newsletter
              </h3>
              <p className="text-sm text-background/70 mb-3">
                Get updates on new arrivals and exclusive offers.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:border-background/40"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="text-sm text-background/70 text-center md:text-left">
              © {new Date().getFullYear()} CrossMart. All rights reserved.
            </div>

            {/* Social Media & Badge */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-background/70 hover:text-background transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>

              {/* Made in Myanmar Badge */}
              <div className="flex items-center gap-2 bg-background/10 px-3 py-1.5 rounded-full">
                <span className="text-sm font-medium">Made in Myanmar</span>
                <span className="text-lg" aria-label="Myanmar flag">
                  🇲🇲
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
