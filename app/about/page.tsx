import { AboutSection } from "@/components/about/about-section";
import { DoctorsSection } from "@/components/about/doctors-section";
import { GoalsSection } from "@/components/about/goals-section";
import { Slider } from "@/components/about/slider";
import { TestimonialsSection } from "@/components/about/testimonials";


export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Slider />
      <AboutSection />
      <DoctorsSection />
      <TestimonialsSection />
      <GoalsSection />
    </main>
  )
}

