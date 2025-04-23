import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { CampusLifeLayout } from "@/components/site/campus-life-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, Home, Wifi, Coffee, Users, Shield, Utensils } from "lucide-react"

export const metadata: Metadata = {
  title: "Housing & Accommodation | Bugema University",
  description: "Explore on-campus and off-campus housing options for Bugema University students.",
}

export default function HousingPage() {
  return (
    <CampusLifeLayout
      title="Housing & Accommodation"
      description="Comfortable and convenient living options for students on and off campus."
      breadcrumbTitle="Housing & Accommodation"
    >
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Student Housing at Bugema University</h2>
          <p className="text-gray-700 mb-6">
            Bugema University offers a variety of housing options to meet the diverse needs of our student community.
            Whether you prefer on-campus residence halls or off-campus accommodations, we provide safe, comfortable, and
            conducive living environments that support your academic success and personal growth.
          </p>

          <div className="relative h-[300px] rounded-lg overflow-hidden mb-6">
            <Image
              src="/placeholder.svg?height=600&width=1200"
              alt="Student residence halls at Bugema University"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <Tabs defaultValue="oncampus" className="w-full">
          <TabsList className="grid grid-cols-2 h-auto">
            <TabsTrigger value="oncampus" className="py-3">
              On-Campus Housing
            </TabsTrigger>
            <TabsTrigger value="offcampus" className="py-3">
              Off-Campus Housing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="oncampus" className="pt-6">
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-5 rounded-lg flex flex-col items-center text-center">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-4">
                    <Home className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Convenient Location</h3>
                  <p className="text-gray-700">
                    Easy access to classrooms, library, dining halls, and campus facilities.
                  </p>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg flex flex-col items-center text-center">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-4">
                    <Wifi className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Internet Access</h3>
                  <p className="text-gray-700">High-speed Wi-Fi available in all residence halls and common areas.</p>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg flex flex-col items-center text-center">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">24/7 Security</h3>
                  <p className="text-gray-700">
                    Round-the-clock security personnel and controlled access to buildings.
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">Residence Halls</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <ResidenceHallCard
                  name="Freedom Hall"
                  type="Male Residence"
                  capacity="200 students"
                  roomTypes={["Single", "Double"]}
                  amenities={["Wi-Fi", "Study rooms", "Common areas", "Laundry facilities"]}
                  image="/placeholder.svg?height=400&width=600"
                />

                <ResidenceHallCard
                  name="Peace Hall"
                  type="Female Residence"
                  capacity="250 students"
                  roomTypes={["Single", "Double"]}
                  amenities={["Wi-Fi", "Study rooms", "Common areas", "Laundry facilities"]}
                  image="/placeholder.svg?height=400&width=600"
                />

                <ResidenceHallCard
                  name="Unity Hall"
                  type="Male Residence"
                  capacity="180 students"
                  roomTypes={["Single", "Double", "Triple"]}
                  amenities={["Wi-Fi", "Study rooms", "Common areas", "Laundry facilities"]}
                  image="/placeholder.svg?height=400&width=600"
                />

                <ResidenceHallCard
                  name="Harmony Hall"
                  type="Female Residence"
                  capacity="220 students"
                  roomTypes={["Single", "Double", "Triple"]}
                  amenities={["Wi-Fi", "Study rooms", "Common areas", "Laundry facilities"]}
                  image="/placeholder.svg?height=400&width=600"
                />

                <ResidenceHallCard
                  name="Graduate Housing"
                  type="Mixed (Graduate Students)"
                  capacity="100 students"
                  roomTypes={["Single", "Family units"]}
                  amenities={["Wi-Fi", "Kitchen facilities", "Study areas", "Laundry facilities"]}
                  image="/placeholder.svg?height=400&width=600"
                />

                <ResidenceHallCard
                  name="International House"
                  type="Mixed (International Students)"
                  capacity="80 students"
                  roomTypes={["Single", "Double"]}
                  amenities={["Wi-Fi", "Kitchen facilities", "Common areas", "Laundry facilities"]}
                  image="/placeholder.svg?height=400&width=600"
                />
              </div>

              <div className="bg-blue-50 p-6 rounded-lg mt-8">
                <h3 className="text-xl font-bold mb-4">Application Process</h3>
                <ol className="list-decimal pl-6 space-y-2 mb-6">
                  <li>Complete the online housing application form</li>
                  <li>Pay the housing application fee</li>
                  <li>Receive housing assignment notification</li>
                  <li>Pay the housing deposit to secure your space</li>
                  <li>Complete the room check-in process on arrival</li>
                </ol>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild>
                    <Link href="/campus-life/housing/apply">Apply for Housing</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/campus-life/housing/rates">View Housing Rates</Link>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="offcampus" className="pt-6">
            <div className="space-y-6">
              <p className="text-gray-700 mb-6">
                For students who prefer to live off-campus, there are several housing options available in the
                surrounding communities. The university's Off-Campus Housing Office provides resources and support to
                help students find suitable accommodations.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-5 rounded-lg flex flex-col items-center text-center">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Housing Database</h3>
                  <p className="text-gray-700">Access our database of verified off-campus housing options.</p>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg flex flex-col items-center text-center">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-4">
                    <Coffee className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Advisory Services</h3>
                  <p className="text-gray-700">Get guidance on leases, tenant rights, and housing selection.</p>
                </div>

                <div className="bg-blue-50 p-5 rounded-lg flex flex-col items-center text-center">
                  <div className="bg-blue-100 text-blue-700 p-3 rounded-full mb-4">
                    <Utensils className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Roommate Matching</h3>
                  <p className="text-gray-700">Find compatible roommates through our matching service.</p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">Nearby Housing Areas</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <OffCampusAreaCard
                  name="Bugema Town"
                  distance="0.5-1 km from campus"
                  housingTypes={["Apartments", "Shared houses", "Studio units"]}
                  priceRange="UGX 300,000 - 600,000 per month"
                  transportation="Walking distance, boda boda services"
                  image="/placeholder.svg?height=400&width=600"
                />

                <OffCampusAreaCard
                  name="Namulonge Area"
                  distance="2-4 km from campus"
                  housingTypes={["Apartments", "Houses", "Single rooms"]}
                  priceRange="UGX 250,000 - 500,000 per month"
                  transportation="Boda boda, taxi services"
                  image="/placeholder.svg?height=400&width=600"
                />

                <OffCampusAreaCard
                  name="Kawempe Area"
                  distance="8-10 km from campus"
                  housingTypes={["Apartments", "Shared houses", "Single rooms"]}
                  priceRange="UGX 200,000 - 450,000 per month"
                  transportation="Taxis, boda boda, university shuttle"
                  image="/placeholder.svg?height=400&width=600"
                />

                <OffCampusAreaCard
                  name="Bwaise Area"
                  distance="12-15 km from campus"
                  housingTypes={["Apartments", "Shared houses", "Single rooms"]}
                  priceRange="UGX 180,000 - 400,000 per month"
                  transportation="Taxis, boda boda, university shuttle"
                  image="/placeholder.svg?height=400&width=600"
                />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <h3 className="text-xl font-bold mb-4">Off-Campus Housing Resources</h3>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Finding Suitable Accommodation</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Visit the Off-Campus Housing Office located in the Student Center</li>
                        <li>Browse the online housing database on the university portal</li>
                        <li>Attend housing fairs organized at the beginning of each semester</li>
                        <li>Join the "Bugema Housing" Facebook group for listings and roommate searches</li>
                        <li>Check notice boards around campus for housing advertisements</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>Lease Agreements and Tenant Rights</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">Before signing a lease agreement, make sure to:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Read the entire lease agreement carefully</li>
                        <li>Understand the terms of payment, duration, and security deposit</li>
                        <li>Document the condition of the property before moving in</li>
                        <li>Clarify responsibilities for utilities and maintenance</li>
                        <li>Have the Off-Campus Housing Office review your lease if you're unsure</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>Transportation Options</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>
                          <strong>University Shuttle:</strong> Free service for students living in designated areas
                        </li>
                        <li>
                          <strong>Public Taxis:</strong> Regular routes connecting major residential areas to campus
                        </li>
                        <li>
                          <strong>Boda Boda:</strong> Motorcycle taxis available for direct transportation
                        </li>
                        <li>
                          <strong>Carpooling:</strong> Connect with fellow students through the university's carpooling
                          program
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>Safety Considerations</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Choose accommodations in well-lit areas with security features</li>
                        <li>Verify that doors and windows have proper locks</li>
                        <li>Consider properties with security personnel or gated communities</li>
                        <li>Register your off-campus address with the university security office</li>
                        <li>Save emergency contacts, including campus security: +256-414-351499</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-6">
                  <Button asChild>
                    <Link href="/campus-life/housing/off-campus-database">
                      Access Housing Database <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Housing Support Services</h2>
          <p className="text-gray-700 mb-6">
            Our Housing Office provides comprehensive support services to ensure a positive living experience for all
            students:
          </p>

          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>
              <strong>Resident Assistants:</strong> Trained student leaders who provide support and organize community
              activities
            </li>
            <li>
              <strong>Maintenance Services:</strong> Prompt response to maintenance requests in university housing
            </li>
            <li>
              <strong>Housing Counselors:</strong> Professional staff available to assist with housing-related concerns
            </li>
            <li>
              <strong>Security Services:</strong> 24/7 security personnel and emergency response
            </li>
            <li>
              <strong>Community Programs:</strong> Educational and social activities to enhance the residential
              experience
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/campus-life/housing/contact">Contact Housing Office</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/campus-life/housing/faq">Housing FAQ</Link>
            </Button>
          </div>
        </div>
      </div>
    </CampusLifeLayout>
  )
}

