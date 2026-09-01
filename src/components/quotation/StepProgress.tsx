import { CUSTOM_STEPS, useQuotationStore } from "@/store/quotationStore";
import { cn } from "@/lib/utils";

const STEP_LABELS: Record<(typeof CUSTOM_STEPS)[number], string> = {
  board: "Board",
  shutter: "Shutter",
  glassCabinets: "Glass",
  pantry: "Pantry",
  pantryHardwareBrand: "Hardware Brand",
  individualHardware: "Hardware",
  rollingShutter: "Rolling Shutter",
  screws: "Screws",
  lighting: "Lighting",
};

export function StepProgress() {
  const custom = useQuotationStore((s) => s.custom);
  const currentIndex = useQuotationStore((s) => s.customStepIndex);
  const goToStep = useQuotationStore((s) => s.goToCustomStep);

  const visibleSteps = CUSTOM_STEPS.filter((step) => step !== "individualHardware" || !custom.hardware.use_brand_throughout);

  return (
    <div className="mx-auto mb-8 flex max-w-2xl flex-wrap justify-center gap-2">
      {visibleSteps.map((step) => {
        const index = CUSTOM_STEPS.indexOf(step);
        return (
          <button
            key={step}
            type="button"
            onClick={() => goToStep(index)}
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest transition-colors duration-300",
              index === currentIndex
                ? "border-gold bg-gold/10 text-gold"
                : index < currentIndex
                  ? "border-cream/25 text-cream/70"
                  : "border-cream/10 text-grey/50"
            )}
          >
            {STEP_LABELS[step]}
          </button>
        );
      })}
    </div>
  );
}
