import { useState } from "react";
import { Loader } from "@/components/layout/Loader";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Materials } from "@/components/sections/Materials";
import { Projects } from "@/components/sections/Projects";
import { DesignInspiration } from "@/components/sections/DesignInspiration";
import { RoomShowcase } from "@/components/sections/RoomShowcase";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { useLenis } from "@/hooks/useLenis";

function App() {
  const [loaded, setLoaded] = useState(false);

  useLenis();

  return (
    <>
      <Loader onComplete={() => setLoaded(true)} />

      {loaded && (
        <>
          <CustomCursor />
          <ScrollProgress />
          <Navbar />

          <main className="relative">
            <Hero />
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
      )}
    </>
  );
}

export default App;
