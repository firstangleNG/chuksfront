"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NotificationService } from "@/lib/notification-service"
import type { Notification, NotificationTemplate } from "@/types"
import { Mail, MessageSquare, Clock, CheckCircle, XCircle, Plus, Edit, Trash2 } from "lucide-react"

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allNotifications = NotificationService.getNotifications()
    const allTemplates = NotificationService.getTemplates()
    setNotifications(allNotifications.slice(0, 50)) // Show recent 50
    setTemplates(allTemplates)
    setIsLoading(false)
  }

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

  const handleSaveTemplate = (template: NotificationTemplate) => {
    const allTemplates = NotificationService.getTemplates()
    const index = allTemplates.findIndex((t) => t.id === template.id)

    if (index >= 0) {
      allTemplates[index] = { ...template, updatedAt: new Date().toISOString() }
    } else {
      allTemplates.push({
        ...template,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    NotificationService.saveTemplates(allTemplates)
    setTemplates(allTemplates)
    setEditingTemplate(null)
  }

  const handleDeleteTemplate = (templateId: string) => {
    const allTemplates = NotificationService.getTemplates()
    const filteredTemplates = allTemplates.filter((t) => t.id !== templateId)
    NotificationService.saveTemplates(filteredTemplates)
    setTemplates(filteredTemplates)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 lg:ml-64 p-8">
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Manage notification templates and view notification history</p>
          </div>

          <Tabs defaultValue="history" className="space-y-6">
            <TabsList>
              <TabsTrigger value="history">Notification History</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>Latest notifications sent to customers</CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No notifications sent yet</p>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(notification.type)}
                            {getStatusIcon(notification.status)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium">
                                {notification.subject || notification.template.name}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {notification.type.toUpperCase()}
                                </Badge>
                                <Badge
                                  variant={notification.status === "sent" ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {notification.status.toUpperCase()}
                                </Badge>
                              </div>
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
            </TabsContent>

            <TabsContent value="templates">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Notification Templates</h2>
                  <Button
                    onClick={() =>
                      setEditingTemplate({
                        id: "",
                        name: "",
                        type: "status_update",
                        channel: "both",
                        subject: "",
                        template: "",
                        variables: [],
                        isActive: true,
                        createdAt: "",
                        updatedAt: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Template
                  </Button>
                </div>

                <div className="grid gap-4">
                  {templates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription>
                              Type: {template.type} • Channel: {template.channel}
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={template.isActive ? "default" : "secondary"}>
                              {template.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => setEditingTemplate(template)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {template.subject && (
                          <div className="mb-2">
                            <Label className="text-xs font-medium text-muted-foreground">Subject:</Label>
                            <p className="text-sm">{template.subject}</p>
                          </div>
                        )}
                        <div className="mb-2">
                          <Label className="text-xs font-medium text-muted-foreground">Template:</Label>
                          <p className="text-sm">{template.template}</p>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Variables:</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Template Editor Modal */}
          {editingTemplate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
                <CardHeader>
                  <CardTitle>{editingTemplate.id ? "Edit Template" : "Create Template"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-subject">Subject (for emails)</Label>
                    <Input
                      id="template-subject"
                      value={editingTemplate.subject || ""}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-content">Template Content</Label>
                    <Textarea
                      id="template-content"
                      rows={4}
                      value={editingTemplate.template}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, template: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="template-active"
                      checked={editingTemplate.isActive}
                      onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, isActive: checked })}
                    />
                    <Label htmlFor="template-active">Active</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                      Cancel
                    </Button>
                    <Button onClick={() => handleSaveTemplate(editingTemplate)}>Save Template</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
