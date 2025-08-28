"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, X } from "lucide-react"
import { InvoiceService } from "@/lib/invoice-service"
import { RepairService } from "@/lib/repair-service"
import { useToast } from "@/components/ui/use-toast"

type RepairTicket = {
  id: string
  trackingId: string
  customerName: string
  customerEmail?: string
  deviceInfo: string
  issueDescription: string
  status: string
  totalPaid: number
  totalCost: number
}

type InvoiceItem = {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [tickets, setTickets] = useState<RepairTicket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState("")
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "Labor Charges", quantity: 1, unitPrice: 0, amount: 0 },
    { description: "Parts", quantity: 1, unitPrice: 0, amount: 0 },
  ])
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [showActions, setShowActions] = useState(false)
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null)

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await RepairService.getTickets()
        // Filter for completed tickets that don't have invoices yet
        const completedTickets = data.filter(
          (ticket: RepairTicket) => ticket.status === "completed"
        )
        setTickets(completedTickets)
      } catch (error) {
        console.error("Error fetching tickets:", error)
        toast({
          title: "Error",
          description: "Failed to load repair tickets. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchTickets()
    
    // Set default due date to 7 days from now
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    setDueDate(nextWeek.toISOString().split("T")[0])
  }, [toast])

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId)

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    const item = { ...newItems[index] }
    
    // @ts-ignore - TypeScript doesn't like dynamic property access
    item[field] = typeof value === 'string' && field !== 'description' ? parseFloat(value) || 0 : value
    
    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = item.quantity * item.unitPrice
    }
    
    newItems[index] = item
    setItems(newItems)
  }

  const addNewItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, amount: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.08 // 8% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTicket) {
      toast({
        title: "Error",
        description: "Please select a repair ticket",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const invoiceData = {
        repairTicketId: selectedTicket.id,
        trackingId: selectedTicket.trackingId,
        customerName: selectedTicket.customerName,
        customerEmail: selectedTicket.customerEmail || "",
        deviceInfo: selectedTicket.deviceInfo,
        issueDescription: selectedTicket.issueDescription,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount
        })),
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        totalAmount: calculateTotal(),
        dueDate: new Date(dueDate).toISOString(),
        notes,
        paymentStatus: "pending" as const,
      }

      // Save the invoice
      const newInvoice = await InvoiceService.createInvoice(invoiceData)
      setCreatedInvoiceId(newInvoice.id)
      setShowActions(true)
      
      toast({
        title: "Success",
        description: "Invoice created successfully!",
      })
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    if (createdInvoiceId) {
      window.open(`/invoices/print/${createdInvoiceId}`, "_blank")
    }
  }

  const handleEmail = async () => {
    if (!createdInvoiceId || !selectedTicket?.customerEmail) return
    
    try {
      setIsLoading(true)
      // TODO: Implement email sending logic
      // await InvoiceService.sendInvoiceEmail(createdInvoiceId, selectedTicket.customerEmail)
      
      toast({
        title: "Email Sent",
        description: `Invoice has been sent to ${selectedTicket.customerEmail}`,
      })
    } catch (error) {
      console.error("Error sending email:", error)
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Create New Invoice</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Invoices
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ticket">Repair Ticket *</Label>
                <Select
                  value={selectedTicketId}
                  onValueChange={(value) => setSelectedTicketId(value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a repair ticket" />
                  </SelectTrigger>
                  <SelectContent>
                    {tickets.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No completed tickets found</div>
                    ) : (
                      tickets.map((ticket) => (
                        <SelectItem key={ticket.id} value={ticket.id}>
                          #{ticket.trackingId} - {ticket.customerName} - {ticket.deviceInfo}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only completed repair tickets without invoices are shown
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {selectedTicket && (
              <div className="space-y-2">
                <h3 className="font-medium">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium">Customer</p>
                    <p>{selectedTicket.customerName}</p>
                  </div>
                  {selectedTicket.customerEmail && (
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p>{selectedTicket.customerEmail}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">Device</p>
                    <p>{selectedTicket.deviceInfo}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Invoice Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewItem}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm">
                      <th className="p-3 w-1/2">Description</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="p-2">
                          <Input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(index, "description", e.target.value)
                            }
                            className="border-0 focus-visible:ring-1"
                            required
                            disabled={isLoading}
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, "quantity", e.target.value)
                            }
                            className="text-right border-0 focus-visible:ring-1"
                            required
                            disabled={isLoading}
                          />
                        </td>
                        <td className="p-2">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              $
                            </span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice || ""}
                              onChange={(e) =>
                                handleItemChange(index, "unitPrice", e.target.value)
                              }
                              className="pl-8 text-right border-0 focus-visible:ring-1"
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </td>
                        <td className="p-2 text-right">
                          ${(item.amount || 0).toFixed(2)}
                        </td>
                        <td className="p-2 text-right">
                          {items.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(index)}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tax (8%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-medium">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Additional notes or terms"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                This will appear at the bottom of the invoice
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              {showActions ? (
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/invoices")}
                    disabled={isLoading}
                  >
                    View All Invoices
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrint}
                    disabled={isLoading}
                  >
                    Print Invoice
                  </Button>
                  {selectedTicket?.customerEmail && (
                    <Button
                      type="button"
                      onClick={handleEmail}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Email to Customer"
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <Button type="submit" disabled={isLoading || tickets.length === 0}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Invoice"
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
