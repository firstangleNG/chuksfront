"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NotificationService } from "@/lib/notification-service"
import type { NotificationPreferences } from "@/types"

interface NotificationPreferencesProps {
  userId: string
}

export function NotificationPreferencesComponent({ userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const prefs = NotificationService.getPreferences(userId)
    setPreferences(prefs)
    setIsLoading(false)
  }, [userId])

  const handleSave = async () => {
    if (!preferences) return

    setIsSaving(true)
    try {
      NotificationService.savePreferences(preferences)
      // Show success message (you could add a toast here)
    } catch (error) {
      console.error("Failed to save preferences:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return
    setPreferences({ ...preferences, [key]: value })
  }

  if (isLoading || !preferences) {
    return <div>Loading preferences...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how you receive updates about your repairs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications" className="text-sm font-medium">
              Email Notifications
            </Label>
            <Switch
              id="email-notifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => updatePreference("emailNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications" className="text-sm font-medium">
              SMS Notifications
            </Label>
            <Switch
              id="sms-notifications"
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) => updatePreference("smsNotifications", checked)}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Notification Types</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="status-updates" className="text-sm">
                Repair Status Updates
              </Label>
              <Switch
                id="status-updates"
                checked={preferences.statusUpdates}
                onCheckedChange={(checked) => updatePreference("statusUpdates", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="payment-reminders" className="text-sm">
                Payment Reminders
              </Label>
              <Switch
                id="payment-reminders"
                checked={preferences.paymentReminders}
                onCheckedChange={(checked) => updatePreference("paymentReminders", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="completion-notices" className="text-sm">
                Completion Notices
              </Label>
              <Switch
                id="completion-notices"
                checked={preferences.completionNotices}
                onCheckedChange={(checked) => updatePreference("completionNotices", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="marketing-emails" className="text-sm">
                Marketing Emails
              </Label>
              <Switch
                id="marketing-emails"
                checked={preferences.marketingEmails}
                onCheckedChange={(checked) => updatePreference("marketingEmails", checked)}
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  )
}
