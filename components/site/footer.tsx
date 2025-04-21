import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Bugema University</h3>
            <p className="mb-4 text-sm">
              A Seventh-day Adventist institution of higher learning that offers a holistic education to prepare
              students for service to humanity.
            </p>
            <div className="flex space-x-4">
              <Link href="https://facebook.com" className="hover:text-white/80">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://twitter.com" className="hover:text-white/80">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="https://instagram.com" className="hover:text-white/80">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://youtube.com" className="hover:text-white/80">
                <Youtube size={20} />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/academics" className="hover:underline">
                  Academics
                </Link>
              </li>
              <li>
                <Link href="/admissions" className="hover:underline">
                  Admissions
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:underline">
                  Research
                </Link>
              </li>
              <li>
                <Link href="/campus-life" className="hover:underline">
                  Campus Life
                </Link>
              </li>
              <li>
                <Link href="/sports" className="hover:underline">
                  Sports
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-0.5 shrink-0" />
                <span>Bugema University, Kampala-Gayaza Road, P.O. Box 6529, Kampala, Uganda</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 shrink-0" />
                <span>+256 312 351400</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 shrink-0" />
                <span>info@bugemauniv.ac.ug</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Newsletter</h3>
            <p className="mb-4 text-sm">Subscribe to our newsletter to receive updates and news.</p>
            <form className="space-y-2">
              <Input type="email" placeholder="Your email address" className="bg-primary-foreground text-primary" />
              <Button variant="secondary" className="w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/20" />

        <div className="flex flex-col items-center justify-between space-y-4 text-sm md:flex-row md:space-y-0">
          <p>&copy; {new Date().getFullYear()} Bugema University. All rights reserved.</p>
          <div className="flex space-x-4">
            <Link href="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="hover:underline">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
