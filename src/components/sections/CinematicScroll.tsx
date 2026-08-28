import { useEffect, useRef, useState } from "react";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { clamp, cn, lerp } from "@/lib/utils";

const VIDEO_SRC = "/videos/cinematic-showcase.mp4";
const POSTER_SRC = "/videos/cinematic-showcase-poster.jpg";

// ---------------------------------------------------------------------------
// Scroll-to-video tuning knobs
// ---------------------------------------------------------------------------
// How many viewport-heights of scroll distance the section asks for per
// second of footage. Raise this to make the same clip feel slower/longer to
// scrub through, lower it to make it feel faster. Total scroll length is
// clamped to [MIN_SCROLL_VH, MAX_SCROLL_VH] so very short/long source clips
// still get a sane, comfortable amount of scroll room.
const VH_PER_SECOND_OF_VIDEO = 55;
const MIN_SCROLL_VH = 300;
const MAX_SCROLL_VH = 700;

// Touch scroll gestures cover less distance per swipe than a mouse wheel, so
// the same vh-per-second pacing feels far longer to scrub through on a phone.
// Scale both knobs down below the tablet breakpoint.
const VH_PER_SECOND_OF_VIDEO_MOBILE = 35;
const MAX_SCROLL_VH_MOBILE = 450;

// How quickly the displayed frame chases the scroll-derived target frame,
// per animation frame (0-1). Lower = dreamier/more trailing, higher = more
// directly "glued" to the scrollbar. ~0.1-0.18 reads as cinematic without
// feeling laggy.
const SMOOTHING = 0.14;

// Once the gap between the current frame and target frame is smaller than
// this (in seconds), stop nudging currentTime. Prevents an endless tail of
// near-zero seeks once scrolling has settled.
const SNAP_EPSILON_S = 0.02;

/**
 * Full-bleed section whose video playback position is driven entirely by
 * how far the user has scrolled through it — not by autoplay. Scrolling
 * down scrubs forward, scrolling up scrubs backward, and the same scroll
 * position always maps to the same frame.
 */
export function CinematicScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [scrollVh, setScrollVh] = useState(MIN_SCROLL_VH);
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  // Size the scroll track to the video's real duration once metadata loads,
  // so scrub speed stays consistent regardless of clip length.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      if (!video.duration || !Number.isFinite(video.duration)) return;
      const perSecond = isMobile ? VH_PER_SECOND_OF_VIDEO_MOBILE : VH_PER_SECOND_OF_VIDEO;
      const max = isMobile ? MAX_SCROLL_VH_MOBILE : MAX_SCROLL_VH;
      setScrollVh(clamp(video.duration * perSecond, MIN_SCROLL_VH, max));
      setReady(true);
    };

    if (video.readyState >= 1) onLoadedMetadata();
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => video.removeEventListener("loadedmetadata", onLoadedMetadata);
  }, [isMobile]);

  // Scroll-position -> video-frame loop. Runs only while the section is near
  // the viewport (IntersectionObserver gates the rAF loop), and reads scroll
  // position directly from layout each frame rather than from scroll events,
  // so the result is deterministic and independent of scroll speed.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || reducedMotion) return;

    let rafId: number | null = null;
    // Our own running estimate of "where playback should be," kept separate
    // from video.currentTime. The browser can leave a seek in flight for a
    // few frames, and reading currentTime back mid-seek would feed a stale
    // value into the lerp; tracking it ourselves keeps the smoothing curve
    // accurate regardless of how fast the video element's decoder catches up.
    let smoothedTime = 0;
    let initialized = false;

    const tick = () => {
      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const scrollableDistance = rect.height - viewportH;

      // progress: 0 when the section's top just reaches the top of the
      // viewport, 1 when its bottom reaches the bottom (i.e. the sticky
      // child is about to release). Same formula regardless of how fast or
      // slow the user got here, so it is fully reversible and repeatable.
      const progress =
        scrollableDistance > 0
          ? clamp(-rect.top / scrollableDistance, 0, 1)
          : 0;

      const duration = video.duration || 0;
      const targetTime = duration * progress;

      if (!initialized) {
        // Snap on the very first frame (e.g. page loaded mid-scroll via a
        // hash link or restored scroll position) instead of animating in
        // from 0, which would misrepresent where the user actually is.
        smoothedTime = targetTime;
        initialized = true;
      } else {
        smoothedTime = lerp(smoothedTime, targetTime, SMOOTHING);
      }

      // Re-issuing currentTime every frame (even mid-seek) is deliberate:
      // browsers treat a new seek request as superseding the previous one
      // and keep tracking toward the latest value, which in practice keeps
      // pace with a moving target far better than waiting for each seek to
      // fully settle before requesting the next one.
      if (Math.abs(smoothedTime - video.currentTime) > SNAP_EPSILON_S) {
        video.currentTime = smoothedTime;
      }

      rafId = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (rafId === null) rafId = requestAnimationFrame(tick);
        } else if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { rootMargin: "150px 0px", threshold: 0 }
    );
    io.observe(section);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      io.disconnect();
    };
  }, [reducedMotion, scrollVh]);

  return (
    <section
      ref={sectionRef}
      id="cinematic-tour"
      aria-label="Interior design showcase"
      className="relative bg-ink"
      style={{ height: `${scrollVh}vh` }}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink">
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          className="h-full w-full object-cover"
        />

        {/* Poster frame masks the video until it has enough data to scrub,
            so the section never flashes blank/black while loading. */}
        <img
          src={POSTER_SRC}
          alt=""
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
            ready ? "opacity-0" : "opacity-100"
          )}
        />

        {/* Subtle vignette + edge fades so the video blends into the dark site rather than sitting as a hard rectangle. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent md:h-48" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent md:h-48" />
      </div>
    </section>
  );
}