function ResidenceHallCard({
  name,
  type,
  capacity,
  roomTypes,
  amenities,
  image,
}: {
  name: string
  type: string
  capacity: string
  roomTypes: string[]
  amenities: string[]
  image: string
}) {
  return (
    <Card>
      <div className="relative h-[200px] w-full">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover rounded-t-lg" />
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription>{type}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Capacity:</span>
            <span>{capacity}</span>
          </div>
          <div>
            <span className="font-medium">Room Types:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {roomTypes.map((type, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                  {type}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="font-medium">Amenities:</span>
            <ul className="list-disc pl-5 mt-1">
              {amenities.map((amenity, index) => (
                <li key={index}>{amenity}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/campus-life/housing/${name.toLowerCase().replace(/\s+/g, "-")}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function OffCampusAreaCard({
  name,
  distance,
  housingTypes,
  priceRange,
  transportation,
  image,
}: {
  name: string
  distance: string
  housingTypes: string[]
  priceRange: string
  transportation: string
  image: string
}) {
  return (
    <Card>
      <div className="relative h-[200px] w-full">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover rounded-t-lg" />
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription>{distance}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Housing Types:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {housingTypes.map((type, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                  {type}
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Price Range:</span>
            <span>{priceRange}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Transportation:</span>
            <span>{transportation}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/campus-life/housing/areas/${name.toLowerCase().replace(/\s+/g, "-")}`}>
            View Listings <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
