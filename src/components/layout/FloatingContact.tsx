import { motion } from "framer-motion";
import { FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

export function FloatingContact() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 3.8, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-8 right-6 z-40 flex flex-col gap-3"
    >
      <a
        href="https://wa.me/917018595304"
        target="_blank"
        rel="noreferrer"
        data-cursor="Chat"
        aria-label="Chat on WhatsApp"
        className="flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-ink shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-transform hover:scale-110"
        style={{ height: 52, width: 52 }}
      >
        <FaWhatsapp size={22} />
      </a>
      <a
        href="tel:+917018595304"
        data-cursor="Call"
        aria-label="Call now"
        className="flex items-center justify-center rounded-full border border-gold/40 bg-ink/80 text-gold backdrop-blur transition-transform hover:scale-110"
        style={{ height: 52, width: 52 }}
      >
        <FaPhoneAlt size={16} />
      </a>
    </motion.div>
  );
}
