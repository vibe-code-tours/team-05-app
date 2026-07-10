# Marketplace Domain

## Overview

The marketplace is a multi-vendor platform where sellers list products and clients purchase them. It serves as the central hub connecting sellers and buyers, providing product discovery, comparison, and purchasing capabilities.

---

## Product Types

| Type | Description |
|------|-------------|
| **In Stock** | Products physically held by the seller, ready to ship immediately |
| **Cargo** | Products imported or shipped from overseas (e.g., Thailand, China), available via cargo delivery pipeline |
| **Promotion Opportunity** | Discounted or promotional listings offered by sellers for a limited time |
| **Preorder** | Products available for advance booking before physical stock arrives |
| **Local** | Products sourced and delivered locally within Myanmar |
| **Used** | Second-hand or pre-owned products listed by sellers |

---

## Categories

The marketplace organizes products into the following categories:

| Category | Description |
|----------|-------------|
| **Camera** | DSLR, mirrorless, action cameras, lenses, and camera accessories |
| **Microphone** | Condenser, dynamic, lavalier, shotgun microphones, and audio interfaces |
| **Laptop** | Notebooks, ultrabooks, gaming laptops, and laptop accessories |
| **Phone** | Smartphones, feature phones, cases, chargers, and mobile accessories |
| **Gaming** | Consoles, controllers, gaming headsets, keyboards, mice, and peripherals |
| **Drone** | Consumer and professional drones, parts, and accessories |
| **Storage** | External drives, SSDs, USB drives, memory cards, and NAS devices |
| **Audio** | Speakers, headphones, earbuds, amplifiers, and audio equipment |
| **Lighting** | Studio lights, LED panels, ring lights, and lighting accessories |

---

## Search and Filter Rules

### Filter Dimensions

Users can search and filter products across the following dimensions:

| Filter | Type | Description |
|--------|------|-------------|
| **Category** | Single/Multi-select | Filter by product category (Camera, Laptop, etc.) |
| **Brand** | Single/Multi-select | Filter by brand name (e.g., Sony, Apple, Samsung) |
| **Country** | Single/Multi-select | Filter by product origin or seller country |
| **Price** | Range (min/max) | Filter by price range in MMK or converted currency |
| **Availability** | Toggle | Filter by in-stock or available items only |
| **Promotion** | Toggle | Show only promotional or discounted products |
| **Delivery Time** | Range (min/max) | Filter by estimated delivery timeframe |
| **Rating** | Minimum value | Filter by minimum average review rating |

### Search Behavior

- Full-text search across product name, description, and brand
- Results ranked by relevance, popularity, and recency
- Search suggestions appear as users type
- Recent search history is saved per user account
- Category and brand filters can be combined with text search
- Price filter accepts MMK input with automatic currency conversion for international users

### Sorting Options

| Sort Option | Description |
|-------------|-------------|
| **Relevance** | Default sort based on search match quality |
| **Price: Low to High** | Ascending price order |
| **Price: High to Low** | Descending price order |
| **Rating** | Highest rated products first |
| **Newest** | Most recently listed products first |
| **Popularity** | Most viewed or most ordered products first |

---

## Marketplace Rules

- Sellers must be verified to list products (see [Seller Domain](./seller.md))
- All products require admin approval before appearing in search results
- Product listings must comply with marketplace content policies
- Pricing must be in MMK or clearly marked with conversion rates
- Sellers are responsible for accurate product descriptions and images
- Marketplace commission is applied at checkout (see [Payment Domain](./payment.md))
