"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RepairService } from "@/lib/repair-service"
import { NotificationService } from "@/lib/notification-service"
import type { RepairTicket, User } from "@/types"
import { Plus, Users, Phone, Mail, Printer, Send } from "lucide-react"

interface CustomerFormData {
  name: string
  email: string
  phone: string
  deviceBrand: string
  deviceModel: string
  deviceImei: string
  deviceSerial: string
  issueType: string
  issueDescription: string
  estimatedCost: number
  estimatedTime: number
}

function CustomersContent() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showTicket, setShowTicket] = useState(false)
  const [createdTicket, setCreatedTicket] = useState<RepairTicket | null>(null)
  const [customers, setCustomers] = useState<User[]>([])
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    deviceBrand: "",
    deviceModel: "",
    deviceImei: "",
    deviceSerial: "",
    issueType: "",
    issueDescription: "",
    estimatedCost: 0,
    estimatedTime: 1,
  })

  const issueTypes = [
    "Screen Replacement",
    "Battery Replacement",
    "Keyboard Repair",
    "Hard Drive Failure",
    "Software Issues",
    "Water Damage",
    "Charging Port",
    "Speaker/Audio",
    "Camera Issues",
    "Other",
  ]

  useEffect(() => {
    // Load existing customers (users with customer role)
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const customerUsers = users.filter((user: User) => user.role === "customer")
    setCustomers(customerUsers)
  }, [])

  const handleInputChange = (field: keyof CustomerFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Auto-calculate estimated cost and time based on issue type
    if (field === "issueType") {
      const costEstimates: Record<string, { cost: number; time: number }> = {
        "Screen Replacement": { cost: 150, time: 2 },
        "Battery Replacement": { cost: 80, time: 1 },
        "Keyboard Repair": { cost: 120, time: 3 },
        "Hard Drive Failure": { cost: 200, time: 5 },
        "Software Issues": { cost: 60, time: 2 },
        "Water Damage": { cost: 250, time: 7 },
        "Charging Port": { cost: 90, time: 2 },
        "Speaker/Audio": { cost: 70, time: 1 },
        "Camera Issues": { cost: 180, time: 3 },
        Other: { cost: 100, time: 3 },
      }

      const estimate = costEstimates[value as string] || { cost: 100, time: 3 }
      setFormData((prev) => ({
        ...prev,
        estimatedCost: estimate.cost,
        estimatedTime: estimate.time,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Create or find customer
      let customer = customers.find((c) => c.email === formData.email)

      if (!customer) {
        // Create new customer
        const users = JSON.parse(localStorage.getItem("users") || "[]")
        customer = {
          id: Date.now().toString(),
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: "customer",
          createdAt: new Date().toISOString(),
        }
        users.push(customer)
        localStorage.setItem("users", JSON.stringify(users))
        setCustomers((prev) => [...prev, customer!])
      }

      // Create repair ticket
      const ticket = RepairService.createTicket({
        customerId: customer.id,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        deviceBrand: formData.deviceBrand,
        deviceModel: formData.deviceModel,
        deviceImei: formData.deviceImei,
        deviceSerial: formData.deviceSerial,
        issueType: formData.issueType,
        issueDescription: formData.issueDescription,
        estimatedCost: formData.estimatedCost,
        estimatedTime: formData.estimatedTime,
        assignedTechnician: "FirstAngle",
        status: "Pending",
      })

      // Send notification
      await NotificationService.sendNotification(customer.id, "sms", "repair_created", {
        trackingId: ticket.trackingId,
        deviceModel: formData.deviceModel,
      })

      setCreatedTicket(ticket)
      setShowTicket(true)
      setShowCreateForm(false)

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        deviceBrand: "",
        deviceModel: "",
        deviceImei: "",
        deviceSerial: "",
        issueType: "",
        issueDescription: "",
        estimatedCost: 0,
        estimatedTime: 1,
      })
    } catch (error) {
      console.error("Error creating customer and ticket:", error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleEmail = async () => {
    if (createdTicket) {
      await NotificationService.sendNotification(createdTicket.customerId, "email", "repair_created", {
        trackingId: createdTicket.trackingId,
        deviceModel: createdTicket.deviceModel,
      })
      alert("Ticket details emailed to customer!")
    }
  }

  if (showTicket && createdTicket) {
    return (
      <div className="flex min-h-screen bg-muted/50">
        <AdminSidebar />
        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold">Repair Ticket Created</h1>
              <div className="flex gap-2">
                <Button onClick={handlePrint} variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button onClick={handleEmail}>
                  <Send className="h-4 w-4 mr-2" />
                  Email to Customer
                </Button>
                <Button onClick={() => setShowTicket(false)} variant="outline">
                  Back to Customers
                </Button>
              </div>
            </div>

            <Card className="print:shadow-none">
              <CardHeader className="text-center border-b">
                <CardTitle className="text-2xl">RepairHub</CardTitle>
                <CardDescription>Repair Service Ticket</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Customer Information</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong> {createdTicket.customerName}
                      </p>
                      <p>
                        <strong>Email:</strong> {createdTicket.customerEmail}
                      </p>
                      <p>
                        <strong>Phone:</strong> {createdTicket.customerPhone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Ticket Details</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Tracking ID:</strong> {createdTicket.trackingId}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(createdTicket.createdAt).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Status:</strong> <Badge>{createdTicket.status}</Badge>
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Device Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>
                      <strong>Brand:</strong> {createdTicket.deviceBrand}
                    </p>
                    <p>
                      <strong>Model:</strong> {createdTicket.deviceModel}
                    </p>
                    <p>
                      <strong>IMEI:</strong> {createdTicket.deviceImei}
                    </p>
                    <p>
                      <strong>Serial:</strong> {createdTicket.deviceSerial}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Repair Details</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Issue Type:</strong> {createdTicket.issueType}
                    </p>
                    <p>
                      <strong>Description:</strong> {createdTicket.issueDescription}
                    </p>
                    <p>
                      <strong>Assigned Technician:</strong> {createdTicket.assignedTechnician}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm">
                        <strong>Estimated Time:</strong> {createdTicket.estimatedTime} day(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">Estimated Cost: ${createdTicket.estimatedCost}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 text-xs text-muted-foreground">
                  <p>
                    Please keep this ticket for your records. You can track your repair status online using your
                    tracking ID.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
              <p className="text-muted-foreground">Manage customers and create repair requests</p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Customer & Repair
            </Button>
          </div>

          {showCreateForm ? (
            <Card>
              <CardHeader>
                <CardTitle>Create Customer & Repair Request</CardTitle>
                <CardDescription>Add a new customer and create their repair ticket</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Customer Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Device Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deviceBrand">Device Brand *</Label>
                        <Input
                          id="deviceBrand"
                          value={formData.deviceBrand}
                          onChange={(e) => handleInputChange("deviceBrand", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deviceModel">Device Model *</Label>
                        <Input
                          id="deviceModel"
                          value={formData.deviceModel}
                          onChange={(e) => handleInputChange("deviceModel", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deviceImei">IMEI Number</Label>
                        <Input
                          id="deviceImei"
                          value={formData.deviceImei}
                          onChange={(e) => handleInputChange("deviceImei", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deviceSerial">Serial Number</Label>
                        <Input
                          id="deviceSerial"
                          value={formData.deviceSerial}
                          onChange={(e) => handleInputChange("deviceSerial", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Repair Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="issueType">Issue Type *</Label>
                        <Select
                          value={formData.issueType}
                          onValueChange={(value) => handleInputChange("issueType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                          <SelectContent>
                            {issueTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="issueDescription">Issue Description *</Label>
                        <Textarea
                          id="issueDescription"
                          value={formData.issueDescription}
                          onChange={(e) => handleInputChange("issueDescription", e.target.value)}
                          rows={3}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
                          <Input
                            id="estimatedCost"
                            type="number"
                            value={formData.estimatedCost}
                            onChange={(e) => handleInputChange("estimatedCost", Number.parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="estimatedTime">Estimated Time (days)</Label>
                          <Input
                            id="estimatedTime"
                            type="number"
                            value={formData.estimatedTime}
                            onChange={(e) => handleInputChange("estimatedTime", Number.parseInt(e.target.value) || 1)}
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-6">
                    <Button type="submit">Create Customer & Ticket</Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customers.length === 0 ? (
                    <p className="text-muted-foreground">No customers yet</p>
                  ) : (
                    <div className="space-y-3">
                      {customers.slice(0, 5).map((customer) => (
                        <div key={customer.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </p>
                          </div>
                          <Badge variant="secondary">Customer</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Customers</span>
                      <span className="font-bold">{customers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New This Week</span>
                      <span className="font-bold">
                        {
                          customers.filter((c) => {
                            const weekAgo = new Date()
                            weekAgo.setDate(weekAgo.getDate() - 7)
                            return new Date(c.createdAt || "") > weekAgo
                          }).length
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function CustomersPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <CustomersContent />
    </ProtectedRoute>
  )
}
