import { GlassCard } from "@/components/ui/GlassCard";
import { StepShell } from "@/components/quotation/StepShell";
import { useBoards } from "@/hooks/useCatalog";
import { useQuotationStore } from "@/store/quotationStore";
import { cn } from "@/lib/utils";

export function BoardStep() {
  const { data: boards, isLoading, isError } = useBoards();
  const boardId = useQuotationStore((s) => s.custom.board_id);
  const setBoard = useQuotationStore((s) => s.setBoard);
  const next = useQuotationStore((s) => s.nextCustomStep);
  const prev = useQuotationStore((s) => s.prevCustomStep);

  return (
    <StepShell title="Choose Your Carcass Board" onBack={prev} onNext={next} nextDisabled={!boardId}>
      {isLoading && <p className="text-grey">Loading boards...</p>}
      {isError && <p className="text-red-400">Couldn't load boards.</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(boards ?? []).map((board) => (
          <GlassCard
            key={board.id}
            className={cn(
              "cursor-pointer p-5 transition-colors duration-200",
              boardId === board.id ? "border border-gold" : "border border-transparent hover:border-cream/20"
            )}
          >
            <button type="button" onClick={() => setBoard(board.id)} className="w-full text-left">
              <p className="text-xs uppercase tracking-widest text-grey">{board.brand_name}</p>
              <p className="mt-1 font-display text-lg text-cream">{board.name}</p>
              <p className="mt-1 text-xs text-grey">
                {board.board_type} {board.thickness ? `· ${board.thickness}` : ""}
              </p>
              <p className="mt-3 text-gold">₹{board.price_per_sqft.toLocaleString("en-IN")} / sq.ft.</p>
            </button>
          </GlassCard>
        ))}
      </div>
    </StepShell>
  );
}
