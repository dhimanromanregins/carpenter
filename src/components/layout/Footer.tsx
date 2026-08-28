import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="relative border-t border-gold/20 bg-ink pt-24">
      <div className="container-luxury">
        <RevealOnScroll>
          <div className="flex flex-col items-start justify-between gap-10 border-b border-gold/10 pb-16 lg:flex-row lg:items-end">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold">
                Let's build something timeless
              </p>
              <h3 className="max-w-xl font-display text-4xl leading-[1.1] text-cream md:text-5xl">
                Ready to craft your{" "}
                <span className="text-gradient-gold">dream interior?</span>
              </h3>
            </div>
            <a
              href="#contact"
              data-cursor="Go"
              className="group flex items-center gap-3 text-lg text-cream"
            >
              <span className="border-b border-gold pb-1 transition-colors group-hover:text-gold">
                Start a Project
              </span>
              <span className="text-gold transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-4">
          <div className="col-span-2">
            <p className="font-display text-xl tracking-[0.15em] text-cream">
              DHIMAN <span className="text-gold">INTERIORS</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-grey">
              Bespoke carpentry and luxury interior craftsmanship for modern
              homes. Every grain, every joint, crafted to perfection.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">
              Studio
            </p>
            <ul className="space-y-2 text-sm text-grey">
              <li>About</li>
              <li>Projects</li>
              <li>Services</li>
              <li>Careers</li>
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">
              Contact
            </p>
            <ul className="space-y-2 break-words text-sm text-grey">
              <li>contact@dhimaninteriors.in</li>
              <li>+91 70185 95304</li>
              <li>Highland Marg, Highway, Patiala, Zirakpur, Punjab 140603</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 border-t border-gold/10 py-8 text-xs text-grey md:flex-row">
          <p>&copy; {YEAR} Dhiman Interiors. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
