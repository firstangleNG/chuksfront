"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InvoiceService } from "@/lib/invoice-service"
import type { Invoice, Payment } from "@/types"
import { CreditCard, CheckCircle } from "lucide-react"

interface PaymentProcessorProps {
  invoice: Invoice
  onPaymentProcessed?: (payment: Payment) => void
  onCancel?: () => void
}

export function PaymentProcessor({ invoice, onPaymentProcessed, onCancel }: PaymentProcessorProps) {
  const [formData, setFormData] = useState({
    amount: invoice.totalAmount.toString(),
    method: "" as "cash" | "card" | "online" | "bank_transfer" | "",
    transactionId: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Valid payment amount is required"
    }
    if (!formData.method) {
      newErrors.method = "Payment method is required"
    }
    if (formData.method === "online" && !formData.transactionId.trim()) {
      newErrors.transactionId = "Transaction ID is required for online payments"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsProcessing(true)

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const payment = InvoiceService.processPayment(
        invoice.id,
        Number(formData.amount),
        formData.method as "cash" | "card" | "online" | "bank_transfer",
        formData.transactionId || undefined,
      )

      onPaymentProcessed?.(payment)
    } catch (error) {
      console.error("Error processing payment:", error)
    } finally {
      setIsProcessing(false)
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
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Process Payment
        </CardTitle>
        <CardDescription>Process payment for invoice {invoice.trackingId}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Invoice Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Customer</p>
                <p className="text-muted-foreground">{invoice.customerName}</p>
              </div>
              <div>
                <p className="font-medium">Device</p>
                <p className="text-muted-foreground">{invoice.deviceInfo}</p>
              </div>
              <div>
                <p className="font-medium">Labor Cost</p>
                <p className="text-muted-foreground">£{invoice.laborCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="font-medium">Parts Cost</p>
                <p className="text-muted-foreground">£{invoice.partsCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="font-medium">Tax (8%)</p>
                <p className="text-muted-foreground">£{invoice.taxAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className="font-medium text-lg">Total Amount</p>
                <p className="text-muted-foreground text-lg font-semibold">£{invoice.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount (£) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.amount}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method *</Label>
                <Select value={formData.method} onValueChange={(value) => handleInputChange("method", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                {errors.method && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.method}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            {(formData.method === "online" || formData.method === "card") && (
              <div className="space-y-2">
                <Label htmlFor="transactionId">
                  Transaction ID {formData.method === "online" ? "*" : "(Optional)"}
                </Label>
                <Input
                  id="transactionId"
                  value={formData.transactionId}
                  onChange={(e) => handleInputChange("transactionId", e.target.value)}
                  placeholder="Enter transaction ID"
                />
                {errors.transactionId && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.transactionId}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              Payment Summary
            </h3>
            <div className="text-sm text-green-700">
              <p>
                Processing payment of <strong>£{Number(formData.amount).toFixed(2)}</strong>
              </p>
              {formData.method && (
                <p>
                  Payment method: <strong>{formData.method.replace("_", " ").toUpperCase()}</strong>
                </p>
              )}
              {Number(formData.amount) !== invoice.totalAmount && (
                <Alert className="mt-2">
                  <AlertDescription>
                    Payment amount differs from invoice total. This will be recorded as a partial payment.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? "Processing Payment..." : "Process Payment"}
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
