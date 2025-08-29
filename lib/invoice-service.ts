import type { Payment, RepairTicket } from "@/types"
import { RepairService } from "./repair-service"
import { migrateLocalStorageKey } from "./storage-migration"

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  deviceInfo: string
  trackingId: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  taxRate?: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'partially_paid'
  notes?: string
  repairTicketId?: string
  issueDescription?: string
  laborCost?: number
  partsCost?: number
  taxAmount?: number
  totalAmount?: number
  status: string
  paidAt?: string
  createdAt: string
  updatedAt: string
  payments: Payment[]
}

const INVOICES_STORAGE_KEY = "computerhub_invoices"
const PAYMENTS_STORAGE_KEY = "computerhub_payments"

if (typeof window !== "undefined") {
  migrateLocalStorageKey("repairhub_invoices", INVOICES_STORAGE_KEY)
  migrateLocalStorageKey("repairhub_payments", PAYMENTS_STORAGE_KEY)
}

export interface InvoiceInput {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  deviceInfo: string
  trackingId: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    amount: number
  }>
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'overdue'
  notes?: string
  repairTicketId?: string
}

export class InvoiceService {
  static createInvoice(invoiceData: InvoiceInput) {
    const invoices = this.getInvoices()
    const issueDescription = invoiceData.items.map(item => item.description).join(', ')
    const laborCost = invoiceData.items.find(item => item.description.toLowerCase().includes('labor'))?.amount || 0
    const partsCost = invoiceData.items.find(item => !item.description.toLowerCase().includes('labor'))?.amount || 0
    
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `INV-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      payments: [],
      issueDescription,
      laborCost,
      partsCost,
      taxAmount: invoiceData.tax,
      totalAmount: invoiceData.total,
      trackingId: invoiceData.trackingId || '',
      taxRate: 20, // Default tax rate if not provided
      paymentStatus: invoiceData.paymentStatus || 'pending',
      paymentMethod: invoiceData.paymentMethod || 'cash',
      deviceInfo: invoiceData.deviceInfo || '',
      customerPhone: invoiceData.customerPhone || ''
    }
    
    invoices.push(newInvoice)
    this.saveInvoices(invoices)
    
    // If there's a repair ticket ID, update the ticket's status
    if (invoiceData.repairTicketId) {
      try {
        const ticket = RepairService.getTicketById(invoiceData.repairTicketId)
        if (ticket) {
          // Update ticket status to 'invoiced' or similar if needed
          const updatedTicket = {
            ...ticket,
            status: 'invoiced',
            updatedAt: new Date().toISOString()
          }
          RepairService.updateTicket(ticket.id, updatedTicket)
        }
      } catch (error) {
        console.error('Error updating repair ticket:', error)
      }
    }
    
    return newInvoice
  }

  static getInvoices(): Invoice[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(INVOICES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static getInvoiceById(id: string): Invoice | null {
    const invoices = this.getInvoices()
    const invoice = invoices.find((invoice) => invoice.id === id)
    if (!invoice) return null
    
    // Add related payments
    const payments = this.getPaymentsByInvoiceId(id)
    return {
      ...invoice,
      payments
    }
  }

  static getInvoicesByTicketId(ticketId: string): Invoice[] {
    const invoices = this.getInvoices()
    return invoices.filter((invoice) => invoice.repairTicketId === ticketId)
  }

  static saveInvoices(invoices: Invoice[]): void {
    if (typeof window === "undefined") return
    // Ensure we don't store any functions or undefined values
    const sanitizedInvoices = invoices.map(invoice => ({
      ...invoice,
      items: invoice.items.map(item => ({
        description: item.description || '',
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        amount: item.amount || 0
      }))
    }))
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(sanitizedInvoices))
  }

  static getPayments(): Payment[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static savePayments(payments: Payment[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(payments))
  }

  static generateInvoiceFromTicket(ticket: RepairTicket, laborCost = 0, partsCost = 0): Invoice | null {
    // Only generate invoice if ticket is completed
    if (ticket.status !== 'completed') {
      console.warn('Cannot generate invoice: Ticket is not in completed status')
      return null
    }

    // Check if ticket is fully paid
    const balancePaid = (ticket.paidAmount || 0) >= (ticket.totalAmount || 0)
    if (!balancePaid) {
      console.warn('Cannot generate invoice: Ticket has outstanding balance')
      return null
    }

    const invoices = this.getInvoices()
    const subtotal = laborCost + partsCost
    const taxRate = 0.20 // 20% tax
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    // Check if invoice already exists for this ticket
    const existingInvoice = invoices.find(inv => inv.repairTicketId === ticket.id)
    if (existingInvoice) {
      console.log('Invoice already exists for this ticket:', existingInvoice.id)
      return existingInvoice
    }

    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      customerName: ticket.customerName || `${ticket.customerFirstname || ""} ${ticket.customerSurname || ""}`.trim(),
      customerEmail: ticket.customerEmail,
      customerPhone: ticket.customerPhone,
      deviceInfo: `${ticket.deviceBrand || ''} ${ticket.deviceModel || ''}`.trim(),
      trackingId: ticket.trackingId || '',
      items: [
        {
          description: 'Labor',
          quantity: 1,
          unitPrice: laborCost,
          amount: laborCost
        },
        {
          description: 'Parts',
          quantity: 1,
          unitPrice: partsCost,
          amount: partsCost
        }
      ],
      subtotal,
      tax: taxAmount,
      taxRate: taxRate * 100, // Convert to percentage
      discount: 0,
      total: totalAmount,
      paymentStatus: "paid",
      paymentMethod: ticket.payments?.[0]?.method || "cash",
      repairTicketId: ticket.id,
      issueDescription: ticket.issueDescription,
      laborCost,
      partsCost,
      taxAmount,
      totalAmount,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payments: ticket.payments || []
    }

    invoices.push(newInvoice)
    this.saveInvoices(invoices)
    return newInvoice
  }

  static updateInvoice(id: string, updates: Partial<Omit<Invoice, 'id' | 'createdAt'>>): Invoice | null {
    const invoices = this.getInvoices()
    const index = invoices.findIndex((inv) => inv.id === id)

    if (index === -1) return null

    // Only allow updates to certain fields
    const allowedUpdates: Partial<Omit<Invoice, 'id' | 'createdAt'>> = {
      ...updates,
      updatedAt: new Date().toISOString(),
      // Ensure required fields are not removed
      invoiceNumber: updates.invoiceNumber || invoices[index].invoiceNumber,
      customerName: updates.customerName || invoices[index].customerName,
      total: updates.total ?? invoices[index].total
    }

    // If payment status is being updated to 'paid', set paidAt
    if (updates.paymentStatus === 'paid' && invoices[index].paymentStatus !== 'paid') {
      allowedUpdates.paidAt = new Date().toISOString()
    }

    const updatedInvoice = {
      ...invoices[index],
      ...allowedUpdates
    }

    invoices[index] = updatedInvoice
    this.saveInvoices(invoices)
    return updatedInvoice
  }

  static getPaymentsByInvoiceId(invoiceId: string) {
    const payments = this.getPayments()
    return payments.filter(payment => payment.invoiceId === invoiceId)
  }

  static getInvoiceByTrackingId(trackingId: string): Invoice | null {
    const invoices = this.getInvoices()
    return invoices.find((inv) => inv.trackingId === trackingId) || null
  }

  static processPayment(
    invoiceId: string,
    amount: number,
    method: "cash" | "card" | "online" | "bank_transfer",
    transactionId?: string,
  ): Payment {
    const payments = this.getPayments()
    const invoice = this.getInvoiceById(invoiceId)
    
    if (!invoice) {
      throw new Error(`Invoice with ID ${invoiceId} not found`)
    }

    const payment: Payment = {
      id: `PAY-${Date.now()}`,
      invoiceId,
      amount,
      method,
      transactionId: transactionId || undefined,
      paymentDate: new Date().toISOString(),
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add payment to the invoice
    const updatedInvoice: Invoice = {
      ...invoice,
      payments: [...(invoice.payments || []), payment],
      paymentMethod: method,
      updatedAt: new Date().toISOString()
    }

    // Update invoice status if fully paid
    const totalPaid = (invoice.payments || []).reduce((sum, p) => sum + p.amount, 0) + amount
    if (totalPaid >= invoice.total) {
      updatedInvoice.paymentStatus = 'paid'
      updatedInvoice.status = 'paid'
    } else if (totalPaid > 0) {
      updatedInvoice.paymentStatus = 'partially_paid'
    }

    // Update the invoice
    this.updateInvoice(invoiceId, updatedInvoice)

    // Save the payment
    payments.push(payment)
    this.savePayments(payments)

    return payment
  }

  static getOverdueInvoices(): Invoice[] {
    const invoices = this.getInvoices()
    const now = new Date()
    return invoices.filter((inv) => inv.paymentStatus === "pending" && new Date(inv.dueDate) < now)
  }

  static getInvoicesByCustomerEmail(email: string): Invoice[] {
    const invoices = this.getInvoices()
    return invoices.filter((inv) => inv.customerEmail === email)
  }

  static deleteInvoice(id: string): boolean {
    const invoices = this.getInvoices()
    const invoiceToDelete = invoices.find(inv => inv.id === id)
    
    if (!invoiceToDelete) return false
    
    // If this invoice is linked to a repair ticket, update the ticket
    if (invoiceToDelete.repairTicketId) {
      try {
        const ticket = RepairService.getTicketById(invoiceToDelete.repairTicketId)
        if (ticket) {
          // Reset ticket status if needed
          const updatedTicket = {
            ...ticket,
            status: 'completed', // or whatever status is appropriate
            updatedAt: new Date().toISOString()
          }
          RepairService.updateTicket(ticket.id, updatedTicket)
        }
      } catch (error) {
        console.error('Error updating repair ticket after invoice deletion:', error)
      }
    }
    
    const filtered = invoices.filter((inv) => inv.id !== id)
    this.saveInvoices(filtered)
    return true
  }
}
