import { useSeo } from "@/hooks/useSeo";

interface DesignStudioToolPageProps {
  /** Root-relative path to the standalone static tool HTML file. */
  src: string;
  title: string;
  description: string;
  /** Route path, used to build the canonical URL. */
  path: string;
}

/** Embeds one of the standalone three.js design tools (public/design-studio*.html)
 * as a real React Router route, so navigating to it never triggers a full
 * top-level page reload and works identically in dev, preview, and any static host. */
export function DesignStudioToolPage({ src, title, description, path }: DesignStudioToolPageProps) {
  useSeo({ title, description, path });

  return (
    <div className="fixed inset-0 bg-ink">
      <iframe src={src} title={title} className="h-full w-full border-0" />
    </div>
  );
}
