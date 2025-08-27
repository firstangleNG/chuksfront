"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, UserIcon, Phone, Mail } from "lucide-react"
import type { Customer } from "@/types"

interface CustomerSearchProps {
  onCustomerSelected: (customer: Customer) => void
  onNewCustomer: () => void
}

export function CustomerSearch({ onCustomerSelected, onNewCustomer }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])

  useEffect(() => {
    // Load customers from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const customerUsers = users.filter((user: Customer) => user.role === "customer")
    setCustomers(customerUsers)
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers([])
      return
    }

    const filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm),
    )
    setFilteredCustomers(filtered)
  }, [searchTerm, customers])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Find Customer
        </CardTitle>
        <CardDescription>Search for existing customer or create a new one</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search by name, email, or phone</Label>
          <Input
            id="search"
            placeholder="Enter customer name, email, or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {searchTerm.trim() && (
          <div className="space-y-3">
            {filteredCustomers.length > 0 ? (
              <>
                <h4 className="font-medium text-sm text-muted-foreground">
                  Found {filteredCustomers.length} customer(s)
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => onCustomerSelected(customer)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <UserIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">Select</Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">No customers found matching "{searchTerm}"</p>
                <Button onClick={onNewCustomer} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Customer
                </Button>
              </div>
            )}
          </div>
        )}

        {!searchTerm.trim() && (
          <div className="text-center py-6">
            <Button onClick={onNewCustomer} variant="outline" className="w-full bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Create New Customer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
