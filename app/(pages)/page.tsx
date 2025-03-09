import Appointment from '@/components/home/Appointment';
import Doctors from '@/components/home/Doctors';
import FAQ from '@/components/home/FAQ';
import Services from '@/components/home/Services';
import Welcome from '@/components/home/Welcome';
import { Newsletter } from '@/components/news-letter/newsletter';
import HeroSlider from '@/components/Slider/Slider';
import React from 'react'

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <Appointment />
      <Welcome />
      <Services />
      <Doctors />
      <Newsletter />
      <FAQ />
    </div>
  );
}
