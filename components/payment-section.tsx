"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, CreditCard, Banknote, Building } from "lucide-react"
import type { RepairTicket, TicketPayment } from "@/types"

interface PaymentSectionProps {
  ticket: RepairTicket
  onPaymentAdded: (payment: TicketPayment) => void
}

export function PaymentSection({ ticket, onPaymentAdded }: PaymentSectionProps) {
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [paymentData, setPaymentData] = useState({
    amount: "",
    method: "",
    notes: "",
  })

  const handleAddPayment = () => {
    if (!paymentData.amount || !paymentData.method) return

    const payment: TicketPayment = {
      id: Date.now().toString(),
      amount: Number.parseFloat(paymentData.amount),
      method: paymentData.method as "cash" | "bank_transfer" | "card",
      date: new Date().toISOString(),
      notes: paymentData.notes,
    }

    onPaymentAdded(payment)
    setPaymentData({ amount: "", method: "", notes: "" })
    setShowAddPayment(false)
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="h-4 w-4" />
      case "card":
        return <CreditCard className="h-4 w-4" />
      case "bank_transfer":
        return <Building className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "cash":
        return "Cash"
      case "card":
        return "Card"
      case "bank_transfer":
        return "Bank Transfer"
      default:
        return method
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Payment Information
          <Button size="sm" onClick={() => setShowAddPayment(!showAddPayment)} disabled={ticket.balanceDue <= 0}>
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
        </CardTitle>
        <CardDescription>Track payments and outstanding balance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Grand Total</p>
            <p className="text-lg font-bold">£{ticket.estimatedCost.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Amount Paid</p>
            <p className="text-lg font-bold text-green-600">£{ticket.totalPaid.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Balance Due</p>
            <p className="text-lg font-bold text-red-600">£{ticket.balanceDue.toFixed(2)}</p>
          </div>
        </div>

        {/* Add Payment Form */}
        {showAddPayment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (£)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    max={ticket.balanceDue}
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select
                    value={paymentData.method}
                    onValueChange={(value) => setPaymentData((prev) => ({ ...prev, method: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Payment reference or notes"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddPayment} disabled={!paymentData.amount || !paymentData.method}>
                  Add Payment
                </Button>
                <Button variant="outline" onClick={() => setShowAddPayment(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        {ticket.payments.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <h4 className="font-medium">Payment History</h4>
            <div className="space-y-2">
              {ticket.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getPaymentIcon(payment.method)}
                    <div>
                      <p className="font-medium">£{payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPaymentMethod(payment.method)} • {new Date(payment.date).toLocaleDateString()}
                      </p>
                      {payment.notes && <p className="text-xs text-muted-foreground">{payment.notes}</p>}
                    </div>
                  </div>
                  <Badge variant="secondary">Paid</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {ticket.payments.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p>No payments recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
