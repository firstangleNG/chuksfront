"use client"

import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, Users, FileText, Settings, LogOut, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { RepairService } from "@/lib/repair-service"

function DashboardContent() {
  const { user, logout } = useAuth()
  const [ticketStats, setTicketStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  })

  useEffect(() => {
    const tickets = RepairService.getTickets()
    setTicketStats({
      total: tickets.length,
      pending: tickets.filter((t) => t.status === "pending").length,
      inProgress: tickets.filter((t) => t.status === "in-progress").length,
      completed: tickets.filter((t) => t.status === "completed").length,
    })
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-red-100 text-red-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "customer":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getWelcomeMessage = (role: string) => {
    switch (role) {
      case "superadmin":
        return "You have full system access and can manage all aspects of RepairHub."
      case "admin":
        return "You can manage repair tickets, customers, and shop operations."
      case "customer":
        return "Track your repair requests and manage your account."
      default:
        return "Welcome to RepairHub!"
    }
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Wrench className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">RepairHub</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <Badge className={getRoleColor(user?.role || "")}>{user?.role?.toUpperCase()}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">{getWelcomeMessage(user?.role || "")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(user?.role === "superadmin" || user?.role === "admin") && (
            <>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Repair Tickets
                  </CardTitle>
                  <CardDescription>Manage and track repair requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">{ticketStats.total}</p>
                    <p className="text-sm text-muted-foreground">Total tickets</p>
                    <div className="flex gap-2 text-xs">
                      <span className="text-yellow-600">{ticketStats.pending} pending</span>
                      <span className="text-blue-600">{ticketStats.inProgress} in progress</span>
                      <span className="text-green-600">{ticketStats.completed} completed</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button asChild size="sm" className="flex-1">
                      <Link href="/admin/tickets">View All</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/admin/tickets">
                        <Plus className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customers
                  </CardTitle>
                  <CardDescription>View and manage customer accounts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Total customers</p>
                </CardContent>
              </Card>
            </>
          )}

          {user?.role === "customer" && (
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  My Repairs
                </CardTitle>
                <CardDescription>Track your repair requests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Active repairs</p>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>Configure your account and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Manage Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
