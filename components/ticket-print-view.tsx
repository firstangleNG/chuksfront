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
    <div className="max-w-3xl mx-auto p-4 bg-white text-black text-2xs" style={{ lineHeight: '1.2' }}>
      {/* Letterhead Section */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-sm font-bold text-gray-800">Chukticketingsystem</h1>
            </div>
            <p className="text-2xs text-gray-600">Professional Repair Services</p>
            <p className="text-2xs text-gray-500">123 Tech Lane, Innovation City, UK</p>
            <p className="text-2xs text-gray-500">Phone: +44 123 456 7890 | Email: info@repairhubsolutions.com</p>
          </div>
          <div className="text-right">
            <div className="text-2xs text-gray-600">Date: {currentDate}</div>
            <div className="text-sm font-semibold mt-1">Repair Ticket</div>
            <div className="text-sm font-bold">{ticket.trackingId}</div>
          </div>
        </div>
      </div>

      {/* Ticket Info */}
      <Card className="mb-4 p-2">
        <div className="flex justify-between items-center pb-2 border-b">
          <h3 className="text-xs font-semibold">Repair Ticket</h3>
          <Badge className="text-xs px-2 py-0.5">{ticket.trackingId}</Badge>
        </div>
        <div className="p-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold mb-1">Customer Information</h4>
              <p className="text-2xs">
                <span className="font-medium">Name:</span> {displayName}
              </p>
              <p className="text-2xs">
                <span className="font-medium">Phone:</span> {ticket.customerPhone}
              </p>
              <p className="text-2xs">
                <span className="font-medium">Email:</span> {ticket.customerEmail}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-1">Device Information</h4>
              <p className="text-2xs">
                <span className="font-medium">Brand:</span> {ticket.deviceBrand}
              </p>
              <p className="text-2xs">
                <span className="font-medium">Model:</span> {ticket.deviceModel}
              </p>
              <p className="text-2xs">
                <span className="font-medium">IMEI/Serial:</span> {ticket.deviceImei || ticket.deviceSerial || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Repair Details */}
      <Card className="mb-4 p-2">
        <div className="pb-2 border-b">
          <h3 className="text-xs font-semibold">Repair Details</h3>
        </div>
        <div className="p-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-2xs">
                <span className="font-medium">Issue Type:</span> {ticket.issueType}
              </p>
              <p className="text-2xs flex items-center">
                <span className="font-medium">Status:</span>
                <Badge className="ml-1 h-4 text-2xs px-1.5">{ticket.status.replace("-", " ").toUpperCase()}</Badge>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-2xs">
                <span className="font-medium">Est. Cost:</span> £{formatted.estimatedCost}
              </p>
              <p className="text-2xs">
                <span className="font-medium">Est. Time:</span> {ticket.estimatedTime}
              </p>
            </div>
          </div>
          <div>
            <p className="text-2xs font-medium">Issue Description:</p>
            <p className="mt-0.5 p-2 text-2xs bg-gray-50 rounded border">{ticket.issueDescription}</p>
          </div>
          <p className="text-2xs">
            <span className="font-medium">Technician:</span> {ticket.assignedTechnician || 'Not assigned'}
          </p>
        </div>
      </Card>

      {/* Payment Information */}
      {ticket.payments && ticket.payments.length > 0 && (
        <Card className="mb-4 p-2">
          <div className="pb-2 border-b">
            <h3 className="text-xs font-semibold">Payment Information</h3>
          </div>
          <div className="p-2 space-y-2">
            {ticket.payments.map((payment, index) => (
              <div key={index} className="flex justify-between items-center p-2 text-2xs bg-gray-50 rounded border">
                <div>
                  <p className="font-medium">{payment.method}</p>
                  <p className="text-gray-600">{new Date(payment.date).toLocaleDateString("en-GB")}</p>
                </div>
                <p className="font-semibold">£{Number(payment.amount).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Total Paid:</span>
                <span className="font-semibold">£{formatted.totalPaid}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Balance Due:</span>
                <span className="font-semibold">£{formatted.balanceDue}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Terms and Conditions */}
      <Card className="p-2">
        <div className="pb-2 border-b">
          <h3 className="text-xs font-semibold">Terms and Conditions</h3>
        </div>
        <div className="p-2">
          <ul className="space-y-1 text-2xs">
            {termsAndConditions.map((term, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1">•</span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center mt-4 pt-2 border-t text-2xs text-gray-500">
        <p>Thank you for choosing Chukticketingsystem for your repair needs!</p>
        <p>Contact us: info@Chukticketingsystem.com | +44 123 456 7890</p>
      </div>
    </div>
  )
}
