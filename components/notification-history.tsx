"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NotificationService } from "@/lib/notification-service"
import type { Notification } from "@/types"
import { Mail, MessageSquare, Clock, CheckCircle, XCircle } from "lucide-react"

interface NotificationHistoryProps {
  userId: string
}

export function NotificationHistory({ userId }: NotificationHistoryProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userNotifications = NotificationService.getNotificationsForUser(userId)
    setNotifications(userNotifications)
    setIsLoading(false)
  }, [userId])

  const getStatusIcon = (status: Notification["status"]) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: Notification["type"]) => {
    return type === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />
  }

  if (isLoading) {
    return <div>Loading notification history...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification History</CardTitle>
        <CardDescription>Recent notifications sent to you</CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(notification.type)}
                  {getStatusIcon(notification.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{notification.subject || notification.template.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {notification.type.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>To: {notification.recipient}</span>
                    <span>
                      {notification.sentAt
                        ? new Date(notification.sentAt).toLocaleString()
                        : new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
