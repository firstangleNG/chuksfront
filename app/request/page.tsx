"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RepairService } from "@/lib/repair-service"
import type { RepairTicket } from "@/types"
import { Wrench, CheckCircle } from "lucide-react"

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

export default function RequestRepairPage() {
  const [view, setView] = useState<"form" | "success">("form")
  const [createdTicket, setCreatedTicket] = useState<RepairTicket | null>(null)
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    deviceBrand: "",
    deviceModel: "",
    deviceImei: "",
    deviceSerial: "",
    issueType: "",
    issueDescription: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) newErrors.customerName = "Name is required"
    if (!formData.customerEmail.trim()) newErrors.customerEmail = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) newErrors.customerEmail = "Invalid email format"
    if (!formData.customerPhone.trim()) newErrors.customerPhone = "Phone number is required"
    if (!formData.deviceBrand.trim()) newErrors.deviceBrand = "Device brand is required"
    if (!formData.deviceModel.trim()) newErrors.deviceModel = "Device model is required"
    if (!formData.issueType) newErrors.issueType = "Issue type is required"
    if (!formData.issueDescription.trim()) newErrors.issueDescription = "Issue description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const ticket = RepairService.createTicket({
        customerId: "online-customer",
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        deviceBrand: formData.deviceBrand,
        deviceModel: formData.deviceModel,
        deviceImei: formData.deviceImei,
        deviceSerial: formData.deviceSerial,
        issueType: formData.issueType,
        issueDescription: formData.issueDescription,
        estimatedCost: 0, // Will be updated by admin
        estimatedTime: "To be determined",
        assignedTechnician: "FirstAngle",
        status: "pending",
      })

      setCreatedTicket(ticket)
      setView("success")
    } catch (error) {
      console.error("Error creating ticket:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (view === "success" && createdTicket) {
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
                  <a href="/track">Track Repair</a>
                </Button>
                <Button asChild>
                  <a href="/login">Login</a>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">Request Submitted Successfully!</CardTitle>
              <CardDescription>Your repair request has been received and is being processed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-center mb-4">
                  <p className="text-sm font-medium">Your Tracking ID</p>
                  <p className="text-2xl font-bold text-primary">{createdTicket.trackingId}</p>
                </div>
                <Alert>
                  <AlertDescription>
                    <strong>Important:</strong> Please save this tracking ID. You can use it to check the status of your
                    repair at any time.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">What happens next?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Bring your device to our shop</p>
                      <p className="text-muted-foreground">Visit us with your device and mention your tracking ID</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Device diagnosis</p>
                      <p className="text-muted-foreground">
                        Our technician will examine your device and provide a quote
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Repair process</p>
                      <p className="text-muted-foreground">Once approved, we'll start working on your device</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Pickup notification</p>
                      <p className="text-muted-foreground">We'll notify you when your device is ready</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button asChild className="flex-1">
                  <a href="/track">Track Your Repair</a>
                </Button>
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <a href="/request">Submit Another Request</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
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
                <a href="/track">Track Repair</a>
              </Button>
              <Button asChild>
                <a href="/login">Login</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Request a Repair</h2>
          <p className="text-muted-foreground">Fill out the form below to submit your repair request</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Repair Request Form</CardTitle>
            <CardDescription>Please provide accurate information to help us serve you better</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Your Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      placeholder="Enter your full name"
                    />
                    {errors.customerName && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.customerName}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email Address *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                      placeholder="Enter your email address"
                    />
                    {errors.customerEmail && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.customerEmail}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                    {errors.customerPhone && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.customerPhone}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Device Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceBrand">Brand *</Label>
                    <Input
                      id="deviceBrand"
                      value={formData.deviceBrand}
                      onChange={(e) => handleInputChange("deviceBrand", e.target.value)}
                      placeholder="e.g., Apple, Samsung, HP"
                    />
                    {errors.deviceBrand && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.deviceBrand}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deviceModel">Model *</Label>
                    <Input
                      id="deviceModel"
                      value={formData.deviceModel}
                      onChange={(e) => handleInputChange("deviceModel", e.target.value)}
                      placeholder="e.g., iPhone 14, Galaxy S23"
                    />
                    {errors.deviceModel && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.deviceModel}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="deviceImei">IMEI Number (Optional)</Label>
                    <Input
                      id="deviceImei"
                      value={formData.deviceImei}
                      onChange={(e) => handleInputChange("deviceImei", e.target.value)}
                      placeholder="Enter IMEI number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deviceSerial">Serial Number (Optional)</Label>
                    <Input
                      id="deviceSerial"
                      value={formData.deviceSerial}
                      onChange={(e) => handleInputChange("deviceSerial", e.target.value)}
                      placeholder="Enter serial number"
                    />
                  </div>
                </div>
              </div>

              {/* Issue Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Issue Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="issueType">What type of issue are you experiencing? *</Label>
                  <Select value={formData.issueType} onValueChange={(value) => handleInputChange("issueType", value)}>
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
                  {errors.issueType && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.issueType}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueDescription">Describe the issue in detail *</Label>
                  <Textarea
                    id="issueDescription"
                    value={formData.issueDescription}
                    onChange={(e) => handleInputChange("issueDescription", e.target.value)}
                    placeholder="Please describe what happened, when it started, and any other relevant details..."
                    rows={4}
                  />
                  {errors.issueDescription && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.issueDescription}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>Note:</strong> This is an online request form. You will need to bring your device to our shop
                  for diagnosis and repair. We'll provide you with a quote and timeline once we examine your device.
                </AlertDescription>
              </Alert>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting Request..." : "Submit Repair Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
