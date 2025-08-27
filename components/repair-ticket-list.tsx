"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RepairService } from "@/lib/repair-service"
import { SettingsService } from "@/lib/settings-service"
import type { RepairTicket } from "@/types"
import { Search, Eye, Edit, Trash2, Printer, Mail, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TicketPrintView } from "./ticket-print-view"


interface RepairTicketListProps {
  onEditTicket?: (ticket: RepairTicket) => void
  onDeleteTicket?: (ticket: RepairTicket) => void
  refreshKey?: number
}

export function RepairTicketList({ onEditTicket, onDeleteTicket, refreshKey }: RepairTicketListProps) {
  const [tickets, setTickets] = useState<RepairTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<RepairTicket[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedTicket, setSelectedTicket] = useState<RepairTicket | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTicketForView, setSelectedTicketForView] = useState<RepairTicket | null>(null)


  useEffect(() => {
    loadTickets()
  }, [refreshKey])

  useEffect(() => {
    filterTickets()
  }, [tickets, searchTerm, statusFilter])

  const loadTickets = () => {
    const allTickets = RepairService.getTickets()
    setTickets(allTickets)
  }

  const filterTickets = () => {
    let filtered = tickets

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.deviceBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter)
    }

    setFilteredTickets(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "diagnosing":
        return "bg-yellow-100 text-yellow-800"
      case "waiting for customer response":
        return "bg-orange-100 text-orange-800"
      case "waiting for parts":
        return "bg-purple-100 text-purple-800"
      case "in progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDelete = (ticket: RepairTicket) => {
    if (window.confirm(`Are you sure you want to delete ticket ${ticket.trackingId}?`)) {
      try {
        RepairService.deleteTicket(ticket.id)
        loadTickets()
        onDeleteTicket?.(ticket)
      } catch (error) {
        console.error("Error deleting ticket:", error)
        alert("Failed to delete ticket. Please try again.")
      }
    }
  }

  const handlePrint = (ticket: RepairTicket) => {
    const html = createTicketHTML(ticket)
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()

      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  const handleEmail = (ticket: RepairTicket) => {
    // Prepare an HTML view of the ticket that can be saved/printed/attached
    const html = createTicketHTML(ticket)

    // Open the HTML in a new window so user can save/print or manually attach to email
    const emailWindow = window.open("", "_blank")
    if (emailWindow) {
      emailWindow.document.write(html)
      emailWindow.document.close()
      emailWindow.focus()
    } else {
      alert("Unable to open a new window for email preview. Please ensure pop-ups are allowed.")
    }
  }

  // Reusable HTML generator for a printable/email-friendly ticket
  const createTicketHTML = (ticket: RepairTicket) => {
    const terms = SettingsService.getTermsAndConditions().map(t => `<li>${t}</li>`).join("")
    const paymentsHtml = (ticket.payments || []).map(p => `
      <tr>
        <td>${p.method}</td>
        <td>£${p.amount.toFixed(2)}</td>
        <td>${new Date(p.date).toLocaleDateString()}</td>
      </tr>
    `).join("")

    const grandTotal = (ticket.grandTotal ?? (ticket.estimatedCost || 0))

    return `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Repair Ticket - ${ticket.trackingId}</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <style>
            body { font-family: Arial, Helvetica, sans-serif; color: #111827; margin: 0; padding: 24px; }
            .container { max-width: 900px; margin: 0 auto; }
            header { text-align: center; margin-bottom: 18px; }
            header h1 { margin: 0; font-size: 28px; }
            header p { margin: 2px 0; color: #6b7280; }
            .card { border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin-bottom: 12px; }
            .grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
            @media (min-width: 768px) { .grid { grid-template-columns: 1fr 1fr; } }
            table { width: 100%; border-collapse: collapse; }
            table th, table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            .right { text-align: right; }
            footer { margin-top: 18px; font-size: 13px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <h1>RepairHub</h1>
              <p>Professional Repair Services</p>
              <p>123 Tech Lane, Innovation City, UK | Phone: +44 123 456 7890 | Email: info@repairhub.com</p>
              <p style="margin-top:8px;font-weight:600">Tracking ID: ${ticket.trackingId}</p>
            </header>

            <section class="card">
              <div class="grid">
                <div>
                  <h3 style="margin:0 0 6px 0">Customer</h3>
                  <p style="margin:0"><strong>Name:</strong> ${ticket.customerName}</p>
                  <p style="margin:0"><strong>Email:</strong> ${ticket.customerEmail}</p>
                  <p style="margin:0"><strong>Phone:</strong> ${ticket.customerPhone}</p>
                </div>
                <div>
                  <h3 style="margin:0 0 6px 0">Device</h3>
                  <p style="margin:0"><strong>Brand:</strong> ${ticket.deviceBrand}</p>
                  <p style="margin:0"><strong>Model:</strong> ${ticket.deviceModel}</p>
                  <p style="margin:0"><strong>IMEI/Serial:</strong> ${ticket.deviceImei || ticket.deviceSerial || 'N/A'}</p>
                </div>
              </div>
            </section>

            <section class="card">
              <h3 style="margin:0 0 8px 0">Repair Details</h3>
              <table>
                <tbody>
                  <tr><th>Issue Type</th><td>${ticket.issueType}</td></tr>
                  <tr><th>Status</th><td>${ticket.status}</td></tr>
                  <tr><th>Assigned Technician</th><td>${ticket.assignedTechnician || 'N/A'}</td></tr>
                  <tr><th>Estimated Time</th><td>${ticket.estimatedTime}</td></tr>
                  <tr><th>Estimated Cost</th><td>£${(ticket.estimatedCost || 0).toFixed(2)}</td></tr>
                  <tr><th>Grand Total</th><td>£${grandTotal.toFixed(2)}</td></tr>
                </tbody>
              </table>

              <div style="margin-top:12px">
                <h4 style="margin:0 0 6px 0">Issue Description</h4>
                <div style="padding:10px;background:#f9fafb;border-radius:6px;border:1px solid #eef2f7">${ticket.issueDescription || ''}</div>
              </div>
            </section>

            <section class="card">
              <h3 style="margin:0 0 8px 0">Payments</h3>
              <table>
                <thead>
                  <tr><th>Method</th><th>Amount</th><th>Date</th></tr>
                </thead>
                <tbody>
                  ${paymentsHtml || '<tr><td colspan="3">No payments recorded</td></tr>'}
                </tbody>
              </table>
            </section>

            <footer>
              <h4 style="margin:0 0 6px 0">Terms & Conditions</h4>
              <ul>${terms}</ul>
              <p style="margin-top:12px">Thank you for choosing RepairHub.</p>
            </footer>
          </div>
        </body>
      </html>`
  }

  const handleViewTicket = (ticket: RepairTicket) => {
    setSelectedTicketForView(ticket);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking ID, customer, or device..."
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
            <SelectItem value="Diagnosing">Diagnosing</SelectItem>
            <SelectItem value="Waiting for Customer Response">Waiting for Customer Response</SelectItem>
            <SelectItem value="Waiting for Parts">Waiting for Parts</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No repair tickets found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{ticket.trackingId}</CardTitle>
                    <CardDescription>
                      {ticket.customerName} • {ticket.deviceBrand} {ticket.deviceModel}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium">Issue Type</p>
                    <p className="text-sm text-muted-foreground">{ticket.issueType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Total Cost</p>
                    <p className="text-sm text-muted-foreground">
                      £{(ticket.grandTotal ?? ticket.estimatedCost).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amount Paid</p>
                    <p className="text-sm font-semibold text-green-600">
                      £{(ticket.totalPaid ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                {ticket.balanceDue !== undefined && ticket.balanceDue > 0 && (
                  <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm">
                      <span className="font-medium">Balance Due:</span>
                      <span className="text-red-600 font-semibold ml-1">£{ticket.balanceDue.toFixed(2)}</span>
                    </p>
                  </div>
                )}
                <div className="mb-4">
                  <p className="text-sm font-medium">Issue Description</p>
                  <p className="text-sm text-muted-foreground">{ticket.issueDescription}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewTicket(ticket)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEditTicket?.(ticket)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handlePrint(ticket)}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEmail(ticket)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(ticket)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedTicket} onOpenChange={(isOpen) => { if (!isOpen) setSelectedTicket(null); }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Repair Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && <TicketPrintView ticket={selectedTicket} />}
        </DialogContent>
      </Dialog>

      {selectedTicketForView && (
        <TicketViewModal
          ticket={selectedTicketForView}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedTicketForView(null);
          }}
        />
      )}
    </div>
  )
}

