import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Navbar } from "../../components/ui/Navbar";
import { Footer } from "../../layout/Footer";

interface WishlistItem {
  id: string;
  name: string;
  category: string;
  status: string;
}

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // TODO: Fetch wishlist items from API
    setItems([
      { id: "1", name: "Blue Jacket", category: "Outerwear", status: "active" },
      { id: "2", name: "Sneakers", category: "Shoes", status: "active" },
    ]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar currentPage="/wishlist" onNavigate={() => {}} onLogout={() => {}} />
      <main className="flex-1 p-8">
        <Card>
          <CardHeader>
            <CardTitle>My Wishlist</CardTitle>
            <Input
              placeholder="Search wishlist..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items
                .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
                .map(item => (
                  <Card key={item.id} className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{item.name}</span>
                      <Badge variant="success">{item.status}</Badge>
                    </div>
                    <span className="text-sm text-neutral-500">{item.category}</span>
                    <Button variant="outline" size="sm">Remove</Button>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
