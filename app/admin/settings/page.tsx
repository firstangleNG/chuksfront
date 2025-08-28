"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Settings, Save, Bell, Mail, MessageSquare } from "lucide-react"

interface SystemSettings {
  shopName: string
  shopAddress: string
  shopPhone: string
  shopEmail: string
  termsAndConditions: string
  emailNotifications: boolean
  smsNotifications: boolean
  autoInvoiceGeneration: boolean
  lowStockThreshold: number
}

function SettingsContent() {
  const [settings, setSettings] = useState<SystemSettings>({
  shopName: "Chukticketingsystem",
    shopAddress: "123 Main Street, City, State 12345",
    shopPhone: "+1 (555) 123-4567",
  shopEmail: "info@Chukticketingsystem.com",
    termsAndConditions: "By signing this repair ticket, you agree to our terms and conditions...",
    emailNotifications: true,
    smsNotifications: true,
    autoInvoiceGeneration: true,
    lowStockThreshold: 10,
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("systemSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleInputChange = (field: keyof SystemSettings, value: string | number | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem("systemSettings", JSON.stringify(settings))
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error saving settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-muted/50">
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Settings className="h-8 w-8" />
              System Settings
            </h1>
            <p className="text-muted-foreground">Configure your repair shop settings and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Shop Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
                <CardDescription>Basic information about your repair shop</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shopName">Shop Name</Label>
                    <Input
                      id="shopName"
                      value={settings.shopName}
                      onChange={(e) => handleInputChange("shopName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shopPhone">Phone Number</Label>
                    <Input
                      id="shopPhone"
                      value={settings.shopPhone}
                      onChange={(e) => handleInputChange("shopPhone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopEmail">Email Address</Label>
                  <Input
                    id="shopEmail"
                    type="email"
                    value={settings.shopEmail}
                    onChange={(e) => handleInputChange("shopEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopAddress">Shop Address</Label>
                  <Textarea
                    id="shopAddress"
                    value={settings.shopAddress}
                    onChange={(e) => handleInputChange("shopAddress", e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Terms and Conditions</CardTitle>
                <CardDescription>Default terms and conditions for repair tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="termsAndConditions">Terms and Conditions Text</Label>
                  <Textarea
                    id="termsAndConditions"
                    value={settings.termsAndConditions}
                    onChange={(e) => handleInputChange("termsAndConditions", e.target.value)}
                    rows={6}
                    placeholder="Enter your terms and conditions..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure how customers receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Send email updates to customers</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">Send SMS updates to customers</p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleInputChange("smsNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* System Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>Configure system behavior and automation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoInvoiceGeneration">Auto Invoice Generation</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate invoices when repairs are completed
                    </p>
                  </div>
                  <Switch
                    id="autoInvoiceGeneration"
                    checked={settings.autoInvoiceGeneration}
                    onCheckedChange={(checked) => handleInputChange("autoInvoiceGeneration", checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => handleInputChange("lowStockThreshold", Number.parseInt(e.target.value) || 10)}
                    min="1"
                    className="max-w-xs"
                  />
                  <p className="text-sm text-muted-foreground">Alert when inventory items fall below this quantity</p>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <SettingsContent />
    </ProtectedRoute>
  )
}
