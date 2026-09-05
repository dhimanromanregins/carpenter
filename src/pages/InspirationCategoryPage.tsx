import { Link, Navigate, useParams } from "react-router-dom";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InspirationGrid } from "@/components/sections/InspirationGrid";
import { useSeo } from "@/hooks/useSeo";
import { getInspirationRoom } from "@/data/inspirationCategories";

export function InspirationCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const room = getInspirationRoom(slug);

  useSeo({
    title: room ? `${room.label} Design Inspiration` : "Design Inspiration",
    description: room
      ? `${room.description} Explore ${room.label.toLowerCase()} interior design ideas from Dhiman Interiors, serving Zirakpur, Chandigarh and Mohali.`
      : "Browse interior design inspiration from Dhiman Interiors.",
    path: `/inspiration/${slug ?? ""}`,
    image: room?.categories[0]?.images[0]?.src,
  });

  if (!room) return <Navigate to="/inspiration" replace />;

  return (
    <div className="min-h-screen bg-ink pb-28 pt-36 md:pt-44">
      <div className="container-luxury">
        <Link to="/inspiration" className="text-xs uppercase tracking-widest text-grey hover:text-cream">
          &larr; All rooms
        </Link>

        <SectionHeading
          eyebrow="Look Book"
          title={room.label}
          description={room.description}
          className="mt-6"
          headingLevel="h1"
        />

        <div className="mt-14">
          <InspirationGrid categories={room.categories} />
        </div>

        <p className="mt-12 max-w-2xl text-xs leading-relaxed text-grey/70">{room.credit}</p>
      </div>
    </div>
  );
}
