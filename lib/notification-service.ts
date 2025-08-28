import type { Notification, NotificationTemplate, NotificationPreferences, RepairTicket } from "@/types"

import { migrateLocalStorageKey } from "./storage-migration"

// Mock notification storage
const NOTIFICATIONS_KEY = "computerhub_notifications"
const TEMPLATES_KEY = "computerhub_notification_templates"
const PREFERENCES_KEY = "computerhub_notification_preferences"

if (typeof window !== "undefined") {
  migrateLocalStorageKey("repairhub_notifications", NOTIFICATIONS_KEY)
  migrateLocalStorageKey("repairhub_notification_templates", TEMPLATES_KEY)
  migrateLocalStorageKey("repairhub_notification_preferences", PREFERENCES_KEY)
}

// Default notification templates
const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: "1",
    name: "Status Update",
    type: "status_update",
    channel: "both",
    subject: "Repair Status Update - {{trackingId}}",
    template:
      "Hi {{customerFirstname}} {{customerSurname}}, your device repair ({{trackingId}}) status has been updated to: {{status}}. {{additionalInfo}}",
    variables: ["customerFirstname", "customerSurname", "trackingId", "status", "additionalInfo"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Payment Reminder",
    type: "payment_reminder",
    channel: "both",
    subject: "Payment Due - {{trackingId}}",
    template:
      "Hi {{customerFirstname}} {{customerSurname}}, your repair invoice for {{trackingId}} is due. Amount: £{{amount}}. Please pay at your earliest convenience.",
    variables: ["customerFirstname", "customerSurname", "trackingId", "amount"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Completion Notice",
    type: "completion_notice",
    channel: "both",
    subject: "Repair Complete - {{trackingId}}",
    template:
      "Great news {{customerFirstname}} {{customerSurname}}! Your device repair ({{trackingId}}) is complete and ready for pickup. Please visit our store during business hours.",
    variables: ["customerFirstname", "customerSurname", "trackingId"],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export class NotificationService {
  // Initialize default templates if none exist
  static initializeTemplates(): void {
    if (typeof window === "undefined") return
    const existing = localStorage.getItem(TEMPLATES_KEY)
    if (!existing) {
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(DEFAULT_TEMPLATES))
    }
  }

  // Notification CRUD
  static getNotifications(): Notification[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(NOTIFICATIONS_KEY)
    return stored ? JSON.parse(stored) : []
  }

  static saveNotifications(notifications: Notification[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
  }

  // Template CRUD
  static getTemplates(): NotificationTemplate[] {
    if (typeof window === "undefined") return DEFAULT_TEMPLATES
    const stored = localStorage.getItem(TEMPLATES_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_TEMPLATES
  }

  static saveTemplates(templates: NotificationTemplate[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates))
  }

  // Preferences CRUD
  static getPreferences(userId: string): NotificationPreferences {
    if (typeof window === "undefined") {
      return {
        userId,
        emailNotifications: true,
        smsNotifications: true,
        statusUpdates: true,
        paymentReminders: true,
        completionNotices: true,
        marketingEmails: false,
        updatedAt: new Date().toISOString(),
      }
    }

    const stored = localStorage.getItem(PREFERENCES_KEY)
    const allPrefs: NotificationPreferences[] = stored ? JSON.parse(stored) : []
    const userPrefs = allPrefs.find((p) => p.userId === userId)

    return (
      userPrefs || {
        userId,
        emailNotifications: true,
        smsNotifications: true,
        statusUpdates: true,
        paymentReminders: true,
        completionNotices: true,
        marketingEmails: false,
        updatedAt: new Date().toISOString(),
      }
    )
  }

  static savePreferences(preferences: NotificationPreferences): void {
    if (typeof window === "undefined") return

    const stored = localStorage.getItem(PREFERENCES_KEY)
    const allPrefs: NotificationPreferences[] = stored ? JSON.parse(stored) : []
    const index = allPrefs.findIndex((p) => p.userId === preferences.userId)

    if (index >= 0) {
      allPrefs[index] = { ...preferences, updatedAt: new Date().toISOString() }
    } else {
      allPrefs.push({ ...preferences, updatedAt: new Date().toISOString() })
    }

    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(allPrefs))
  }

  // Send notification (mock implementation)
  static async sendNotification(
    userId: string,
    templateType: NotificationTemplate["type"],
    variables: Record<string, string>,
    channels: ("sms" | "email")[] = ["email", "sms"],
  ): Promise<Notification[]> {
    const templates = this.getTemplates()
    const preferences = this.getPreferences(userId)
    const notifications = this.getNotifications()
    const sentNotifications: Notification[] = []

    const template = templates.find((t) => t.type === templateType && t.isActive)
    if (!template) return []

    // Check user preferences
    const shouldSendEmail = channels.includes("email") && preferences.emailNotifications
    const shouldSendSMS = channels.includes("sms") && preferences.smsNotifications

    // Check specific notification type preferences
    const typeAllowed =
      (templateType === "status_update" && preferences.statusUpdates) ||
      (templateType === "payment_reminder" && preferences.paymentReminders) ||
      (templateType === "completion_notice" && preferences.completionNotices) ||
      templateType === "welcome"

    if (!typeAllowed) return []

    // Replace template variables
    let message = template.template
    let subject = template.subject || ""

    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{{${key}}}`, "g"), value)
      subject = subject.replace(new RegExp(`{{${key}}}`, "g"), value)
    })

    // Send email notification
    if (shouldSendEmail && (template.channel === "email" || template.channel === "both")) {
      const emailNotification: Notification = {
        id: Date.now().toString() + "_email",
        userId,
        type: "email",
        template,
        recipient: variables.customerEmail || variables.email || "",
        subject,
        message,
        status: "sent", // Mock as sent immediately
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      notifications.push(emailNotification)
      sentNotifications.push(emailNotification)
    }

    // Send SMS notification
    if (shouldSendSMS && (template.channel === "sms" || template.channel === "both")) {
      const smsNotification: Notification = {
        id: Date.now().toString() + "_sms",
        userId,
        type: "sms",
        template,
        recipient: variables.customerPhone || variables.phone || "",
        message,
        status: "sent", // Mock as sent immediately
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      notifications.push(smsNotification)
      sentNotifications.push(smsNotification)
    }

    this.saveNotifications(notifications)
    return sentNotifications
  }

  // Send repair status update notification
  static async sendRepairStatusUpdate(ticket: RepairTicket, oldStatus?: string): Promise<void> {
    const statusMessages = {
      pending: "Your repair request has been received and is pending review.",
      "in-progress": "Your device is currently being repaired by our technicians.",
      completed: "Your device repair is complete and ready for pickup!",
      cancelled: "Your repair request has been cancelled. Please contact us for more information.",
    }

    await this.sendNotification(ticket.customerId, "status_update", {
  customerFirstname: ticket.customerFirstname || "",
  customerSurname: ticket.customerSurname || "",
  customerName: ticket.customerName || `${ticket.customerFirstname || ""} ${ticket.customerSurname || ""}`.trim(),
      customerEmail: ticket.customerEmail,
      customerPhone: ticket.customerPhone,
      trackingId: ticket.trackingId,
      status: ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1),
      additionalInfo: statusMessages[ticket.status] || "",
    })
  }

  // Send completion notice
  static async sendCompletionNotice(ticket: RepairTicket): Promise<void> {
    await this.sendNotification(ticket.customerId, "completion_notice", {
  customerFirstname: ticket.customerFirstname || "",
  customerSurname: ticket.customerSurname || "",
  customerName: ticket.customerName || `${ticket.customerFirstname || ""} ${ticket.customerSurname || ""}`.trim(),
      customerEmail: ticket.customerEmail,
      customerPhone: ticket.customerPhone,
      trackingId: ticket.trackingId,
    })
  }

  // Get notifications for a user
  static getNotificationsForUser(userId: string): Notification[] {
    const notifications = this.getNotifications()
    return notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

// Initialize templates on service load
if (typeof window !== "undefined") {
  NotificationService.initializeTemplates()
}
