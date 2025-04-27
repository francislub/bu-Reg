"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { requestPasswordReset } from "@/lib/actions/auth-actions"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true)
    try {
      const response = await requestPasswordReset(data.email)

      if (response.success) {
        setIsSubmitted(true)
      } else {
        toast({
          title: "Error",
          description: response.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex bg-[#1e3a8a] items-center justify-center p-8">
        <div className="max-w-md">
          <Image
            src="/images/bugema.png"
            alt="Bugema University Logo"
            width={300}
            height={300}
            className="mx-auto mb-8"
          />
          <h1 className="text-3xl font-bold text-white text-center mb-4">BUGEMA UNIVERSITY</h1>
          <p className="text-white/80 text-center mb-2">Excellence in Service</p>
          <p className="text-white/80 text-center">A Chartered Seventh-Day Adventist Institution of Higher Learning</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="md:hidden flex justify-center mb-6">
              <Image src="/logo.png" alt="Bugema University Logo" width={100} height={100} />
            </div>
            <h2 className="text-2xl font-bold">Forgot Password</h2>
            <p className="text-gray-600 mt-2">
              {isSubmitted
                ? "Check your email for password reset instructions"
                : "Enter your email to receive a password reset link"}
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Reset Link Sent</h3>
              <p className="text-gray-600 mb-4">
                If an account exists with this email, we've sent instructions to reset your password.
              </p>
              <div className="space-y-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/login">Return to Login</Link>
                </Button>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your registered email" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <Button type="submit" className="w-full bg-[#1e3a8a] hover:bg-blue-800" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>

                  <div className="flex justify-center">
                    <Link href="/auth/login" className="flex items-center text-sm text-blue-600 hover:underline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  )
}
