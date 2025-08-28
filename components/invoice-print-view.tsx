"use client"

import { Button } from "@/components/ui/button"
import { Download, Printer, CheckCircle, Clock, AlertCircle } from "lucide-react"
import type { Invoice, Payment } from "@/types"
import { format } from "date-fns"
import Image from "next/image"

interface InvoicePrintViewProps {
  invoice: Invoice
  onClose: () => void
}

export function InvoicePrintView({ invoice, onClose }: InvoicePrintViewProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // TODO: Implement PDF download functionality
    alert("PDF download will be implemented here")
  }

  // Calculate balance due
  const balanceDue = (invoice.totalAmount || 0) - (invoice.totalPaid || 0)
  const isPaid = invoice.paymentStatus === 'paid'
  const isOverdue = invoice.paymentStatus === 'overdue' || 
                  (invoice.paymentStatus === 'pending' && new Date(invoice.dueDate) < new Date())

  return (
    <div className="bg-white p-6 max-w-4xl mx-auto">
      {/* Letterhead */}
      <div className="flex justify-between items-start mb-8 border-b pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Image 
              src="/computerhub.png" 
              alt="ComputerHubUK Logo" 
              width={40} 
              height={40} 
              className="rounded"
            />
            <h1 className="text-2xl font-bold">ComputerHubUK</h1>
          </div>
          <p className="text-sm text-gray-600">Professional Computer Repairs & IT Services</p>
          <p className="text-sm text-gray-600">123 Tech Street, London, UK</p>
          <p className="text-sm text-gray-600">Phone: 020 1234 5678 | Email: info@computerhubuk.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">INVOICE</h2>
          <p className="text-sm">#{invoice.trackingId}</p>
          <p className="text-sm">Date: {format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</p>
          <p className="text-sm">Due: {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Bill To:</h3>
          <p className="font-medium">{invoice.customerName}</p>
          {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
          {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Device Information:</h3>
          <p>{invoice.deviceInfo}</p>
          <p className="text-sm text-gray-600 mt-1">{invoice.issueDescription}</p>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3 border">Description</th>
              <th className="text-right p-3 border">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border">Labor Charges</td>
              <td className="p-3 border text-right">£{invoice.laborCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="p-3 border">Parts & Materials</td>
              <td className="p-3 border text-right">£{invoice.partsCost.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="p-3 border">Tax (8%)</td>
              <td className="p-3 border text-right">£{invoice.taxAmount.toFixed(2)}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-3 border font-semibold">Total</td>
              <td className="p-3 border text-right font-semibold">£{invoice.totalAmount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Status */}
      <div className="mb-8 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-3">Payment Information</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded border">
            <p className="text-sm text-gray-500">Invoice Total</p>
            <p className="text-lg font-semibold">£{invoice.totalAmount.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-white rounded border">
            <p className="text-sm text-gray-500">Amount Paid</p>
            <p className="text-lg font-semibold text-green-600">£{(invoice.totalPaid || 0).toFixed(2)}</p>
          </div>
          <div className="p-3 bg-white rounded border">
            <p className="text-sm text-gray-500">Balance Due</p>
            <p className={`text-lg font-semibold ${balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
              £{Math.max(0, balanceDue).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          {isPaid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : isOverdue ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <Clock className="h-5 w-5 text-yellow-500" />
          )}
          <span className={`font-medium ${
            isPaid ? 'text-green-700' : isOverdue ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {isPaid 
              ? 'Payment Completed' 
              : isOverdue 
                ? `Overdue - Was due on ${format(new Date(invoice.dueDate), 'dd/MM/yyyy')}`
                : `Due on ${format(new Date(invoice.dueDate), 'dd/MM/yyyy')}`}
          </span>
        </div>
      </div>
      
      {/* Payment History */}
      {invoice.payments && invoice.payments.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3">Payment History</h3>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left p-3 text-sm font-medium text-gray-500">Method</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="text-right p-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.payments.map((payment: Payment) => (
                  <tr key={payment.id}>
                    <td className="p-3 text-sm">
                      {format(new Date(payment.processedAt || payment.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-3 text-sm capitalize">
                      {payment.method.replace('_', ' ')}
                    </td>
                    <td className="p-3 text-sm text-right">
                      £{payment.amount.toFixed(2)}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : payment.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Terms & Notes */}
      <div className="text-sm text-gray-600 border-t pt-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold mb-2">Terms & Conditions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Payment is due within 7 days of invoice date</li>
              <li>Please include the invoice number with your payment</li>
              <li>Late payments may be subject to a late fee of 5% per month</li>
              <li>For any questions, please contact our support team</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Bank Details:</p>
            <div className="space-y-1">
              <p className="flex justify-between">
                <span className="text-gray-500">Account Name:</span>
                <span>ComputerHubUK Ltd</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Sort Code:</span>
                <span>12-34-56</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Account Number:</span>
                <span>12345678</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-500">Reference:</span>
                <span className="font-mono">{invoice.trackingId}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t text-center text-xs text-gray-500">
          <p>Thank you for choosing ComputerHubUK for your repair needs.</p>
          <p>This is a computer-generated invoice. No signature is required.</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 mt-8 print:hidden">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
