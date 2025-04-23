import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-[#1e3a8a] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image src="/images/bugema.png" alt="Bugema University Logo" width={120} height={120} className="rounded-full" />
              <div>
                <h3 className="text-xl font-bold">BUGEMA UNIVERSITY</h3>
                <p className="text-sm">Excellence in Service</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mt-4">
              A Chartered Seventh-Day Adventist Institution of Higher Learning committed to providing quality education
              since 1948.
            </p>
            <div className="flex space-x-4 pt-2">
              <Link href="https://facebook.com" className="hover:text-blue-300 transition-colors">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://twitter.com" className="hover:text-blue-300 transition-colors">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://instagram.com" className="hover:text-blue-300 transition-colors">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://linkedin.com" className="hover:text-blue-300 transition-colors">
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-blue-700 pb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/academics" className="text-gray-300 hover:text-white transition-colors">
                  Academics
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="text-gray-300 hover:text-white transition-colors">
                  Admissions
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-gray-300 hover:text-white transition-colors">
                  Research
                </Link>
              </li>
              <li>
                <Link href="/campus-life" className="text-gray-300 hover:text-white transition-colors">
                  Campus Life
                </Link>
              </li>
              <li>
                <Link href="/sports" className="text-gray-300 hover:text-white transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-blue-700 pb-2">Programs</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/academics/undergraduate" className="text-gray-300 hover:text-white transition-colors">
                  Undergraduate Programs
                </Link>
              </li>
              <li>
                <Link href="/academics/graduate" className="text-gray-300 hover:text-white transition-colors">
                  Graduate Programs
                </Link>
              </li>
              <li>
                <Link href="/academics/diploma" className="text-gray-300 hover:text-white transition-colors">
                  Diploma Programs
                </Link>
              </li>
              <li>
                <Link href="/academics/certificate" className="text-gray-300 hover:text-white transition-colors">
                  Certificate Programs
                </Link>
              </li>
              <li>
                <Link href="/academics/distance" className="text-gray-300 hover:text-white transition-colors">
                  Distance Learning
                </Link>
              </li>
              <li>
                <Link href="/academics/calendar" className="text-gray-300 hover:text-white transition-colors">
                  Academic Calendar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 border-b border-blue-700 pb-2">Contact Information</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="shrink-0 mt-1" />
                <span className="text-gray-300">P.O. Box 6529 Kampala, Uganda</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="shrink-0" />
                <a href="mailto:info@bugemauniv.ac.ug" className="text-gray-300 hover:text-white transition-colors">
                  info@bugemauniv.ac.ug
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="shrink-0" />
                <a href="tel:+256414351400" className="text-gray-300 hover:text-white transition-colors">
                  +256-414-351400
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Working Hours</h4>
              <p className="text-sm text-gray-300">Monday - Thursday: 8:00 AM - 5:00 PM</p>
              <p className="text-sm text-gray-300">Friday: 8:00 AM - 12:00 PM</p>
              <p className="text-sm text-gray-300">Saturday & Sunday: Closed</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-blue-700 text-center">
          <p className="text-sm text-gray-300">© {new Date().getFullYear()} Bugema University. All rights reserved.</p>
          <div className="mt-2 text-xs text-gray-400 flex justify-center space-x-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="hover:text-white transition-colors">
              Sitemap
            </Link>
            <Link href="/auth/register-code" className="hover:text-white transition-colors">
            Register as Registrar
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
