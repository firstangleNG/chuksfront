"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InvoiceService } from "@/lib/invoice-service"
import type { Invoice } from "@/types"
import { Wrench, CreditCard, CheckCircle, AlertTriangle, Calendar, DollarSign } from "lucide-react"

export default function PayInvoicePage() {
  const params = useParams()
  const trackingId = params.trackingId as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (trackingId) {
      const foundInvoice = InvoiceService.getInvoiceByTrackingId(trackingId)
      if (foundInvoice) {
        setInvoice(foundInvoice)
      } else {
        setError("Invoice not found for this tracking ID")
      }
      setIsLoading(false)
    }
  }, [trackingId])

  const handlePayNow = () => {
    // In a real app, this would integrate with a payment gateway like Stripe
    alert("Payment gateway integration would be implemented here")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !invoice) {
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
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">Invoice Not Found</CardTitle>
              <CardDescription>We couldn't find an invoice for tracking ID: {trackingId}</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  Please check your tracking ID and try again, or contact support if you believe this is an error.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const isOverdue = invoice.paymentStatus === "pending" && new Date(invoice.dueDate) < new Date()
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return isOverdue ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
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
              <h1 className="text-xl font-bold">RepairHub</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Invoice Payment</h2>
          <p className="text-muted-foreground">Pay your repair invoice securely online</p>
        </div>

        {invoice.paymentStatus === "paid" ? (
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">Payment Completed</CardTitle>
              <CardDescription>This invoice has already been paid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Paid Amount</p>
                    <p className="text-lg font-semibold">${invoice.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="font-medium">Payment Date</p>
                    <p className="text-muted-foreground">
                      {invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-muted-foreground capitalize">
                      {invoice.paymentMethod?.replace("_", " ") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Status</p>
                    <Badge className="bg-green-100 text-green-800">PAID</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{invoice.trackingId}</CardTitle>
                    <CardDescription>Invoice for {invoice.customerName}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(invoice.paymentStatus)}>
                    {isOverdue ? "OVERDUE" : invoice.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Repair Details</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium">Device</p>
                        <p className="text-muted-foreground">{invoice.deviceInfo}</p>
                      </div>
                      <div>
                        <p className="font-medium">Issue</p>
                        <p className="text-muted-foreground">{invoice.issueDescription}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Payment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Labor Cost:</span>
                        <span>${invoice.laborCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Parts Cost:</span>
                        <span>${invoice.partsCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (8%):</span>
                        <span>${invoice.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-base border-t pt-2">
                        <span>Total Amount:</span>
                        <span>${invoice.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                  {isOverdue && (
                    <Alert variant="destructive" className="flex-1">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>This invoice is overdue</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Options
                </CardTitle>
                <CardDescription>Choose your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <strong>Note:</strong> Online payment integration is not yet implemented in this demo. Please visit
                    our shop or call us to process your payment.
                  </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handlePayNow} className="h-16" disabled>
                    <div className="text-center">
                      <CreditCard className="h-5 w-5 mx-auto mb-1" />
                      <p className="text-sm">Pay Online</p>
                      <p className="text-xs opacity-75">Credit/Debit Card</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-16 bg-transparent" disabled>
                    <div className="text-center">
                      <DollarSign className="h-5 w-5 mx-auto mb-1" />
                      <p className="text-sm">Pay in Store</p>
                      <p className="text-xs opacity-75">Cash or Card</p>
                    </div>
                  </Button>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  <p>For payment assistance, contact us at:</p>
                  <p className="font-medium">Phone: +1 (555) 123-4567</p>
                  <p className="font-medium">Email: support@repairhub.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
