export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">
          CrossMart
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Myanmar&apos;s Most Trusted Cross-Border Marketplace
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl border p-6 shadow-sm">
            <h3 className="font-semibold mb-2">🛒 In Stock</h3>
            <p className="text-muted-foreground">
              Local products ready to ship
            </p>
          </div>
          <div className="rounded-2xl border p-6 shadow-sm">
            <h3 className="font-semibold mb-2">✈️ Cargo</h3>
            <p className="text-muted-foreground">
              Cross-border from Bangkok, China, Japan
            </p>
          </div>
          <div className="rounded-2xl border p-6 shadow-sm">
            <h3 className="font-semibold mb-2">🔥 Promotions</h3>
            <p className="text-muted-foreground">
              Deals and flash sales
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
