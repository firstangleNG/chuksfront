"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InvoiceService } from "@/lib/invoice-service"
import type { RepairTicket, Invoice } from "@/types"
import { FileText, DollarSign } from "lucide-react"

interface InvoiceGeneratorProps {
  ticket: RepairTicket
  onInvoiceGenerated?: (invoice: Invoice) => void
  onCancel?: () => void
}

export function InvoiceGenerator({ ticket, onInvoiceGenerated, onCancel }: InvoiceGeneratorProps) {
  const [formData, setFormData] = useState({
    laborCost: "",
    partsCost: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.laborCost || isNaN(Number(formData.laborCost)) || Number(formData.laborCost) < 0) {
      newErrors.laborCost = "Valid labor cost is required"
    }
    if (!formData.partsCost || isNaN(Number(formData.partsCost)) || Number(formData.partsCost) < 0) {
      newErrors.partsCost = "Valid parts cost is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsGenerating(true)

    try {
      const invoice = InvoiceService.generateInvoiceFromTicket(
        ticket,
        Number(formData.laborCost),
        Number(formData.partsCost),
      )

      onInvoiceGenerated?.(invoice)
    } catch (error) {
      console.error("Error generating invoice:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const laborCost = Number(formData.laborCost) || 0
  const partsCost = Number(formData.partsCost) || 0
  const subtotal = laborCost + partsCost
  const taxAmount = subtotal * 0.08
  const totalAmount = subtotal + taxAmount
  const displayName = (ticket.customerFirstname || ticket.customerSurname)
    ? `${ticket.customerFirstname || ''} ${ticket.customerSurname || ''}`.trim()
    : ticket.customerName

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Invoice
        </CardTitle>
        <CardDescription>Create an invoice for repair ticket {ticket.trackingId}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ticket Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Repair Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Customer</p>
                <p className="text-muted-foreground">{displayName}</p>
              </div>
              <div>
                <p className="font-medium">Device</p>
                <p className="text-muted-foreground">
                  {ticket.deviceBrand} {ticket.deviceModel}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="font-medium">Issue</p>
                <p className="text-muted-foreground">{ticket.issueDescription}</p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cost Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="laborCost">Labor Cost (£) *</Label>
                <Input
                  id="laborCost"
                  type="number"
                  step="0.01"
                  value={formData.laborCost}
                  onChange={(e) => handleInputChange("laborCost", e.target.value)}
                  placeholder="0.00"
                />
                {errors.laborCost && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.laborCost}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="partsCost">Parts Cost (£) *</Label>
                <Input
                  id="partsCost"
                  type="number"
                  step="0.01"
                  value={formData.partsCost}
                  onChange={(e) => handleInputChange("partsCost", e.target.value)}
                  placeholder="0.00"
                />
                {errors.partsCost && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.partsCost}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Preview */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Invoice Preview
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Labor Cost:</span>
                <span>£{laborCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Parts Cost:</span>
                <span>£{partsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span>£{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <span>Total Amount:</span>
                <span>£{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isGenerating} className="flex-1">
              {isGenerating ? "Generating Invoice..." : "Generate Invoice"}
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
