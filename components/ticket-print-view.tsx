"use client"

import type { RepairTicket } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SettingsService } from "@/lib/settings-service" // Import SettingsService
import { useEffect, useState } from "react" // Import useEffect and useState

interface TicketPrintViewProps {
  ticket: RepairTicket
}

export function TicketPrintView({ ticket }: TicketPrintViewProps) {
  const currentDate = new Date().toLocaleDateString("en-GB")
  const [termsAndConditions, setTermsAndConditions] = useState<string[]>([]) // State for terms

  useEffect(() => {
    setTermsAndConditions(SettingsService.getTermsAndConditions()) // Fetch terms on mount
  }, [])

  const displayName = (ticket.customerFirstname || ticket.customerSurname)
    ? `${ticket.customerFirstname || ""} ${ticket.customerSurname || ""}`.trim()
    : ticket.customerName || ""

  const formatted = {
    estimatedCost: (ticket.estimatedCost ?? 0).toFixed(2),
    vatAmount: ((ticket.estimatedCost ?? 0) * (ticket.vatRate ?? 0) / 100).toFixed(2),
    grandTotal: (ticket.grandTotal ?? (ticket.estimatedCost ?? 0)).toFixed(2),
    totalPaid: (ticket.totalPaid ?? 0).toFixed(2),
    balanceDue: (ticket.balanceDue ?? 0).toFixed(2),
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black print:shadow-none">
      {/* Letterhead Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">RepairHub Solutions</h1>
            <p className="text-sm text-gray-600">Professional Repair Services</p>
            <p className="text-sm text-gray-500">123 Tech Lane, Innovation City, UK</p>
            <p className="text-sm text-gray-500">Phone: +44 123 456 7890 | Email: info@repairhubsolutions.com</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Date: {currentDate}</div>
            <div className="text-xl font-semibold mt-4">Repair Ticket</div>
            <div className="text-lg font-bold">{ticket.trackingId}</div>
          </div>
        </div>
      </div>

      {/* Ticket Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Repair Ticket</span>
            <Badge className="text-lg px-3 py-1">{ticket.trackingId}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <p>
                  <strong>Name:</strong> {displayName}
                </p>
                <p>
                  <strong>Phone:</strong> {ticket.customerPhone}
                </p>
                <p>
                  <strong>Email:</strong> {ticket.customerEmail}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Device Information</h3>
                <p>
                  <strong>Brand:</strong> {ticket.deviceBrand}
                </p>
                <p>
                  <strong>Model:</strong> {ticket.deviceModel}
                </p>
                <p>
                  <strong>IMEI/Serial:</strong> {ticket.deviceImei || ticket.deviceSerial || "N/A"}
                </p>
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Repair Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Repair Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p>
                <strong>Issue Type:</strong> {ticket.issueType}
              </p>
              <p>
                <strong>Status:</strong>
                <Badge className="ml-2">{ticket.status.replace("-", " ").toUpperCase()}</Badge>
              </p>
            </div>
            <div>
              <p>
                <strong>Issue Description:</strong>
              </p>
              <p className="mt-1 p-3 bg-gray-50 rounded border">{ticket.issueDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <p>
                <strong>Estimated Cost:</strong> £{formatted.estimatedCost}
              </p>
              <p>
                <strong>Estimated Time:</strong> {ticket.estimatedTime}
              </p>
            </div>
            <div>
              <p>
                <strong>Assigned Technician:</strong> {ticket.assignedTechnician}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      {ticket.payments && ticket.payments.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-3">
              {ticket.payments.map((payment, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p>
                      <strong>Method:</strong> {payment.method}
                    </p>
                    <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString("en-GB")}</p>
                  </div>
                  <p className="font-semibold">£{Number(payment.amount).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Paid:</span>
                <span>£{formatted.totalPaid}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Balance Due:</span>
                <span>£{formatted.balanceDue}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            {termsAndConditions.map((term, index) => (
              <p key={index}>• {term}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-8 text-sm text-gray-500">
        <p>Thank you for choosing RepairHub for your repair needs!</p>
        <p>Contact us: info@repairhub.com | +44 123 456 7890</p>
      </div>
    </div>
  )
}
