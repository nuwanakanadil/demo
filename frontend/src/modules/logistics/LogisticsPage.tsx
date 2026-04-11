import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Navbar } from "../../components/ui/Navbar";
import { Footer } from "../../layout/Footer";

interface LogisticsItem {
  id: string;
  name: string;
  status: string;
  location: string;
}

export function LogisticsPage() {
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // TODO: Fetch logistics items from API
    setItems([
      { id: "1", name: "Order #123", status: "in transit", location: "Colombo" },
      { id: "2", name: "Order #456", status: "delivered", location: "Kandy" },
    ]);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar currentPage="/logistics" onNavigate={() => {}} onLogout={() => {}} />
      <main className="flex-1 p-8">
        <Card>
          <CardHeader>
            <CardTitle>Logistics</CardTitle>
            <Input
              placeholder="Search logistics..."
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
                      <Badge variant={item.status === "delivered" ? "success" : "warning"}>{item.status}</Badge>
                    </div>
                    <span className="text-sm text-neutral-500">{item.location}</span>
                    <Button variant="outline" size="sm">View Details</Button>
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
