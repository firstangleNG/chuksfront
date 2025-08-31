"use client"

import { useEffect, useState } from "react"

// Define the RepairTicket type locally to make the component self-contained
interface RepairTicket {
  trackingId: string;
  customerName?: string;
  customerFirstname?: string;
  customerSurname?: string;
  customerPhone: string;
  customerEmail: string;
  deviceBrand: string;
  deviceModel: string;
  deviceImei?: string;
  deviceSerial?: string;
  issueType: string;
  status: string;
  issueDescription: string;
  assignedTechnician?: string;
  estimatedCost?: number;
  vatRate?: number;
  grandTotal?: number;
  totalPaid?: number;
  balanceDue?: number;
  payments?: {
    method: string;
    date: string;
    amount: number;
  }[];
}

// Mock data to simulate fetching a ticket from an API
const MOCK_TICKET: RepairTicket = {
  trackingId: "RT-87654321",
  customerFirstname: "Jane",
  customerSurname: "Doe",
  customerPhone: "07700 900000",
  customerEmail: "jane.doe@example.com",
  deviceBrand: "Apple",
  deviceModel: "iPhone 13 Pro",
  deviceImei: "359141071234567",
  issueType: "Screen Replacement",
  status: "in-progress",
  issueDescription: "Cracked screen after a fall. Phone still powers on but the touch is unresponsive in the top-right corner.",
  assignedTechnician: "John Smith",
  estimatedCost: 250.00,
  vatRate: 20,
  grandTotal: 300.00,
  totalPaid: 150.00,
  balanceDue: 150.00,
  payments: [
    { method: "Card", date: "2023-10-26T10:00:00Z", amount: 150.00 }
  ]
};

interface TicketPrintViewProps {
  ticket: RepairTicket;
}

function TicketPrintView({ ticket }: TicketPrintViewProps) {
  const currentDate = new Date().toLocaleDateString("en-GB")
  const [termsAndConditions] = useState<string[]>([
    "All repairs are subject to a diagnostic fee if not proceeded with.",
    "We are not responsible for pre-existing damage or issues not disclosed.",
    "Devices left for more than 90 days may be disposed of.",
    "All repairs come with a 30-day warranty on the parts and labor."
  ]);

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
    <div className="max-w-3xl mx-auto p-4 bg-white text-black text-[11px]" style={{ lineHeight: '1.2' }}>
      {/* Letterhead Section */}
      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1">
              <h1 className="text-[11px] font-bold text-gray-800">ComputerHub UK</h1>
            </div>
            <p className="text-[11px] text-gray-600">Professional Repair Services</p>
            <p className="text-[11px] text-gray-500">123 Tech Lane, Innovation City, UK</p>
            <p className="text-[11px] text-gray-500">Phone: +44 123 456 7890 | Email: info@repairhubsolutions.com</p>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-600">Date: {currentDate}</div>
            <div className="text-[11px] font-semibold mt-1">Repair Ticket</div>
            <div className="text-[11px] font-bold">{ticket.trackingId}</div>
          </div>
        </div>
      </div>

      {/* Ticket Info */}
      <div className="mb-4 p-2 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="flex justify-between items-center pb-2 border-b">
          <h3 className="text-[11px] font-semibold">Repair Ticket</h3>
          <div className="text-[11px] px-2 py-0.5 inline-flex items-center rounded-full border bg-secondary text-secondary-foreground">
            {ticket.trackingId}
          </div>
        </div>
        <div className="p-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-[11px] font-semibold mb-1">Customer Information</h4>
              <p className="text-[11px]">
                <span className="font-medium">Name:</span> {displayName}
              </p>
              <p className="text-[11px]">
                <span className="font-medium">Phone:</span> {ticket.customerPhone}
              </p>
              <p className="text-[11px]">
                <span className="font-medium">Email:</span> {ticket.customerEmail}
              </p>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold mb-1">Device Information</h4>
              <p className="text-[11px]">
                <span className="font-medium">Brand:</span> {ticket.deviceBrand}
              </p>
              <p className="text-[11px]">
                <span className="font-medium">Model:</span> {ticket.deviceModel}
              </p>
              <p className="text-[11px]">
                <span className="font-medium">IMEI/Serial:</span> {ticket.deviceImei || ticket.deviceSerial || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Repair Details */}
      <div className="mb-4 p-2 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="pb-2 border-b">
          <h3 className="text-[11px] font-semibold">Repair Details</h3>
        </div>
        <div className="p-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[11px]">
                <span className="font-medium">Issue Type:</span> {ticket.issueType}
              </p>
              <p className="text-[11px] flex items-center">
                <span className="font-medium">Status:</span>
                <div className="ml-1 h-4 text-[11px] px-1.5 inline-flex items-center rounded-full border bg-secondary text-secondary-foreground">
                  {ticket.status.replace("-", " ").toUpperCase()}
                </div>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px]">
                <span className="font-medium">Est. Cost:</span> £{formatted.estimatedCost}
              </p>
              <p className="text-[11px]">
                <span className="font-medium">Est. Time:</span> {ticket.estimatedTime}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium">Issue Description:</p>
            <p className="mt-0.5 p-2 text-[11px] bg-gray-50 rounded border">{ticket.issueDescription}</p>
          </div>
          <p className="text-[11px]">
            <span className="font-medium">Technician:</span> {ticket.assignedTechnician || 'Not assigned'}
          </p>
        </div>
      </div>

      {/* Payment Information */}
      {ticket.payments && ticket.payments.length > 0 && (
        <div className="mb-4 p-2 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="pb-2 border-b">
            <h3 className="text-[11px] font-semibold">Payment Information</h3>
          </div>
          <div className="p-2 space-y-2">
            {ticket.payments.map((payment, index) => (
              <div key={index} className="flex justify-between items-center p-2 text-[11px] bg-gray-50 rounded border">
                <div>
                  <p className="font-medium">{payment.method}</p>
                  <p className="text-gray-600">{new Date(payment.date).toLocaleDateString("en-GB")}</p>
                </div>
                <p className="font-semibold">£{Number(payment.amount).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span>Total Paid:</span>
                <span className="font-semibold">£{formatted.totalPaid}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span>Balance Due:</span>
                <span className="font-semibold">£{formatted.balanceDue}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="p-2 rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="pb-2 border-b">
          <h3 className="text-[11px] font-semibold">Terms and Conditions</h3>
        </div>
        <div className="p-2">
          <ul className="space-y-1 text-[11px]">
            {termsAndConditions.map((term, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-1">•</span>
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-4 pt-2 border-t text-[11px] text-gray-500">
        <p>Thank you for choosing Chukticketingsystem for your repair needs!</p>
        <p>Contact us: info@Chukticketingsystem.com | +44 123 456 7890</p>
      </div>

      {/* Print Button */}
      <div className="flex justify-center mt-8 print:hidden">
          <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
          >
              Print Ticket
          </button>
      </div>
    </div>
  )
}

export default function App() {
  const [ticketId, setTicketId] = useState("RT-87654321"); // Placeholder ID
  const [ticket, setTicket] = useState<RepairTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use useEffect to simulate a data fetch on component mount
  useEffect(() => {
    setIsLoading(true);
    // Simulating a network request delay
    setTimeout(() => {
      setTicket(MOCK_TICKET);
      setIsLoading(false);
    }, 500);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Loading ticket details...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Error: No ticket data found.</p>
      </div>
    );
  }

  return (
    <TicketPrintView ticket={ticket} />
  );
}
