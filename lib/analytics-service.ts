import type { DashboardStats } from "@/types"
import { RepairService } from "./repair-service"

export class AnalyticsService {
  static getDashboardStats(): DashboardStats {
    const tickets = RepairService.getTickets()
    const now = new Date()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Filter tickets by time periods
    const thisWeekTickets = tickets.filter((ticket) => new Date(ticket.createdAt) >= weekStart)
    const thisMonthTickets = tickets.filter((ticket) => new Date(ticket.createdAt) >= monthStart)

    // Calculate revenue (only from completed tickets)
    const completedTickets = tickets.filter((ticket) => ticket.status === "completed")
    const totalRevenue = completedTickets.reduce((sum, ticket) => sum + ticket.estimatedCost, 0)
    const weeklyRevenue = thisWeekTickets
      .filter((ticket) => ticket.status === "completed")
      .reduce((sum, ticket) => sum + ticket.estimatedCost, 0)
    const monthlyRevenue = thisMonthTickets
      .filter((ticket) => ticket.status === "completed")
      .reduce((sum, ticket) => sum + ticket.estimatedCost, 0)

    return {
      totalTickets: tickets.length,
      pendingTickets: tickets.filter((t) => t.status === "pending").length,
      inProgressTickets: tickets.filter((t) => t.status === "in-progress").length,
      completedTickets: tickets.filter((t) => t.status === "completed").length,
      cancelledTickets: tickets.filter((t) => t.status === "cancelled").length,
      totalRevenue,
      weeklyStats: {
        repairsThisWeek: thisWeekTickets.length,
        incomeThisWeek: weeklyRevenue,
        cancellationsThisWeek: thisWeekTickets.filter((t) => t.status === "cancelled").length,
      },
      monthlyStats: {
        repairsThisMonth: thisMonthTickets.length,
        incomeThisMonth: monthlyRevenue,
        cancellationsThisMonth: thisMonthTickets.filter((t) => t.status === "cancelled").length,
      },
    }
  }

  static getRevenueByMonth(months = 6): { month: string; revenue: number }[] {
    const tickets = RepairService.getTickets().filter((t) => t.status === "completed")
    const now = new Date()
    const result = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

      const monthTickets = tickets.filter((ticket) => {
        const ticketDate = new Date(ticket.createdAt)
        return ticketDate >= date && ticketDate < nextMonth
      })

      const revenue = monthTickets.reduce((sum, ticket) => sum + ticket.estimatedCost, 0)

      result.push({
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue,
      })
    }

    return result
  }

  static getTicketsByStatus(): { status: string; count: number }[] {
    const tickets = RepairService.getTickets()
    const statusCounts = tickets.reduce(
      (acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace("-", " ").toUpperCase(),
      count,
    }))
  }
}
