import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

interface StepShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  skip?: { label: string; onSkip: () => void };
}

export function StepShell({ title, subtitle, children, onBack, onNext, nextLabel = "Continue", nextDisabled, skip }: StepShellProps) {
  return (
    <GlassCard className="mx-auto max-w-2xl p-8 md:p-10">
      <h2 className="font-display text-2xl text-cream md:text-3xl">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-grey">{subtitle}</p>}

      <div className="mt-6">{children}</div>

      <div className="mt-8 flex items-center gap-3">
        <MagneticButton variant="ghost" onClick={onBack}>
          Back
        </MagneticButton>
        {skip && (
          <button type="button" onClick={skip.onSkip} className="text-xs uppercase tracking-widest text-grey hover:text-cream">
            {skip.label}
          </button>
        )}
        <MagneticButton variant="solid" className="ml-auto flex-1 justify-center" onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </MagneticButton>
      </div>
    </GlassCard>
  );
}
