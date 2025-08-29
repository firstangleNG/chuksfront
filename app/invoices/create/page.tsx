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
  const [paymentAmount, setPaymentAmount] = useState(0)
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
    return calculateSubtotal() * (taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - discount
  }

  const calculateTotals = () => {
    const subtotal = calculateSubtotal()
    const taxAmount = calculateTax()
    const total = subtotal + taxAmount - discount
    return { subtotal, taxAmount, total }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleEmail = async () => {
    // Implement email functionality here
    toast({
      title: "Email sent",
      description: "Invoice has been sent to the customer's email.",
    })
  }

  const validateForm = () => {
    if (!customerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer name is required",
        variant: "destructive",
      })
      return false
    }
    
    if (items.some(item => !item.description.trim() || item.amount <= 0)) {
      toast({
        title: "Validation Error",
        description: "Please ensure all items have a description and valid amount",
        variant: "destructive",
      })
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
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
      
      // Process payment if amount is greater than 0
      if (paymentAmount > 0) {
        await InvoiceService.processPayment(
          createdInvoice.id,
          paymentAmount,
          paymentMethod
        )
      }
      
      // Store the created invoice ID for the print view
      setCreatedInvoiceId(createdInvoice.id)
      
      // Show success message and redirect
      toast({
        title: "Success",
        description: "Invoice created successfully! Redirecting to invoices...",
        duration: 2000,
      })
      
      // Redirect to invoices list after a short delay
      setTimeout(() => {
        router.push('/invoices')
      }, 1500)
      
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
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter payment amount"
              />
              <p className="text-xs text-muted-foreground">
                Leave as 0 to create an unpaid invoice
              </p>
            </div>

            <div className="space-y-4">
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
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Summary</Label>
                <div className="space-y-2 p-4 bg-muted/50 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span>£{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tax ({taxRate}%)</span>
                    <span>£{calculateTax().toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Discount</span>
                      <span className="text-red-500">-£{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>£{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center mb-4">
                <div className="col-span-5">
                  <Input
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  />
                </div>
                <div className="col-span-2 text-right">
                  £{item.amount.toFixed(2)}
                </div>
                <div className="col-span-1 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addNewItem}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={selectedTicket?.customerName || customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={!!selectedTicket}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={selectedTicket?.customerEmail || customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  disabled={!!selectedTicket}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={selectedTicket?.customerPhone || customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={!!selectedTicket}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceInfo">Device</Label>
                <Input
                  id="deviceInfo"
                  value={selectedTicket?.deviceInfo || deviceInfo}
                  onChange={(e) => setDeviceInfo(e.target.value)}
                  disabled={!!selectedTicket}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Input
                id="notes"
                placeholder="Any additional notes or terms"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This will appear at the bottom of the invoice
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Invoice'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
