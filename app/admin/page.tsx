"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AnalyticsService } from "@/lib/analytics-service"
import { InventoryService } from "@/lib/inventory-service"
import type { DashboardStats, InventoryItem } from "@/types"
import { FileText, Clock, CheckCircle, DollarSign, TrendingUp, AlertTriangle, Package, Users, Plus } from "lucide-react"
import Link from "next/link"

function AdminDashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])

  useEffect(() => {
    const dashboardStats = AnalyticsService.getDashboardStats()
    const lowStock = InventoryService.getLowStockItems()

    setStats(dashboardStats)
    setLowStockItems(lowStock)
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/50">
      <AdminSidebar />

      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Overview of your repair shop operations</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTickets}</div>
                <p className="text-xs text-muted-foreground">All repair requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingTickets}</div>
                <p className="text-xs text-muted-foreground">Awaiting diagnosis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgressTickets}</div>
                <p className="text-xs text-muted-foreground">Being repaired</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedTickets}</div>
                <p className="text-xs text-muted-foreground">Ready for pickup</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue and Weekly Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold">£{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">This Week</p>
                    <p className="text-lg font-semibold">£{stats.weeklyStats.incomeThisWeek.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">This Month</p>
                    <p className="text-lg font-semibold">£{stats.monthlyStats.incomeThisMonth.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Weekly Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Repairs</p>
                    <p className="text-xl font-bold">{stats.weeklyStats.repairsThisWeek}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Income</p>
                    <p className="text-xl font-bold">£{stats.weeklyStats.incomeThisWeek.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cancelled</p>
                    <p className="text-xl font-bold text-red-600">{stats.weeklyStats.cancellationsThisWeek}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Inventory Alerts
                </CardTitle>
                <CardDescription>Items running low on stock</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">All items are well stocked</p>
                ) : (
                  <div className="space-y-3">
                    {lowStockItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{item.partName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantityAvailable} left (min: {item.lowStockThreshold})
                          </p>
                        </div>
                        <Badge variant="destructive">Low Stock</Badge>
                      </div>
                    ))}
                    {lowStockItems.length > 3 && (
                      <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                        <Link href="/admin/inventory">View All ({lowStockItems.length} items)</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/admin/tickets">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Ticket
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/admin/customers">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Customers
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/admin/inventory">
                    <Package className="h-4 w-4 mr-2" />
                    Update Inventory
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
