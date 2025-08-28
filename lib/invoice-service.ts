import type { Invoice, Payment, RepairTicket } from "@/types"

import { migrateLocalStorageKey } from "./storage-migration"

const INVOICES_STORAGE_KEY = "computerhub_invoices"
const PAYMENTS_STORAGE_KEY = "computerhub_payments"

if (typeof window !== "undefined") {
  migrateLocalStorageKey("repairhub_invoices", INVOICES_STORAGE_KEY)
  migrateLocalStorageKey("repairhub_payments", PAYMENTS_STORAGE_KEY)
}

export class InvoiceService {
  static getInvoices(): Invoice[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(INVOICES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static saveInvoices(invoices: Invoice[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices))
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
    const balanceDue = (ticket.balanceDue || 0) <= 0
    if (!balanceDue) {
      console.warn('Cannot generate invoice: Ticket has outstanding balance')
      return null
    }

    const invoices = this.getInvoices()
    const subtotal = laborCost + partsCost
    const taxRate = 0.08 // 8% tax
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
      repairTicketId: ticket.id,
      trackingId: ticket.trackingId,
      customerName: ticket.customerName || `${ticket.customerFirstname || ""} ${ticket.customerSurname || ""}`.trim(),
      customerFirstname: ticket.customerFirstname,
      customerSurname: ticket.customerSurname,
      customerEmail: ticket.customerEmail,
      customerPhone: ticket.customerPhone,
      deviceInfo: `${ticket.deviceBrand} ${ticket.deviceModel}`,
      issueDescription: ticket.issueDescription,
      laborCost,
      partsCost,
      taxAmount,
      totalAmount,
      paymentStatus: "paid", // Since we check for full payment before creating
      paymentMethod: ticket.payments?.[0]?.method || "unknown",
      paidAt: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    invoices.push(newInvoice)
    this.saveInvoices(invoices)
    return newInvoice
  }

  static updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const invoices = this.getInvoices()
    const index = invoices.findIndex((inv) => inv.id === id)

    if (index === -1) return null

    invoices[index] = {
      ...invoices[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.saveInvoices(invoices)
    return invoices[index]
  }

  static getInvoiceById(id: string): Invoice | null {
    const invoices = this.getInvoices()
    const invoice = invoices.find((inv) => inv.id === id)
    if (!invoice) return null
    
    // Add related payments
    const payments = this.getPaymentsByInvoiceId(id)
    return {
      ...invoice,
      payments,
      totalPaid: payments.reduce((sum, payment) => sum + payment.amount, 0)
    }
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
    const invoices = this.getInvoices()

    const payment: Payment = {
      id: Date.now().toString(),
      invoiceId,
      amount,
      method,
      transactionId,
      status: "completed",
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    // Update invoice payment status
    const invoiceIndex = invoices.findIndex((inv) => inv.id === invoiceId)
    if (invoiceIndex !== -1) {
      invoices[invoiceIndex] = {
        ...invoices[invoiceIndex],
        paymentStatus: "paid",
        paymentMethod: method,
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.saveInvoices(invoices)
    }

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
    const filteredInvoices = invoices.filter((inv) => inv.id !== id)

    if (filteredInvoices.length === invoices.length) return false

    this.saveInvoices(filteredInvoices)
    return true
  }
}
