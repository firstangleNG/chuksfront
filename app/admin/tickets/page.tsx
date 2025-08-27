"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Button } from "@/components/ui/button"
import { RepairTicketForm } from "@/components/repair-ticket-form"
import { RepairTicketList } from "@/components/repair-ticket-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { RepairTicket } from "@/types"
import { Plus, ArrowLeft, CheckCircle } from "lucide-react"

function TicketsPageContent() {
  const [view, setView] = useState<"list" | "create" | "edit" | "success">("list")
  const [createdTicket, setCreatedTicket] = useState<RepairTicket | null>(null)
  const [editingTicket, setEditingTicket] = useState<RepairTicket | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTicketCreated = (ticket: RepairTicket) => {
    setCreatedTicket(ticket)
    setView("success")
    setRefreshKey((prev) => prev + 1)
  }

  const handleEditTicket = (ticket: RepairTicket) => {
    setEditingTicket(ticket)
    setView("edit")
  }

  const handleTicketUpdated = (ticket: RepairTicket) => {
    setCreatedTicket(ticket)
    setView("success")
    setRefreshKey((prev) => prev + 1)
  }

  const handleBackToList = () => {
    setView("list")
    setCreatedTicket(null)
    setEditingTicket(null)
  }

  if (view === "success" && createdTicket) {
    return (
      <div className="flex min-h-screen bg-muted/50">
        <AdminSidebar />

        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-green-600">
                  {editingTicket ? "Ticket Updated Successfully!" : "Ticket Created Successfully!"}
                </CardTitle>
                <CardDescription>
                  {editingTicket
                    ? "The repair ticket has been updated with the new information."
                    : "The repair ticket has been created and assigned a tracking ID."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Tracking ID</p>
                      <p className="text-lg font-bold text-primary">{createdTicket.trackingId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Customer</p>
                      <p className="text-sm">{createdTicket.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Device</p>
                      <p className="text-sm">
                        {createdTicket.deviceBrand} {createdTicket.deviceModel}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm capitalize">{createdTicket.status}</p>
                    </div>
                  </div>
                </div>
                <Alert>
                  <AlertDescription>
                    {editingTicket
                      ? `The ticket ${createdTicket.trackingId} has been successfully updated.`
                      : `Please provide the tracking ID ${createdTicket.trackingId} to the customer. They can use this to track their repair progress online.`}
                  </AlertDescription>
                </Alert>
                <Button onClick={handleBackToList} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tickets List
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (view === "edit" && editingTicket) {
    return (
      <div className="flex min-h-screen bg-muted/50">
        <AdminSidebar />

        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => setView("list")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </div>
            <RepairTicketForm
              editTicket={editingTicket}
              onSuccess={handleTicketUpdated}
              onCancel={() => setView("list")}
            />
          </div>
        </main>
      </div>
    )
  }

  if (view === "create") {
    return (
      <div className="flex min-h-screen bg-muted/50">
        <AdminSidebar />

        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button variant="outline" onClick={() => setView("list")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </div>
            <RepairTicketForm onSuccess={handleTicketCreated} onCancel={() => setView("list")} />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/50">
      <AdminSidebar />

      <main className="flex-1 lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Repair Tickets</h1>
              <p className="text-muted-foreground">Manage and track all repair requests</p>
            </div>
            <Button onClick={() => setView("create")}>
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>
          <RepairTicketList key={refreshKey} onEditTicket={handleEditTicket} />
        </div>
      </main>
    </div>
  )
}

export default function AdminTicketsPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
      <TicketsPageContent />
    </ProtectedRoute>
  )
}
