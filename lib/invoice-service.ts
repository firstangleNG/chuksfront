import type { Invoice, Payment, RepairTicket } from "@/types"

const INVOICES_STORAGE_KEY = "repairhub_invoices"
const PAYMENTS_STORAGE_KEY = "repairhub_payments"

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

  static generateInvoiceFromTicket(ticket: RepairTicket, laborCost = 0, partsCost = 0): Invoice {
    const invoices = this.getInvoices()
    const subtotal = laborCost + partsCost
    const taxRate = 0.08 // 8% tax
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    const newInvoice: Invoice = {
      id: Date.now().toString(),
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
      paymentStatus: "pending",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
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
    return invoices.find((inv) => inv.id === id) || null
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
