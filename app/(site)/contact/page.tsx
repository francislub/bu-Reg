import Link from "next/link"
import type { Metadata } from "next"
import { ChevronRight, Mail, Phone, MapPin, Clock } from "lucide-react"
import { SiteLayout } from "@/components/site/site-layout"
import { ContactForm } from "@/components/site/contact-form"

export const metadata: Metadata = {
  title: "Contact Us | Bugema University",
  description: "Get in touch with Bugema University. We're here to help with any questions or inquiries.",
}

export default function ContactPage() {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl mb-6">We're here to help. Reach out to us with any questions or inquiries.</p>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-blue-700 hover:underline">
              Home
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span>Contact</span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              <p className="text-gray-700 mb-8">
                We value your feedback and inquiries. Please feel free to contact us using any of the methods below or
                fill out the contact form, and we'll get back to you as soon as possible.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full flex-shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Address</h3>
                    <p className="text-gray-600">Bugema University</p>
                    <p className="text-gray-600">P.O. Box 6529</p>
                    <p className="text-gray-600">Kampala, Uganda</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full flex-shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Phone</h3>
                    <p className="text-gray-600">Main: +256-414-351400</p>
                    <p className="text-gray-600">Admissions: +256-414-351401</p>
                    <p className="text-gray-600">Student Affairs: +256-414-351402</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full flex-shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Email</h3>
                    <p className="text-gray-600">General Inquiries: info@bugemauniv.ac.ug</p>
                    <p className="text-gray-600">Admissions: admissions@bugemauniv.ac.ug</p>
                    <p className="text-gray-600">Student Support: support@bugemauniv.ac.ug</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full flex-shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Office Hours</h3>
                    <p className="text-gray-600">Monday - Thursday: 8:00 AM - 5:00 PM</p>
                    <p className="text-gray-600">Friday: 8:00 AM - 12:00 PM</p>
                    <p className="text-gray-600">Saturday & Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Find Us</h2>
          <div className="rounded-lg overflow-hidden shadow-lg h-[400px] w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7575146277384!2d32.5661!3d0.3548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMCLCsDIxJzE3LjMiTiAzMsKwMzMnNTcuOSJF!5e0!3m2!1sen!2sus!4v1650000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bugema University Map"
            ></iframe>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}
