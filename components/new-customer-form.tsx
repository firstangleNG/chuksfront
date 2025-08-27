"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import type { User } from "@/types"

interface NewCustomerFormProps {
  onCustomerCreated: (customer: User) => void
  onBack: () => void
}

export function NewCustomerForm({ onCustomerCreated, onBack }: NewCustomerFormProps) {
  const [formData, setFormData] = useState({
    firstname: "",
    surname: "",
    email: "",
    phone: "",
    address: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstname.trim()) newErrors.firstname = "FirstName is required"
    if (!formData.surname.trim()) newErrors.surname = "Surname is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Check if customer already exists
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const existingCustomer = users.find((user: User) => user.email === formData.email)

      if (existingCustomer) {
        setErrors({ email: "Customer with this email already exists" })
        setIsSubmitting(false)
        return
      }

      // Create new customer
      const newCustomer: User = {
        id: Date.now().toString(),
        firstname: formData.firstname,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
        role: "customer",
        createdAt: new Date().toISOString(),
      }

      users.push(newCustomer)
      localStorage.setItem("users", JSON.stringify(users))

      onCustomerCreated(newCustomer)
    } catch (error) {
      console.error("Error creating customer:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle>Create New Customer</CardTitle>
            <CardDescription>Enter customer details to create a new account</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstname">First Name *</Label>
            <Input
              id="firstname"
              value={formData.firstname}
              onChange={(e) => handleInputChange("firstname", e.target.value)}
              placeholder="Enter customer's first name"
            />
            {errors.firstname && (
              <Alert variant="destructive">
                <AlertDescription>{errors.firstname}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="surname">Surname *</Label>
            <Input
              id="surname"
              value={formData.surname}
              onChange={(e) => handleInputChange("surname", e.target.value)}
              placeholder="Enter customer's surname"
            />
            {errors.surname && (
              <Alert variant="destructive">
                <AlertDescription>{errors.surname}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
            />
            {errors.email && (
              <Alert variant="destructive">
                <AlertDescription>{errors.email}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <Alert variant="destructive">
                <AlertDescription>{errors.phone}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Enter customer address (optional)"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating Customer..." : "Create Customer"}
            </Button>
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
