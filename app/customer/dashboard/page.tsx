"use client"

import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RepairService } from "@/lib/repair-service"
import { NotificationPreferencesComponent } from "@/components/notification-preferences"
import { NotificationHistory } from "@/components/notification-history"
import { useEffect, useState } from "react"
import type { RepairTicket } from "@/types"
import { Wrench, FileText, Plus, Eye, LogOut, Phone, Mail, Settings } from "lucide-react"
import Link from "next/link"

function CustomerDashboardContent() {
  const { user, logout } = useAuth()
  const [userTickets, setUserTickets] = useState<RepairTicket[]>([])

  useEffect(() => {
    if (user) {
      // In a real app, this would filter by actual customer ID
      const tickets = RepairService.getTickets().filter((ticket) => ticket.customerEmail === user.email)
      setUserTickets(tickets)
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
              <h1 className="text-xl font-bold">Chukticketingsystem</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <Badge className="bg-green-100 text-green-800">CUSTOMER</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-muted-foreground">Track your repair requests and manage your account</p>
        </div>

        <Tabs defaultValue="repairs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="repairs">My Repairs</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Settings</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="repairs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild className="w-full">
                      <Link href="/request">
                        <Plus className="h-4 w-4 mr-2" />
                        New Repair Request
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/track">
                        <Eye className="h-4 w-4 mr-2" />
                        Track Repair
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full bg-transparent">
                      <Link href="/support">
                        <Phone className="h-4 w-4 mr-2" />
                        Contact Support
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Repair History */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          My Repair Requests
                        </CardTitle>
                        <CardDescription>Track the status of your repair requests</CardDescription>
                      </div>
                      <Badge variant="secondary">{userTickets.length} Total</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userTickets.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">No repair requests found</p>
                        <Button asChild>
                          <Link href="/request">Submit Your First Repair Request</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userTickets.map((ticket) => (
                          <div key={ticket.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <p className="font-semibold">{ticket.trackingId}</p>
                                <p className="text-sm text-muted-foreground">
                                  {ticket.deviceBrand} {ticket.deviceModel}
                                </p>
                              </div>
                              <Badge className={getStatusColor(ticket.status)} variant="secondary">
                                {ticket.status.replace("-", " ").toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Issue Type</p>
                                <p className="text-sm">{ticket.issueType}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Estimated Cost</p>
                                <p className="text-sm">£{ticket.estimatedCost}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">Created</p>
                                <p className="text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="mb-3">
                              <p className="text-xs font-medium text-muted-foreground">Issue Description</p>
                              <p className="text-sm">{ticket.issueDescription}</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/track?id=${ticket.trackingId}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">{user && <NotificationHistory userId={user.id} />}</TabsContent>

          <TabsContent value="preferences">{user && <NotificationPreferencesComponent userId={user.id} />}</TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>Your account details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Full Name</p>
                    <p className="text-sm text-muted-foreground">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Account Type</p>
                    <Badge className="bg-green-100 text-green-800">CUSTOMER</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </p>
                    <p className="text-sm text-muted-foreground">{user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Repairs</p>
                    <p className="text-sm text-muted-foreground">{userTickets.length} requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <CustomerDashboardContent />
    </ProtectedRoute>
  )
}
