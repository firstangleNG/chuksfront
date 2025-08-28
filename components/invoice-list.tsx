"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { InvoiceService } from "@/lib/invoice-service"
import type { Invoice } from "@/types"
import { Search, Eye, DollarSign, Calendar, AlertTriangle, X, PlusCircle } from "lucide-react"
import { RepairService } from "@/lib/repair-service"
import { SettingsService } from "@/lib/settings-service"
import { InvoicePrintView } from "./invoice-print-view"

interface InvoiceListProps {
  onViewInvoice?: (invoice: Invoice) => void
  onProcessPayment?: (invoice: Invoice) => void
}

interface InvoiceViewModalProps {
  invoice: Invoice
  onClose: () => void
}

const InvoiceViewModal = ({ invoice, onClose }: InvoiceViewModalProps) => {
  const [ticket, setTicket] = useState<any | null>(null)
  const terms = SettingsService.getTermsAndConditions()

  useEffect(() => {
    if (invoice.repairTicketId) {
      const t = RepairService.getTicket(invoice.repairTicketId)
      setTicket(t || null)
    } else {
      const t = RepairService.getTicketByTrackingId(invoice.trackingId)
      setTicket(t || null)
    }
  }, [invoice])

  const displayName = (invoice.customerFirstname || invoice.customerSurname)
    ? `${invoice.customerFirstname || ''} ${invoice.customerSurname || ''}`.trim()
    : invoice.customerName

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-600">×</button>

          <header className="flex justify-between items-start border-b pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold">ComputerHubUK</h2>
              <p className="text-xs text-muted-foreground">Professional Repair Services</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Invoice</div>
              <div className="text-lg font-semibold">{invoice.trackingId}</div>
              <div className="text-sm">Date: {new Date(invoice.createdAt).toLocaleDateString()}</div>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-2">Customer</h4>
              <p className="text-sm"><strong>Name:</strong> {displayName}</p>
              <p className="text-sm"><strong>Email:</strong> {invoice.customerEmail}</p>
              <p className="text-sm"><strong>Phone:</strong> {invoice.customerPhone}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-2">Invoice Summary</h4>
              <p className="text-sm"><strong>Labor:</strong> £{invoice.laborCost.toFixed(2)}</p>
              <p className="text-sm"><strong>Parts:</strong> £{invoice.partsCost.toFixed(2)}</p>
              <p className="text-sm"><strong>Tax:</strong> £{invoice.taxAmount.toFixed(2)}</p>
              <p className="text-sm font-semibold"><strong>Total:</strong> £{invoice.totalAmount.toFixed(2)}</p>
              <p className="text-sm"><strong>Status:</strong> {invoice.paymentStatus.toUpperCase()}</p>
            </div>
          </section>

          {ticket && (
            <section className="mb-6">
              <h4 className="font-semibold mb-2">Related Repair Ticket</h4>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-sm"><strong>Tracking ID:</strong> {ticket.trackingId}</p>
                <p className="text-sm"><strong>Device:</strong> {ticket.deviceBrand} {ticket.deviceModel}</p>
                <p className="text-sm"><strong>Issue:</strong> {ticket.issueType}</p>
                <p className="text-sm"><strong>Status:</strong> {ticket.status}</p>
              </div>
            </section>
          )}

          <section>
            <h4 className="font-semibold mb-2">Terms & Conditions</h4>
            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
              {terms.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </section>

          <div className="flex justify-end gap-2 mt-6">
            <button className="px-3 py-2 border rounded" onClick={onClose}>Close</button>
            <button className="px-3 py-2 bg-primary text-white rounded" onClick={() => window.print()}>Print</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function InvoiceList({ onViewInvoice, onProcessPayment }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    // In a real app, get this from your auth context
    const role = localStorage.getItem('userRole') || 'admin' // Default to admin for now
    setUserRole(role)
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

  const handleCreateInvoice = () => {
    router.push('/invoices/create')
  }

  const handleViewInvoice = async (invoice: Invoice) => {
    try {
      const tickets = await RepairService.getTickets()
      const ticket = tickets.find(t => t.id === invoice.repairTicketId)
      if (ticket) {
        setSelectedTicket(ticket)
        setSelectedInvoice(invoice)
        setIsViewerOpen(true)
        if (onViewInvoice) onViewInvoice(invoice)
      } else {
        console.error('Ticket not found for invoice:', invoice.id)
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error)
    }
  }

  const handleCloseViewer = () => {
    setIsViewerOpen(false)
    setSelectedInvoice(null)
    setSelectedTicket(null)
  }

  return (
    <div className="space-y-6">
      {/* Header with title and create button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Manage and track all your invoices
          </p>
        </div>
        <Button onClick={() => {}}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewInvoice(invoice)}
                    disabled={!['admin', 'superadmin'].includes(userRole)}
                    title={!['admin', 'superadmin'].includes(userRole) ? 'Admin access required' : 'View invoice details'}
                  >
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

      {/* Invoice View Modal */}
    <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden h-[90vh] max-h-[90vh] flex flex-col">
        <div className="relative flex-1 overflow-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={handleCloseViewer}
          >
            <X className="h-5 w-5" />
          </Button>
          {selectedInvoice && (
            <div className="p-6">
              <InvoicePrintView 
                invoice={selectedInvoice} 
                onClose={handleCloseViewer} 
              />
            </div>
          )}
        </div>
        
        {/* Fixed action buttons at the bottom */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-3 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <Button onClick={handleCloseViewer}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default InvoiceList;
