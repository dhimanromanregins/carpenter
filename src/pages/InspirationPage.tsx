import { Link } from "react-router-dom";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useSeo } from "@/hooks/useSeo";
import { INSPIRATION_ROOMS } from "@/data/inspirationCategories";

export function InspirationPage() {
  useSeo({
    title: "Interior Design Inspiration Gallery",
    description:
      "Browse kitchen, wardrobe, bedroom and full-home interior design inspiration from Dhiman Interiors, serving Zirakpur, Chandigarh and Mohali.",
    path: "/inspiration",
  });

  return (
    <div className="min-h-screen bg-ink pb-28 pt-36 md:pt-44">
      <div className="container-luxury">
        <SectionHeading
          eyebrow="Look Book"
          title="Design Inspiration"
          description="Browse reference styles by room, then bring the ones you love to your quote or a Design Studio session."
          headingLevel="h1"
        />

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {INSPIRATION_ROOMS.map((room) => {
            const cover = room.categories[0]?.images[0];
            return (
              <Link
                key={room.slug}
                to={`/inspiration/${room.slug}`}
                data-cursor="View"
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-gold/10"
              >
                {cover ? (
                  <img
                    src={cover.src}
                    alt={`${room.label} interior design inspiration`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-charcoal" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-95" />

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl text-cream">{room.label}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-grey">{room.description}</p>
                </div>

                <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 text-gold opacity-60 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:opacity-100">
                  &#8599;
                </div>
              </Link>
            );
          })}
        </div>

        <Link to="/" className="mt-16 inline-block text-xs uppercase tracking-widest text-grey hover:text-cream">
          &larr; Back home
        </Link>
      </div>
    </div>
  );
}
