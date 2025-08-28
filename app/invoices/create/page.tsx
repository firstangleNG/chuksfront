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

type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'other'

export default function CreateInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [tickets, setTickets] = useState<RepairTicket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deviceInfo, setDeviceInfo] = useState("")
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "Labor Charges", quantity: 1, unitPrice: 0, amount: 0 },
    { description: "Parts", quantity: 1, unitPrice: 0, amount: 0 },
  ])
  const [taxRate, setTaxRate] = useState(20) // Default 20% tax
  const [discount, setDiscount] = useState(0)
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
    
    // Set default dates and generate invoice number
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)
    
    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    
    setInvoiceDate(formatDate(today))
    setDueDate(formatDate(nextWeek))
    
    // Generate a simple invoice number (e.g., INV-2023-001)
    const invoiceCount = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    setInvoiceNumber(`INV-${today.getFullYear()}-${invoiceCount}`)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { subtotal, taxAmount, total } = calculateTotals()

      const invoiceData = {
        invoiceNumber,
        invoiceDate: new Date(invoiceDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        customerName: selectedTicket?.customerName || customerName,
        customerEmail: selectedTicket?.customerEmail || customerEmail,
        customerPhone: selectedTicket?.customerPhone || customerPhone,
        deviceInfo: selectedTicket?.deviceInfo || deviceInfo,
        trackingId: selectedTicket?.trackingId || '',
        items,
        subtotal,
        tax: taxAmount,
        discount,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'paid' : 'pending',
        createdAt: new Date().toISOString(),
        notes,
        repairTicketId: selectedTicketId || undefined,
      }

      const createdInvoice = await InvoiceService.createInvoice(invoiceData)
      
      toast({
        title: "Success",
        description: "Invoice created successfully!",
      })
      
      // Store the created invoice ID for the print view
      setCreatedInvoiceId(createdInvoice.id)
      
      // Show print dialog after a short delay
      setTimeout(() => {
        window.print()
      }, 500)
      
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

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Create New Invoice</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Header */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (£)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                />
              </div>
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span>£{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tax (8%)</span>
                  <span>£{calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-medium">
                  <span>Total</span>
                  <span>£{calculateTotal().toFixed(2)}</span>
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
