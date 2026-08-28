import { useEffect } from "react";
import { Footer } from "@/components/layout/Footer";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { Hero } from "@/components/sections/Hero";
import { CinematicScroll } from "@/components/sections/CinematicScroll";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Materials } from "@/components/sections/Materials";
import { Projects } from "@/components/sections/Projects";
import { DesignInspiration } from "@/components/sections/DesignInspiration";
import { RoomShowcase } from "@/components/sections/RoomShowcase";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { useLenis, getLenis } from "@/hooks/useLenis";

export function HomePage() {
  useLenis();

  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash;
    const timer = setTimeout(() => {
      const lenis = getLenis();
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      if (lenis) lenis.scrollTo(target, { immediate: false });
      else target.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <main className="relative">
        <Hero />
        <CinematicScroll />
        <About />
        <Services />
        <Materials />
        <Projects />
        <DesignInspiration />
        <RoomShowcase />
        <WhyChooseUs />
        <Testimonials />
        <Contact />
      </main>

      <Footer />
      <FloatingContact />
    </>
  );
}
