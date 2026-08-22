import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface LoaderProps {
  onComplete: () => void;
}

export function Loader({ onComplete }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1800;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => setDone(true), 300);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-ink"
          exit={{
            clipPath: "inset(0 0 100% 0)",
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-2xl tracking-[0.2em] text-cream"
          >
            DHIMAN <span className="text-gold">INTERIORS</span>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="h-px w-40 overflow-hidden bg-charcoal-light sm:w-56">
              <motion.div
                className="h-full bg-gold"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-10 font-body text-xs tabular-nums text-grey">
              {progress}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
