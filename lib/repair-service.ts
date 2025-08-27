import type { RepairTicket } from "@/types"
import { NotificationService } from "./notification-service"
import { InvoiceService } from "./invoice-service"

// Generate tracking ID with format: CH xxxxxxx UK
function generateTrackingId(counter: number): string {
  const prefix = "CH";
  const suffix = "UK";
  const middle = counter.toString().padStart(7, "0");
  return `${prefix} ${middle} ${suffix}`;
}

// Mock repair tickets storage
const STORAGE_KEY = "repairhub_tickets"
const COUNTER_KEY = "repairhub_ticket_counter"

export class RepairService {
  static getTickets(): RepairTicket[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static saveTickets(tickets: RepairTicket[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
  }

  static createTicket(ticketData: Omit<RepairTicket, "id" | "trackingId" | "createdAt" | "updatedAt">): RepairTicket {
    const tickets = this.getTickets()

    let nextCounter = 1;
    if (typeof window !== "undefined") {
      const storedCounter = localStorage.getItem(COUNTER_KEY);
      if (storedCounter) {
        nextCounter = parseInt(storedCounter, 10) + 1;
      }
      localStorage.setItem(COUNTER_KEY, nextCounter.toString());
    }

    const newTicket: RepairTicket = {
      ...ticketData,
      id: Date.now().toString(),
      trackingId: generateTrackingId(nextCounter),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    tickets.push(newTicket)
    this.saveTickets(tickets)

    if (newTicket.totalPaid > 0 || newTicket.balanceDue > 0) {
      const totalCost = newTicket.totalPaid + newTicket.balanceDue
      InvoiceService.generateInvoiceFromTicket(newTicket, totalCost * 0.7, totalCost * 0.3)
    }

    return newTicket
  }

  static updateTicket(id: string, updates: Partial<RepairTicket>): RepairTicket | null {
    const tickets = this.getTickets()
    const index = tickets.findIndex((t) => t.id === id)

    if (index === -1) return null

    const oldStatus = tickets[index].status
    const oldTotalPaid = tickets[index].totalPaid

    tickets[index] = {
      ...tickets[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    this.saveTickets(tickets)

    const updatedTicket = tickets[index]
    const existingInvoice = InvoiceService.getInvoiceByTrackingId(updatedTicket.trackingId)

    if (existingInvoice) {
      const totalCost = updatedTicket.totalPaid + updatedTicket.balanceDue
      InvoiceService.updateInvoice(existingInvoice.id, {
        customerName: updatedTicket.customerName,
        customerEmail: updatedTicket.customerEmail,
        customerPhone: updatedTicket.customerPhone,
        deviceInfo: `${updatedTicket.deviceBrand} ${updatedTicket.deviceModel}`,
        issueDescription: updatedTicket.issueDescription,
        laborCost: totalCost * 0.7,
        partsCost: totalCost * 0.3,
        totalAmount: totalCost * 1.08, // Including 8% tax
        paymentStatus: updatedTicket.balanceDue === 0 ? "paid" : "pending",
      })
    } else if (updatedTicket.totalPaid > 0 || updatedTicket.balanceDue > 0) {
      const totalCost = updatedTicket.totalPaid + updatedTicket.balanceDue
      InvoiceService.generateInvoiceFromTicket(updatedTicket, totalCost * 0.7, totalCost * 0.3)
    }

    if (updates.status && updates.status !== oldStatus) {
      NotificationService.sendRepairStatusUpdate(tickets[index], oldStatus).catch(console.error)

      if (updates.status === "completed") {
        NotificationService.sendCompletionNotice(tickets[index]).catch(console.error)
      }
    }

    if (updates.totalPaid && updates.totalPaid > oldTotalPaid) {
      NotificationService.sendPaymentConfirmation(tickets[index], updates.totalPaid - oldTotalPaid).catch(console.error)
    }

    return tickets[index]
  }

  static deleteTicket(id: string): boolean {
    const tickets = this.getTickets()
    const filteredTickets = tickets.filter((t) => t.id !== id)

    if (filteredTickets.length === tickets.length) return false

    this.saveTickets(filteredTickets)
    return true
  }

  static getTicketById(id: string): RepairTicket | null {
    const tickets = this.getTickets()
    return tickets.find((t) => t.id === id) || null
  }

  static getTicketByTrackingId(trackingId: string): RepairTicket | null {
    const tickets = this.getTickets()
    return tickets.find((t) => t.trackingId === trackingId) || null
  }

  static getTicketsByCustomerId(customerId: string): RepairTicket[] {
    const tickets = this.getTickets()
    return tickets.filter((t) => t.customerId === customerId)
  }

  static processPayment(
    ticketId: string,
    amount: number,
    method: "cash" | "bank_transfer" | "card",
  ): RepairTicket | null {
    const ticket = this.getTicketById(ticketId)
    if (!ticket) return null

    const newPayment = {
      id: Date.now().toString(),
      amount,
      method,
      date: new Date().toISOString(),
      notes: `Payment via ${method}`,
    }

    const updatedPayments = [...ticket.payments, newPayment]
    const newTotalPaid = ticket.totalPaid + amount
    const newBalanceDue = Math.max(0, ticket.balanceDue - amount)

    const updatedTicket = this.updateTicket(ticketId, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
      balanceDue: newBalanceDue,
    })

    if (updatedTicket) {
      const invoice = InvoiceService.getInvoiceByTrackingId(updatedTicket.trackingId)
      if (invoice) {
        InvoiceService.processPayment(invoice.id, amount, method)
      }
    }

    return updatedTicket
  }
}
