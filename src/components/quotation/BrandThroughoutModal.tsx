import { Modal } from "@/components/ui/Modal";
import { MagneticButton } from "@/components/ui/MagneticButton";

interface BrandThroughoutModalProps {
  open: boolean;
  brandName: string;
  onClose: () => void;
  onUseThroughout: () => void;
  onOnlyPantry: () => void;
}

export function BrandThroughoutModal({ open, brandName, onClose, onUseThroughout, onOnlyPantry }: BrandThroughoutModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <h3 className="font-display text-xl text-cream">Use {brandName} throughout the kitchen?</h3>
      <p className="mt-3 text-sm text-grey">
        Using {brandName} throughout your kitchen will automatically apply compatible {brandName} hardware to drawers, hinges, pantry
        systems and other applicable hardware.
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <MagneticButton variant="solid" className="justify-center" onClick={onUseThroughout}>
          Use {brandName} Throughout
        </MagneticButton>
        <MagneticButton variant="outline" className="justify-center" onClick={onOnlyPantry}>
          Only Use for Pantry
        </MagneticButton>
      </div>
    </Modal>
  );
}
