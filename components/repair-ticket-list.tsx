"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RepairService } from "@/lib/repair-service"
import type { RepairTicket } from "@/types"
import { Search, Eye, Edit, Trash2, Printer, Mail } from "lucide-react"
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
      RepairService.deleteTicket(ticket.id)
      loadTickets()
      onDeleteTicket?.(ticket)
    }
  }

  const handlePrint = (ticket: RepairTicket) => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Repair Ticket - ${ticket.trackingId}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body { print-color-adjust: exact; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="max-w-4xl mx-auto p-8">
              <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-blue-600">RepairHub</h1>
                <p class="text-gray-600">Professional Repair Services</p>
              </div>
              
              <div class="border rounded-lg p-6 mb-6">
                <h2 class="text-xl font-bold mb-4">Repair Ticket: ${ticket.trackingId}</h2>
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <h3 class="font-semibold mb-2">Customer Information</h3>
                    <p><strong>Name:</strong> ${ticket.customerName}</p>
                    <p><strong>Phone:</strong> ${ticket.customerPhone}</p>
                    <p><strong>Email:</strong> ${ticket.customerEmail}</p>
                  </div>
                  <div>
                    <h3 class="font-semibold mb-2">Device Information</h3>
                    <p><strong>Brand:</strong> ${ticket.deviceBrand}</p>
                    <p><strong>Model:</strong> ${ticket.deviceModel}</p>
                    <p><strong>IMEI/Serial:</strong> ${ticket.deviceImei || ticket.deviceSerial || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              <div class="border rounded-lg p-6 mb-6">
                <h3 class="font-semibold mb-2">Repair Details</h3>
                <p><strong>Issue Type:</strong> ${ticket.issueType}</p>
                <p><strong>Status:</strong> ${ticket.status}</p>
                <p><strong>Issue Description:</strong></p>
                <p class="mt-1 p-3 bg-gray-50 rounded border">${ticket.issueDescription}</p>
                <div class="grid grid-cols-2 gap-4 mt-4">
                  <p><strong>Total Cost:</strong> £${ticket.grandTotal ? ticket.grandTotal.toFixed(2) : ticket.estimatedCost}</p>
                  <p><strong>Estimated Time:</strong> ${ticket.estimatedTime}</p>
                </div>
                <p class="mt-2"><strong>Assigned Technician:</strong> ${ticket.assignedTechnician}</p>
              </div>
              
              <div class="text-center mt-8 text-sm text-gray-500">
                <p>Thank you for choosing RepairHub!</p>
                <p>Contact: info@repairhub.com | +44 123 456 7890</p>
              </div>
            </div>
          </body>
        </html>
      `

      printWindow.document.write(printContent)
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
    // Simulate sending email (in real app, this would call an API)
    const emailContent = `
Dear ${ticket.customerName},

Here are the details of your repair ticket:

Ticket ID: ${ticket.trackingId}
Device: ${ticket.deviceBrand} ${ticket.deviceModel}
Issue: ${ticket.issueType}
Status: ${ticket.status}
Total Cost: £${ticket.grandTotal ? ticket.grandTotal.toFixed(2) : ticket.estimatedCost}
Estimated Time: ${ticket.estimatedTime}

Issue Description:
${ticket.issueDescription}

We will keep you updated on the progress of your repair.

Best regards,
RepairHub Team
    `

    // For demo purposes, show alert with email content
    alert(`Email would be sent to ${ticket.customerEmail}:

${emailContent}`)

    // In a real application, you would call an API here:
    // await emailService.sendTicketEmail(ticket.customerEmail, emailContent)
  }

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
                      £{ticket.grandTotal ? ticket.grandTotal.toFixed(2) : ticket.estimatedCost}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Amount Paid</p>
                    <p className="text-sm font-semibold text-green-600">
                      £{ticket.totalPaid ? ticket.totalPaid.toFixed(2) : "0.00"}
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
                  <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket)}>
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
    </div>
  )
}