interface TicketViewModalProps {
  ticket: RepairTicket;
  onClose: () => void;
}

const TicketViewModal = ({ ticket, onClose }: TicketViewModalProps) => {
  const termsAndConditions = SettingsService.getTermsAndConditions();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <Button variant="ghost" size="sm" onClick={onClose} className="absolute top-4 right-4">
            <X className="h-6 w-6" />
          </Button>

          <div className="printable-content">
            {/* Letterhead */}
            <header className="border-b pb-4 mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-800">RepairHub</h1>
              <p className="text-sm text-gray-500">123 Tech Lane, Innovation City, UK</p>
              <p className="text-sm text-gray-500">Phone: +44 123 456 7890 | Email: info@repairhub.com</p>
              <p className="mt-2 font-semibold">Tracking ID: {ticket.trackingId}</p>
            </header>

            {/* Main Content */}
            <main>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2 border-b pb-2">Customer Details</h3>
                  <p><strong>Name:</strong> {ticket.customerName}</p>
                  <p><strong>Email:</strong> {ticket.customerEmail}</p>
                  <p><strong>Phone:</strong> {ticket.customerPhone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2 border-b pb-2">Device Details</h3>
                  <p><strong>Brand:</strong> {ticket.deviceBrand}</p>
                  <p><strong>Model:</strong> {ticket.deviceModel}</p>
                  <p><strong>IMEI:</strong> {ticket.deviceImei || "N/A"}</p>
                  <p><strong>Serial No:</strong> {ticket.deviceSerial || "N/A"}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-lg mb-2 border-b pb-2">Repair Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p><strong>Issue Type:</strong> {ticket.issueType}</p>
                    <p><strong>Status:</strong> <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge></p>
                    <p><strong>Estimated Time:</strong> {ticket.estimatedTime}</p>
                    <p><strong>Assigned To:</strong> {ticket.assignedTechnician || "N/A"}</p>
                  </div>
                  <div>
                    <p><strong>Estimated Cost:</strong> £{ticket.estimatedCost.toFixed(2)}</p>
                    <p><strong>VAT (20%):</strong> £{(ticket.estimatedCost * 0.2).toFixed(2)}</p>
                    <p><strong>Grand Total:</strong> £{(ticket.grandTotal ?? ticket.estimatedCost * 1.2).toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold">Issue Description</h4>
                  <p className="text-sm text-gray-600 mt-1">{ticket.issueDescription}</p>
                </div>
              </div>
            </main>

            {/* Terms and Conditions */}
            <footer className="border-t pt-4 mt-6">
              <h3 className="font-semibold text-lg mb-2">Terms & Conditions</h3>
              <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                {termsAndConditions.map((term, index) => (
                  <li key={index}>{term}</li>
                ))}
              </ul>
            </footer>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "diagnosing":
      return "bg-yellow-100 text-yellow-800"
    case "waiting for customer response":
      return "bg-orange-100 text-orange-800"
    case "waiting for parts":
      return "bg-purple-100 text-purple-800"
    case "in progress":
      return "bg-blue-100 text-blue-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-gray-100 text-gray-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
