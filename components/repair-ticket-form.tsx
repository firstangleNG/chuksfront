"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"
import { RepairService } from "@/lib/repair-service"
import type { RepairTicket } from "@/types"

interface RepairTicketFormProps {
  editTicket?: RepairTicket
  onSuccess?: (ticket: RepairTicket) => void
  onCancel?: () => void
}

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

const statusOptions = ["Diagnosing", "Waiting for Customer Response", "Waiting for Payment", "Waiting for Parts", "In Progress", "Completed"]

const paymentMethods = ["Cash", "Bank Transfer", "Card"]

export function RepairTicketForm({ editTicket, onSuccess, onCancel }: RepairTicketFormProps) {
  const [formData, setFormData] = useState({
  firstname: "",
  surname: "",
    customerEmail: "",
    customerPhone: "",
    deviceBrand: "",
    deviceModel: "",
    deviceImei: "",
    deviceSerial: "",
    issueType: "",
    issueDescription: "",
    estimatedCost: "",
    estimatedTime: "",
    status: "Diagnosing", // Default to first option
  })

  const [vatRate, setVatRate] = useState<number>(0) // 0% or 20%
  const [payments, setPayments] = useState<
    Array<{
      id: string
      method: string
      amount: number
      date: string
    }>
  >([])
  const [newPayment, setNewPayment] = useState({
    method: "",
    amount: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const estimatedCost = Number(formData.estimatedCost) || 0
  const vatAmount = estimatedCost * (vatRate / 100)
  const grandTotal = estimatedCost + vatAmount
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const balanceDue = grandTotal - totalPaid

  useEffect(() => {
    if (editTicket) {
      setFormData({
  firstname: editTicket.customerFirstname || editTicket.customerName || "",
  surname: editTicket.customerSurname || "",
        customerEmail: editTicket.customerEmail,
        customerPhone: editTicket.customerPhone,
        deviceBrand: editTicket.deviceBrand,
        deviceModel: editTicket.deviceModel,
        deviceImei: editTicket.deviceImei || "",
        deviceSerial: editTicket.deviceSerial || "",
        issueType: editTicket.issueType,
        issueDescription: editTicket.issueDescription,
        estimatedCost: editTicket.estimatedCost.toString(),
        estimatedTime: editTicket.estimatedTime,
        status: editTicket.status,
      })
      if (editTicket.payments) {
        setPayments(
          editTicket.payments.map((p) => ({
            id: p.id,
            method: p.method,
            amount: p.amount,
            date: p.date,
          })),
        )
      }
    }
  }, [editTicket])

  const addPayment = () => {
    if (!newPayment.method || !newPayment.amount || isNaN(Number(newPayment.amount))) {
      return
    }

    const payment = {
      id: Date.now().toString(),
      method: newPayment.method,
      amount: Number(newPayment.amount),
      date: new Date().toISOString(),
    }

    setPayments((prev) => [...prev, payment])
    setNewPayment({ method: "", amount: "" })
  }

  const removePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

  if (!formData.firstname.trim()) newErrors.firstname = "First name is required"
  if (!formData.surname.trim()) newErrors.surname = "Surname is required"
    if (!formData.customerEmail.trim()) newErrors.customerEmail = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) newErrors.customerEmail = "Invalid email format"
    if (!formData.customerPhone.trim()) newErrors.customerPhone = "Phone number is required"
    if (!formData.deviceBrand.trim()) newErrors.deviceBrand = "Device brand is required"
    if (!formData.deviceModel.trim()) newErrors.deviceModel = "Device model is required"
    if (!formData.issueType) newErrors.issueType = "Issue type is required"
    if (!formData.issueDescription.trim()) newErrors.issueDescription = "Issue description is required"
    if (!formData.estimatedCost || isNaN(Number(formData.estimatedCost))) {
      newErrors.estimatedCost = "Valid estimated cost is required"
    }
    if (!formData.estimatedTime.trim()) newErrors.estimatedTime = "Estimated time is required"
    if (!formData.status) newErrors.status = "Status is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      let ticket: RepairTicket

      const ticketData = {
  // keep legacy customerName for compatibility
  customerName: `${formData.firstname} ${formData.surname}`.trim(),
  customerFirstname: formData.firstname,
  customerSurname: formData.surname,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        deviceBrand: formData.deviceBrand,
        deviceModel: formData.deviceModel,
        deviceImei: formData.deviceImei,
        deviceSerial: formData.deviceSerial,
        issueType: formData.issueType,
        issueDescription: formData.issueDescription,
        estimatedCost: Number(formData.estimatedCost),
        estimatedTime: formData.estimatedTime,
        vatRate,
        grandTotal,
        totalPaid,
        balanceDue,
        payments: payments.map((p) => ({
          id: p.id,
          method: p.method,
          amount: p.amount,
          date: p.date,
        })),
      }

      if (editTicket) {
        const updatedTicket = RepairService.updateTicket(editTicket.id, ticketData)
        if (!updatedTicket) {
          throw new Error("Failed to update ticket")
        }
        ticket = updatedTicket
      } else {
        ticket = RepairService.createTicket({
          customerId: "walk-in",
          ...ticketData,
          assignedTechnician: "FirstAngle",
          status: formData.status,
        })
      }

      onSuccess?.(ticket)
    } catch (error) {
      console.error("Error saving ticket:", error)
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{editTicket ? "Edit Repair Ticket" : "Create New Repair Ticket"}</CardTitle>
        <CardDescription>
          {editTicket ? "Update the repair ticket details" : "Fill in the details to create a new repair request"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname">First Name *</Label>
                <Input
                  id="firstname"
                  value={formData.firstname}
                  onChange={(e) => handleInputChange("firstname", e.target.value)}
                  placeholder="Enter first name"
                />
                {errors.firstname && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.firstname}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Surname *</Label>
                <Input
                  id="surname"
                  value={formData.surname}
                  onChange={(e) => handleInputChange("surname", e.target.value)}
                  placeholder="Enter surname"
                />
                {errors.surname && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.surname}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                  placeholder="Enter email address"
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
                  placeholder="Enter phone number"
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
                <Label htmlFor="deviceImei">IMEI Number</Label>
                <Input
                  id="deviceImei"
                  value={formData.deviceImei}
                  onChange={(e) => handleInputChange("deviceImei", e.target.value)}
                  placeholder="Enter IMEI number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceSerial">Serial Number</Label>
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
              <Label htmlFor="issueType">Issue Type *</Label>
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
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
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
                placeholder="Describe the issue in detail"
                rows={3}
              />
              {errors.issueDescription && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.issueDescription}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimatedCost">Estimated Cost (£) *</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => handleInputChange("estimatedCost", e.target.value)}
                  placeholder="0.00"
                />
                {errors.estimatedCost && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.estimatedCost}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedTime">Estimated Time *</Label>
                <Input
                  id="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={(e) => handleInputChange("estimatedTime", e.target.value)}
                  placeholder="e.g., 2-3 business days"
                />
                {errors.estimatedTime && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.estimatedTime}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment System</h3>

            {/* VAT Selection */}
            <div className="space-y-2">
              <Label>VAT Rate</Label>
              <Select value={vatRate.toString()} onValueChange={(value) => setVatRate(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select VAT rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% VAT</SelectItem>
                  <SelectItem value="20">20% VAT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Estimated Cost:</span>
                <span>£{estimatedCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT ({vatRate}%):</span>
                <span>£{vatAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Grand Total:</span>
                <span>£{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Add Payment Form */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Add Payment</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={newPayment.method}
                    onValueChange={(value) => setNewPayment((prev) => ({ ...prev, method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (£)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="button" onClick={addPayment} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment
                  </Button>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Payment History</h4>
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{payment.method}</Badge>
                        <span>£{payment.amount.toFixed(2)}</span>
                        <span className="text-sm text-gray-500">{new Date(payment.date).toLocaleDateString()}</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePayment(payment.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Balance Summary */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-medium text-green-600">£{totalPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Balance Due:</span>
                <span className={`font-medium ${balanceDue > 0 ? "text-red-600" : "text-green-600"}`}>
                  £{balanceDue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? editTicket
                  ? "Updating Ticket..."
                  : "Creating Ticket..."
                : editTicket
                  ? "Update Ticket"
                  : "Create Ticket"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}