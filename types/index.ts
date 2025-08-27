export interface User {
  id: string
  firstname: string
  surname: string
  email: string
  phone: string
  role: "superadmin" | "admin" | "customer"
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  createdAt: string
  updatedAt: string
}

export interface RepairTicket {
  id: string
  trackingId: string
  customerId: string
  customerName: string
  // Prefer separate name fields
  customerFirstname: string
  customerSurname: string
  customerEmail: string
  customerPhone: string
  deviceBrand: string
  deviceModel: string
  deviceImei: string
  deviceSerial: string
  issueType: string
  issueDescription: string
  estimatedCost: number
  estimatedTime: string
  assignedTechnician: string
  status: "diagnosing" | "waiting_customer" | "waiting_parts" | "in_progress" | "completed" | "cancelled"
  totalPaid: number
  balanceDue: number
  payments: TicketPayment[]
  createdAt: string
  updatedAt: string
}

export interface TicketPayment {
  id: string
  amount: number
  method: "cash" | "bank_transfer" | "card"
  date: string
  notes?: string
}

export interface InventoryItem {
  id: string
  partName: string
  quantityAvailable: number
  lowStockThreshold: number
  supplierInfo: string
  unitCost: number
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  repairTicketId: string
  trackingId: string
  customerName: string
  // Optional separate name fields
  customerFirstname?: string
  customerSurname?: string
  customerEmail: string
  customerPhone: string
  deviceInfo: string
  issueDescription: string
  laborCost: number
  partsCost: number
  taxAmount: number
  totalAmount: number
  paymentStatus: "pending" | "paid" | "overdue" | "cancelled"
  paymentMethod?: "cash" | "card" | "online" | "bank_transfer"
  paidAt?: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: "cash" | "card" | "online" | "bank_transfer"
  transactionId?: string
  status: "pending" | "completed" | "failed" | "refunded"
  processedAt: string
  createdAt: string
}

export interface DashboardStats {
  totalTickets: number
  pendingTickets: number
  inProgressTickets: number
  completedTickets: number
  cancelledTickets: number
  totalRevenue: number
  weeklyStats: {
    repairsThisWeek: number
    incomeThisWeek: number
    cancellationsThisWeek: number
  }
  monthlyStats: {
    repairsThisMonth: number
    incomeThisMonth: number
    cancellationsThisMonth: number
  }
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

export interface Notification {
  id: string
  userId: string
  type: "sms" | "email"
  template: NotificationTemplate
  recipient: string
  subject?: string
  message: string
  status: "pending" | "sent" | "failed"
  sentAt?: string
  createdAt: string
}

export interface NotificationTemplate {
  id: string
  name: string
  type: "status_update" | "payment_reminder" | "completion_notice" | "welcome"
  channel: "sms" | "email" | "both"
  subject?: string
  template: string
  variables: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationPreferences {
  userId: string
  emailNotifications: boolean
  smsNotifications: boolean
  statusUpdates: boolean
  paymentReminders: boolean
  completionNotices: boolean
  marketingEmails: boolean
  updatedAt: string
}
