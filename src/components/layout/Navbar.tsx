import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Home", href: "#hero", isExternal: false, isRoute: false },
  { label: "Projects", href: "#projects", isExternal: false, isRoute: false },
  { label: "Services", href: "#services", isExternal: false, isRoute: false },
  { label: "About", href: "#about", isExternal: false, isRoute: false },
  {
    label: "Design Studio",
    href: "/design-studio",
    isExternal: true,
    isRoute: false,
    hideOnMobile: true,
  },
  {
    label: "Inspiration",
    href: "/inspiration",
    isExternal: false,
    isRoute: true,
    hideOnMobile: true,
  },
  { label: "Contact", href: "#contact", isExternal: false, isRoute: false },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 40);
  });

  const handleNav = (href: string) => {
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/" + href);
      return;
    }
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background,border-color] duration-500",
          scrolled ? "glass" : "border-b border-transparent bg-transparent"
        )}
      >
        <nav className="container-luxury flex h-20 items-center justify-end gap-10">
          <ul className="hidden items-center gap-10 lg:flex">
            {LINKS.map((link) => (
              <li key={link.href} className="relative">
                <a
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={
                    link.isRoute
                      ? (e) => {
                          e.preventDefault();
                          setMenuOpen(false);
                          navigate(link.href);
                        }
                      : link.isExternal
                      ? () => setMenuOpen(false)
                      : (e) => {
                          e.preventDefault();
                          handleNav(link.href);
                        }
                  }
                  className="relative text-xs uppercase tracking-[0.2em] text-cream/80 transition-colors hover:text-cream"
                >
                  {link.label}
                  {hovered === link.href && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1.5 left-0 h-px w-full bg-gold"
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <MagneticButton
              variant="outline"
              className="!px-6 !py-3 !text-[11px]"
              onClick={() => handleNav("#contact")}
            >
              Book Site Visit
            </MagneticButton>
            <MagneticButton
              variant="solid"
              className="!px-6 !py-3 !text-[11px]"
              onClick={() => {
                setMenuOpen(false);
                navigate("/quote");
              }}
            >
              Get Quotation
            </MagneticButton>
          </div>

          <button
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
          >
            <motion.span
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
              className="h-px w-6 bg-cream"
            />
            <motion.span
              animate={{ opacity: menuOpen ? 0 : 1 }}
              className="h-px w-6 bg-cream"
            />
            <motion.span
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
              className="h-px w-6 bg-cream"
            />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-ink lg:hidden"
          >
            {LINKS.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                onClick={
                  link.isRoute
                    ? (e) => {
                        e.preventDefault();
                        setMenuOpen(false);
                        navigate(link.href);
                      }
                    : link.isExternal
                    ? () => setMenuOpen(false)
                    : (e) => {
                        e.preventDefault();
                        handleNav(link.href);
                      }
                }
                className={cn(
                  "font-display text-3xl text-cream",
                  link.hideOnMobile && "hidden md:block"
                )}
              >
                {link.label}
              </motion.a>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + LINKS.length * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <MagneticButton
                variant="solid"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/quote");
                }}
              >
                Get Quotation
              </MagneticButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
