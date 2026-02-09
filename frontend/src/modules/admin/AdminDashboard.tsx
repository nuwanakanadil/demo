import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Users, Shirt, ArrowLeftRight, TrendingUp } from 'lucide-react';
export function AdminDashboard() {
  const stats = [
  {
    title: 'Total Users',
    value: '1,234',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  },
  {
    title: 'Apparel Listed',
    value: '3,567',
    icon: Shirt,
    color: 'text-green-600',
    bg: 'bg-green-100'
  },
  {
    title: 'Swaps Completed',
    value: '892',
    icon: ArrowLeftRight,
    color: 'text-purple-600',
    bg: 'bg-purple-100'
  },
  {
    title: 'Active Requests',
    value: '156',
    icon: TrendingUp,
    color: 'text-orange-600',
    bg: 'bg-orange-100'
  }];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) =>
        <Card key={index}>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) =>
              <div
                key={i}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">

                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                      U{i}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        User {i} listed a new item
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Server Uptime</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: '99.9%'
                    }}>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage Usage</span>
                  <span className="font-medium text-brand-600">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{
                      width: '45%'
                    }}>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

}