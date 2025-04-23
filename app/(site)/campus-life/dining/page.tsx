import type React from "react"
import type { Metadata } from "next"
import Image from "next/image"
import { Clock, MapPin, Utensils, Coffee, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Campus Dining | Bugema University",
  description: "Explore dining options, meal plans, and food services at Bugema University",
}

export default function DiningPage() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Campus Dining</h1>
          <p className="text-muted-foreground">
            Explore dining options, meal plans, and food services at Bugema University
          </p>
        </div>

        <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg">
          <Image
            src="/placeholder.svg?height=400&width=1200"
            alt="Bugema University dining hall"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white p-6 max-w-2xl">
              <h2 className="text-2xl font-bold mb-2">Nourishing Body and Mind</h2>
              <p className="mb-4">
                Bugema University offers a variety of dining options to meet the diverse needs and preferences of our
                campus community.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="bg-white/10 text-white">
                  Vegetarian
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white">
                  Vegan
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white">
                  Halal
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white">
                  Gluten-Free
                </Badge>
                <Badge variant="outline" className="bg-white/10 text-white">
                  Local Cuisine
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="locations" className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="locations">Dining Locations</TabsTrigger>
            <TabsTrigger value="mealplans">Meal Plans</TabsTrigger>
            <TabsTrigger value="menus">Weekly Menus</TabsTrigger>
          </TabsList>

          <TabsContent value="locations" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {diningLocations.map((location, index) => (
                <LocationCard key={index} location={location} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mealplans" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mealPlans.map((plan, index) => (
                <MealPlanCard key={index} plan={plan} />
              ))}
            </div>
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Meal Plan FAQs</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">How do I sign up for a meal plan?</h4>
                  <p className="text-sm text-muted-foreground">
                    Meal plans can be selected during housing registration or at the Dining Services office.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Can I change my meal plan?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, meal plans can be changed within the first two weeks of each semester.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Do unused meals roll over?</h4>
                  <p className="text-sm text-muted-foreground">
                    Weekly meal plans reset every Sunday. Semester flex points roll over within the semester but expire
                    at the end of each semester.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline">View Complete FAQ</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="menus" className="space-y-6 mt-6">
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-medium">This Week's Menu Highlights</h3>
                <p className="text-sm text-muted-foreground">April 22 - April 28, 2024</p>
              </div>
              <div className="divide-y">
                {weeklyMenuItems.map((day, index) => (
                  <div key={index} className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{day.day}</h4>
                      <Badge variant="outline">{day.date}</Badge>
                    </div>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div>
                        <h5 className="text-sm font-medium">Breakfast</h5>
                        <ul className="text-sm list-disc pl-5">
                          {day.breakfast.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium">Lunch</h5>
                        <ul className="text-sm list-disc pl-5">
                          {day.lunch.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium">Dinner</h5>
                        <ul className="text-sm list-disc pl-5">
                          {day.dinner.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Menu items subject to change based on availability</p>
                  <Button size="sm" variant="outline">
                    Download Full Menu
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-slate-50 p-6 rounded-lg mt-10">
          <div className="md:flex items-start gap-6">
            <div className="md:w-2/3 space-y-4">
              <h2 className="text-2xl font-bold">Dietary Accommodations</h2>
              <p>
                Bugema University Dining Services is committed to accommodating students with special dietary needs,
                including allergies, religious restrictions, and lifestyle choices.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="font-medium mb-2">Food Allergies</h3>
                  <p className="text-sm text-muted-foreground">
                    Our dining halls provide allergen information for all menu items.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="font-medium mb-2">Religious Dietary Needs</h3>
                  <p className="text-sm text-muted-foreground">
                    We offer halal, kosher, and other religiously-compliant options.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="font-medium mb-2">Vegetarian & Vegan</h3>
                  <p className="text-sm text-muted-foreground">
                    Plant-based options are available at all dining locations.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-md shadow-sm">
                  <h3 className="font-medium mb-2">Gluten-Free</h3>
                  <p className="text-sm text-muted-foreground">
                    Dedicated gluten-free stations and options are available.
                  </p>
                </div>
              </div>
            </div>
            <div className="md:w-1/3 mt-6 md:mt-0">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-medium mb-2">Nutrition Counseling</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our campus nutritionist is available to help students with special dietary needs or those seeking
                  guidance on healthy eating.
                </p>
                <Button variant="outline" className="w-full">
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DiningLocation {
  name: string
  description: string
  hours: string
  location: string
  features: string[]
  icon: React.ReactNode
}

function LocationCard({ location }: { location: DiningLocation }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10 text-primary">{location.icon}</div>
          <CardTitle>{location.name}</CardTitle>
        </div>
        <CardDescription>{location.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>{location.hours}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          <span>{location.location}</span>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Features:</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {location.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Menu
        </Button>
      </CardFooter>
    </Card>
  )
}

interface MealPlan {
  name: string
  price: string
  description: string
  features: string[]
  bestFor: string
}

function MealPlanCard({ plan }: { plan: MealPlan }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold text-center py-2">
          {plan.price}
          <span className="text-sm font-normal text-muted-foreground">/semester</span>
        </div>
        <div>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="rounded-full bg-green-100 p-1 mt-0.5">
                  <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-2 text-sm">
          <span className="font-medium">Best for:</span> {plan.bestFor}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Select Plan</Button>
      </CardFooter>
    </Card>
  )
}

const diningLocations: DiningLocation[] = [
  {
    name: "Main Dining Hall",
    description: "Our largest dining facility offering a wide variety of meal options",
    hours: "Mon-Fri: 7:00 AM - 8:00 PM, Sat-Sun: 8:00 AM - 7:00 PM",
    location: "Central Campus, near Administration Building",
    features: [
      "All-you-can-eat buffet style",
      "International cuisine station",
      "Vegetarian and vegan options",
      "Allergen-free zone",
      "Fresh salad bar",
    ],
    icon: <Utensils className="h-5 w-5" />,
  },
  {
    name: "The Café",
    description: "Casual café offering coffee, pastries, and light meals",
    hours: "Mon-Fri: 6:30 AM - 9:00 PM, Sat: 8:00 AM - 6:00 PM, Sun: Closed",
    location: "Library Building, Ground Floor",
    features: [
      "Specialty coffees and teas",
      "Fresh baked goods",
      "Sandwiches and wraps",
      "Study-friendly environment",
      "Free Wi-Fi",
    ],
    icon: <Coffee className="h-5 w-5" />,
  },
  {
    name: "Student Center Food Court",
    description: "Multiple food vendors offering diverse dining options",
    hours: "Mon-Fri: 10:00 AM - 10:00 PM, Sat-Sun: 11:00 AM - 8:00 PM",
    location: "Student Center, First Floor",
    features: [
      "Local and international cuisines",
      "Fast food options",
      "Grab-and-go meals",
      "Extended evening hours",
      "Mobile ordering available",
    ],
    icon: <Utensils className="h-5 w-5" />,
  },
  {
    name: "Health Sciences Café",
    description: "Quick service café with healthy food options",
    hours: "Mon-Fri: 7:30 AM - 5:00 PM, Sat-Sun: Closed",
    location: "Health Sciences Building",
    features: [
      "Nutritious meal options",
      "Smoothies and fresh juices",
      "Protein-rich snacks",
      "Gluten-free options",
      "Quick service for busy schedules",
    ],
    icon: <Coffee className="h-5 w-5" />,
  },
  {
    name: "Residence Hall Mini-Mart",
    description: "Convenience store with essential groceries and ready-to-eat meals",
    hours: "Daily: 7:00 AM - 12:00 AM",
    location: "Main Residence Hall Complex",
    features: [
      "Groceries and snacks",
      "Microwaveable meals",
      "Personal care items",
      "Late night hours",
      "Accepts meal plan flex points",
    ],
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    name: "Faculty Dining Room",
    description: "Upscale dining experience for faculty, staff, and guests",
    hours: "Mon-Fri: 11:00 AM - 2:00 PM, Evenings and weekends for special events",
    location: "Administration Building, Second Floor",
    features: [
      "Table service",
      "Rotating menu of chef specialties",
      "Quiet atmosphere",
      "Reservation option for large groups",
      "Special event catering",
    ],
    icon: <Utensils className="h-5 w-5" />,
  },
]

const mealPlans: MealPlan[] = [
  {
    name: "Unlimited Plan",
    price: "UGX 2,500,000",
    description: "Unlimited access to dining halls plus flex points",
    features: [
      "Unlimited meals at any dining hall",
      "UGX 100,000 flex points per semester",
      "Guest passes (5 per semester)",
      "Access to special dining events",
      "Nutritional counseling included",
    ],
    bestFor: "On-campus residents who eat most meals on campus",
  },
  {
    name: "14-Meal Plan",
    price: "UGX 1,800,000",
    description: "14 meals per week plus flex points",
    features: [
      "14 meals per week at any dining hall",
      "UGX 150,000 flex points per semester",
      "Guest passes (3 per semester)",
      "Unused meals reset weekly",
      "Access to special dining events",
    ],
    bestFor: "Students who eat 2 meals per day on campus",
  },
  {
    name: "10-Meal Plan",
    price: "UGX 1,400,000",
    description: "10 meals per week plus flex points",
    features: [
      "10 meals per week at any dining hall",
      "UGX 200,000 flex points per semester",
      "Guest passes (2 per semester)",
      "Unused meals reset weekly",
      "Access to special dining events",
    ],
    bestFor: "Students who eat some meals off campus",
  },
  {
    name: "5-Meal Plan",
    price: "UGX 800,000",
    description: "5 meals per week plus flex points",
    features: [
      "5 meals per week at any dining hall",
      "UGX 250,000 flex points per semester",
      "Guest passes (1 per semester)",
      "Unused meals reset weekly",
      "Good for occasional campus dining",
    ],
    bestFor: "Commuter students or those who cook most meals",
  },
  {
    name: "Flex Only Plan",
    price: "UGX 600,000",
    description: "Flex points only for maximum flexibility",
    features: [
      "UGX 650,000 flex points per semester",
      "Use at any campus dining location",
      "No meal swipes included",
      "10% discount at retail dining locations",
      "Points roll over within the semester",
    ],
    bestFor: "Students who prefer à la carte dining options",
  },
]

const weeklyMenuItems = [
  {
    day: "Monday",
    date: "April 22",
    breakfast: ["Pancakes with Maple Syrup", "Scrambled Eggs", "Fresh Fruit"],
    lunch: ["Grilled Chicken Sandwich", "Sweet Potato Fries", "Garden Salad"],
    dinner: ["Beef Stew", "Rice Pilaf", "Steamed Vegetables", "Fruit Cobbler"],
  },
  {
    day: "Tuesday",
    date: "April 23",
    breakfast: ["Breakfast Burritos", "Hash Browns", "Yogurt Parfait"],
    lunch: ["Vegetable Curry", "Naan Bread", "Cucumber Salad"],
    dinner: ["Roast Chicken", "Mashed Potatoes", "Green Beans", "Chocolate Cake"],
  },
  {
    day: "Wednesday",
    date: "April 24",
    breakfast: ["Oatmeal Bar", "Boiled Eggs", "Banana Bread"],
    lunch: ["Pasta Bar with Various Sauces", "Garlic Bread", "Caesar Salad"],
    dinner: ["Fish Fillet", "Rice", "Ratatouille", "Fruit Salad"],
  },
]
