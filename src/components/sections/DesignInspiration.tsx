import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InspirationGrid } from "./InspirationGrid";
import { WARDROBE_INSPIRATION } from "@/data/wardrobeInspiration";
import { KITCHEN_INSPIRATION } from "@/data/kitchenInspiration";
import { CEILING_INSPIRATION } from "@/data/ceilingInspiration";
import { TV_PANEL_INSPIRATION } from "@/data/tvPanelInspiration";
import { MANDIR_INSPIRATION } from "@/data/mandirInspiration";
import { DOOR_INSPIRATION } from "@/data/doorInspiration";
import { MASTER_BEDROOM_INSPIRATION } from "@/data/masterBedroomInspiration";
import { BATHROOM_INSPIRATION } from "@/data/bathroomInspiration";
import { WALL_DESIGN_INSPIRATION } from "@/data/wallDesignInspiration";
import { CROCKERY_INSPIRATION } from "@/data/crockeryInspiration";
import { BALCONY_INSPIRATION } from "@/data/balconyInspiration";
import { DINING_ROOM_INSPIRATION } from "@/data/diningRoomInspiration";
import { STUDY_ROOM_INSPIRATION } from "@/data/studyRoomInspiration";
import { STAIRCASE_INSPIRATION } from "@/data/staircaseInspiration";
import { cn } from "@/lib/utils";

const GROUPS = [
  { key: "wardrobe", label: "Wardrobe", categories: WARDROBE_INSPIRATION },
  { key: "kitchen", label: "Kitchen", categories: KITCHEN_INSPIRATION },
  { key: "kitchen-ceiling", label: "Kitchen Ceiling", categories: CEILING_INSPIRATION },
  { key: "tv-panel", label: "TV Panel", categories: TV_PANEL_INSPIRATION },
  { key: "mandir", label: "Mandir", categories: MANDIR_INSPIRATION },
  { key: "doors", label: "Doors", categories: DOOR_INSPIRATION },
  { key: "master-bedroom", label: "Master Bedroom", categories: MASTER_BEDROOM_INSPIRATION },
  { key: "bathroom", label: "Bathroom", categories: BATHROOM_INSPIRATION },
  { key: "wall-design", label: "Wall Design", categories: WALL_DESIGN_INSPIRATION },
  { key: "crockery", label: "Crockery Unit", categories: CROCKERY_INSPIRATION },
  { key: "balcony", label: "Balcony", categories: BALCONY_INSPIRATION },
  { key: "dining-room", label: "Dining Room", categories: DINING_ROOM_INSPIRATION },
  { key: "study-room", label: "Study Room", categories: STUDY_ROOM_INSPIRATION },
  { key: "staircase", label: "Staircase", categories: STAIRCASE_INSPIRATION },
] as const;

export function DesignInspiration() {
  const [activeGroup, setActiveGroup] = useState<(typeof GROUPS)[number]["key"]>("wardrobe");
  const group = GROUPS.find((g) => g.key === activeGroup)!;

  return (
    <section id="inspiration" className="relative bg-ink py-28 md:py-40">
      <div className="container-luxury">
        <div className="mb-12">
          <SectionHeading
            eyebrow="Inspiration"
            title="Our Projects, Your Ideas"
            description="Curated reference images to help you explore styles before we design your own space."
          />
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setActiveGroup(g.key)}
              data-cursor={g.key === activeGroup ? "" : "View"}
              className={cn(
                "rounded-full border px-6 py-2.5 text-xs uppercase tracking-widest transition-colors duration-300",
                g.key === activeGroup
                  ? "border-gold bg-gold text-ink"
                  : "border-gold/25 text-grey hover:border-gold/60 hover:text-cream"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>

        <InspirationGrid key={group.key} categories={group.categories} />
      </div>
    </section>
  );
}
