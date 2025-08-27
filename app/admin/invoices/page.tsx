"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { InvoiceList } from "@/components/invoice-list"
import { PaymentProcessor } from "@/components/payment-processor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Invoice, Payment } from "@/types"
import { ArrowLeft, CheckCircle } from "lucide-react"

function InvoicesPageContent() {
  const [view, setView] = useState<"list" | "payment" | "success">("list")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [processedPayment, setProcessedPayment] = useState<Payment | null>(null)

  const handleProcessPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setView("payment")
  }

  const handlePaymentProcessed = (payment: Payment) => {
    setProcessedPayment(payment)
    setView("success")
  }

  const handleBackToList = () => {
    setView("list")
    setSelectedInvoice(null)
    setProcessedPayment(null)
  }

  if (view === "success" && processedPayment && selectedInvoice) {
    return (
      <div className="flex min-h-screen bg-muted/50">
        <AdminSidebar />

        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-green-600">Payment Processed Successfully!</CardTitle>
                <CardDescription>The payment has been recorded and the invoice has been updated.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Invoice</p>
                      <p className="text-sm">{selectedInvoice.trackingId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Customer</p>
                      <p className="text-sm">{selectedInvoice.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Amount Paid</p>
                      <p className="text-lg font-bold text-green-600">${processedPayment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment Method</p>
                      <p className="text-sm capitalize">{processedPayment.method.replace("_", " ")}</p>
                    </div>
                  </div>
                </div>
                <Alert>
                  <AlertDescription>
                    A receipt has been generated and the customer will be notified of the payment confirmation.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleBackToList} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Invoices List
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (view === "payment" && selectedInvoice) {
    return (
      <div className="flex min-h-screen bg-muted/50">
        <AdminSidebar />

        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => setView("list")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </div>
            <PaymentProcessor
              invoice={selectedInvoice}
              onPaymentProcessed={handlePaymentProcessed}
              onCancel={() => setView("list")}
            />
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Invoices & Payments</h1>
              <p className="text-muted-foreground">Manage invoices and process payments</p>
            </div>
          </div>
          <InvoiceList onProcessPayment={handleProcessPayment} />
        </div>
      </main>
    </div>
  )
}

export default function InvoicesPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <InvoicesPageContent />
    </ProtectedRoute>
  )
}
