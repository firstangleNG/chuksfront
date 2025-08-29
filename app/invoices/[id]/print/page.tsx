"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Head from "next/head"
import { InvoiceService, type Invoice } from "@/lib/invoice-service"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft } from "lucide-react"
import "./print.css"

export default function InvoicePrintPage() {
  const { id } = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const data = await InvoiceService.getInvoiceById(id as string)
        if (data) {
          setInvoice(data)
        } else {
          setInvoice(null)
        }
      } catch (error) {
        console.error("Error loading invoice:", error)
        setInvoice(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      loadInvoice()
    } else {
      setInvoice(null)
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!isLoading && invoice) {
      // Auto-print when the component mounts
      window.print()
    }
  }, [isLoading, invoice])

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '£0.00'
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GBP",
    }).format(amount)
  }

  if (isLoading) {
    return <div className="p-8">Loading invoice...</div>
  }

  if (!invoice) {
    return (
      <div className="p-8">
        <div className="no-print fixed top-4 left-4 z-50">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
        <div className="pt-16 text-center">Invoice not found</div>
      </div>
    )
  }

  return (
    <div>
      <Head>
        <title>Invoice #{invoice?.invoiceNumber || 'Loading...'} - ComputerHub</title>
        <meta name="description" content={`Invoice #${invoice?.invoiceNumber || ''} for ${invoice?.customerName || 'customer'}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="no-print fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
      </div>

      <div className="p-8 max-w-4xl mx-auto print-container">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">INVOICE</h1>
          <p className="text-muted-foreground">#{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">ComputerHub</div>
          <div className="text-sm text-muted-foreground">
            123 Tech Street<br />
            London, UK<br />
            VAT: GB123456789
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">BILL TO</h2>
          <div className="space-y-1">
            <p className="font-medium">{invoice.customerName}</p>
            {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
            {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
          </div>
        </div>
        <div className="md:text-right">
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Invoice Date: </span>
              <span>{format(new Date(invoice.invoiceDate), "dd/MM/yyyy")}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Due Date: </span>
              <span>{format(new Date(invoice.dueDate), "dd/MM/yyyy")}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Status: </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                invoice.paymentStatus === "paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {invoice.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden mb-8 print-break-inside-avoid">
        <table className="min-w-full divide-y">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Qty
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Unit Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {item.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto max-w-xs">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.tax > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Tax ({invoice.taxRate !== undefined ? invoice.taxRate : 20}%):
              </span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Discount:</span>
              <span>-{formatCurrency(invoice.discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-muted">
            <span className="font-medium">Total:</span>
            <span className="font-bold">{formatCurrency(invoice.total)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-8 pt-4 border-t border-muted">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">NOTES</h3>
          <p className="text-sm">{invoice.notes}</p>
        </div>
      )}

      <div className="mt-12 pt-4 border-t border-muted text-center text-sm text-muted-foreground">
        <p>Thank you for your business!</p>
        <p className="mt-1">ComputerHub | 123 Tech Street, London, UK | info@computerhub.com</p>
      </div>

      <div className="mt-8 flex justify-center no-print">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </div>
    </div>
  )
}
