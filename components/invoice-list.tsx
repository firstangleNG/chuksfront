"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InvoiceService } from "@/lib/invoice-service"
import type { Invoice } from "@/types"
import { Search, Eye, DollarSign, Calendar, AlertTriangle } from "lucide-react"

interface InvoiceListProps {
  onViewInvoice?: (invoice: Invoice) => void
  onProcessPayment?: (invoice: Invoice) => void
}

export function InvoiceList({ onViewInvoice, onProcessPayment }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    loadInvoices()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, statusFilter])

  const loadInvoices = () => {
    const allInvoices = InvoiceService.getInvoices()
    setInvoices(allInvoices)
  }

  const filterInvoices = () => {
    let filtered = invoices

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.paymentStatus === statusFilter)
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredInvoices(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = (invoice: Invoice) => {
    return invoice.paymentStatus === "pending" && new Date(invoice.dueDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No invoices found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {invoice.trackingId}
                      {isOverdue(invoice) && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    </CardTitle>
                    <CardDescription>
                      {invoice.customerName} • {invoice.deviceInfo}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(isOverdue(invoice) ? "overdue" : invoice.paymentStatus)}>
                    {isOverdue(invoice) ? "OVERDUE" : invoice.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Total Amount
                    </p>
                    <p className="text-lg font-semibold">£{invoice.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Labor Cost</p>
                    <p className="text-sm text-muted-foreground">£{invoice.laborCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Parts Cost</p>
                    <p className="text-sm text-muted-foreground">£{invoice.partsCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due Date
                    </p>
                    <p className="text-sm text-muted-foreground">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium">Issue Description</p>
                  <p className="text-sm text-muted-foreground">{invoice.issueDescription}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onViewInvoice?.(invoice)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {invoice.paymentStatus === "pending" && (
                    <Button size="sm" onClick={() => onProcessPayment?.(invoice)}>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Payment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
