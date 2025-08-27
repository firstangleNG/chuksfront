"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { RepairService } from "@/lib/repair-service"
import type { RepairTicket } from "@/types"
import { Search, Package, Clock, DollarSign, User, Phone, Mail, Wrench } from "lucide-react"

export default function TrackRepairPage() {
  const [trackingId, setTrackingId] = useState("")
  const [ticket, setTicket] = useState<RepairTicket | null>(null)
  const [error, setError] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingId.trim()) {
      setError("Please enter a tracking ID")
      return
    }

    setIsSearching(true)
    setError("")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundTicket = RepairService.getTicketByTrackingId(trackingId.trim())

    if (foundTicket) {
      setTicket(foundTicket)
    } else {
      setError("No repair found with this tracking ID. Please check and try again.")
      setTicket(null)
    }

    setIsSearching(false)
  }

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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return "Your device has been received and is waiting to be diagnosed."
      case "in-progress":
        return "Our technician is currently working on your device."
      case "completed":
        return "Your device repair is complete and ready for pickup!"
      case "cancelled":
        return "This repair request has been cancelled."
      default:
        return "Status unknown"
    }
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
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
              <Button variant="outline" asChild>
                <a href="/request">Request Repair</a>
              </Button>
              <Button asChild>
                <a href="/login">Login</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Track Your Repair</h2>
          <p className="text-muted-foreground">Enter your tracking ID to check the status of your repair</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Enter Tracking ID
            </CardTitle>
            <CardDescription>
              Your tracking ID was provided when you submitted your repair request (e.g., FA 244353646 NG)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trackingId">Tracking ID</Label>
                <Input
                  id="trackingId"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter your tracking ID"
                  className="text-center text-lg"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={isSearching} className="w-full">
                {isSearching ? "Searching..." : "Track Repair"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Repair Details */}
        {ticket && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{ticket.trackingId}</CardTitle>
                    <CardDescription>Repair Status</CardDescription>
                  </div>
                  <Badge className={getStatusColor(ticket.status)} variant="secondary">
                    {ticket.status.replace("-", " ").toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription className="text-base">{getStatusMessage(ticket.status)}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Device & Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Device Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Device</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.deviceBrand} {ticket.deviceModel}
                    </p>
                  </div>
                  {ticket.deviceImei && (
                    <div>
                      <p className="text-sm font-medium">IMEI</p>
                      <p className="text-sm text-muted-foreground">{ticket.deviceImei}</p>
                    </div>
                  )}
                  {ticket.deviceSerial && (
                    <div>
                      <p className="text-sm font-medium">Serial Number</p>
                      <p className="text-sm text-muted-foreground">{ticket.deviceSerial}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Issue Type</p>
                    <p className="text-sm text-muted-foreground">{ticket.issueType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Issue Description</p>
                    <p className="text-sm text-muted-foreground">{ticket.issueDescription}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Customer Name</p>
                    <p className="text-sm text-muted-foreground">{ticket.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="text-sm text-muted-foreground">{ticket.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </p>
                    <p className="text-sm text-muted-foreground">{ticket.customerPhone}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Repair Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Repair Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Estimated Cost
                    </p>
                    <p className="text-lg font-semibold">${ticket.estimatedCost}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Estimated Time</p>
                    <p className="text-lg font-semibold">{ticket.estimatedTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Assigned Technician</p>
                    <p className="text-lg font-semibold">{ticket.assignedTechnician}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()} at{" "}
                        {new Date(ticket.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-muted-foreground">
                        {new Date(ticket.updatedAt).toLocaleDateString()} at{" "}
                        {new Date(ticket.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  If you have any questions about your repair, please don't hesitate to contact us.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button variant="outline" asChild>
                    <a href="/support">Contact Support</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/request">Request Another Repair</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
