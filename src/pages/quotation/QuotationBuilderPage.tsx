import { useNavigate } from "react-router-dom";
import { AreaStep } from "@/components/quotation/AreaStep";
import { PackageCards } from "@/components/quotation/PackageCards";
import { PackageEstimate } from "@/components/quotation/PackageEstimate";
import { CustomerInfoForm } from "@/components/quotation/CustomerInfoForm";
import { LiveEstimatePanel } from "@/components/quotation/LiveEstimatePanel";
import { StepProgress } from "@/components/quotation/StepProgress";
import { BoardStep } from "@/components/quotation/steps/BoardStep";
import { ShutterStep } from "@/components/quotation/steps/ShutterStep";
import { GlassCabinetsStep } from "@/components/quotation/steps/GlassCabinetsStep";
import { PantryStep } from "@/components/quotation/steps/PantryStep";
import { PantryHardwareBrandStep } from "@/components/quotation/steps/PantryHardwareBrandStep";
import { IndividualHardwareStep } from "@/components/quotation/steps/IndividualHardwareStep";
import { RollingShutterStep } from "@/components/quotation/steps/RollingShutterStep";
import { ScrewStep } from "@/components/quotation/steps/ScrewStep";
import { LightingStep } from "@/components/quotation/steps/LightingStep";
import { CUSTOM_STEPS, useQuotationStore } from "@/store/quotationStore";

const CUSTOM_STEP_COMPONENTS: Record<(typeof CUSTOM_STEPS)[number], () => React.JSX.Element> = {
  board: BoardStep,
  shutter: ShutterStep,
  glassCabinets: GlassCabinetsStep,
  pantry: PantryStep,
  pantryHardwareBrand: PantryHardwareBrandStep,
  individualHardware: IndividualHardwareStep,
  rollingShutter: RollingShutterStep,
  screws: ScrewStep,
  lighting: LightingStep,
};

export function QuotationBuilderPage() {
  const navigate = useNavigate();
  const stage = useQuotationStore((s) => s.stage);
  const setStage = useQuotationStore((s) => s.setStage);
  const chooseQuotationType = useQuotationStore((s) => s.chooseQuotationType);
  const customStepIndex = useQuotationStore((s) => s.customStepIndex);
  const reset = useQuotationStore((s) => s.reset);

  const showLivePanel = stage === "custom" || stage === "customerInfo";

  function handleGenerated(quotationId: number) {
    navigate(`/quote/${quotationId}`);
    reset();
  }

  const CurrentCustomStep = CUSTOM_STEP_COMPONENTS[CUSTOM_STEPS[customStepIndex]];

  return (
    <div className="min-h-screen bg-ink px-4 pb-32 pt-32 md:pb-16">
      <div className={showLivePanel ? "mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]" : ""}>
        <div>
          {stage === "area" && <AreaStep onContinue={() => setStage("packageOrCustom")} />}

          {stage === "packageOrCustom" && <PackageCards onCustomize={() => chooseQuotationType("custom")} />}

          {stage === "packageEstimate" && (
            <PackageEstimate onContinue={() => setStage("customerInfo")} onBack={() => setStage("packageOrCustom")} />
          )}

          {stage === "custom" && (
            <div className="mx-auto max-w-2xl">
              <StepProgress />
              <CurrentCustomStep />
            </div>
          )}

          {stage === "customerInfo" && <CustomerInfoForm onGenerated={handleGenerated} />}
        </div>

        {showLivePanel && <LiveEstimatePanel />}
      </div>
    </div>
  );
}
