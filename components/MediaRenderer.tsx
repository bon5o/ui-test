import Image from "next/image";

export interface MediaImageItem {
  src: string;
  caption?: string;
  alt?: string;
  scale?: number;
}

export interface MediaDocumentItem {
  src: string;
  caption?: string;
}

export type MediaLayout = "default" | "left";

export interface Media {
  images?: MediaImageItem[];
  diagrams?: MediaImageItem[];
  documents?: MediaDocumentItem[];
  layout?: MediaLayout;
}

interface MediaRendererProps {
  media?: Media | null;
  children?: React.ReactNode;
}

function renderImageItems(
  items: MediaImageItem[],
  fallbackAlt: string
): React.ReactNode[] {
  return items.map((img, index) => {
    const scale = img.scale ?? 1;
    return (
      <figure
        key={img.src ? `${img.src}-${index}` : index}
        className="inline-block p-2 bg-gray-50 border border-gray-100 rounded"
      >
        {img.src && (
          <div
            className="inline-block"
            style={{ width: `${600 * scale}px` }}
          >
            <Image
              src={img.src}
              alt={img.alt ?? img.caption ?? fallbackAlt}
              width={600}
              height={400}
              unoptimized
              style={{ width: "100%", height: "auto" }}
              className="rounded"
            />
          </div>
        )}
      {img.caption != null && img.caption !== "" && (
        <figcaption className="mt-2 text-xs leading-relaxed text-gray-500">
          {img.caption}
        </figcaption>
      )}
    </figure>
    );
  });
}

function renderDocumentItems(items: MediaDocumentItem[]): React.ReactNode[] {
  return items.map((doc, index) => (
    <div key={doc.src ? `${doc.src}-${index}` : index} className="rounded border border-gray-100 bg-gray-50/50 p-3">
      <a
        href={doc.src}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-[#7D9CD4] underline decoration-[#7D9CD4]/30 underline-offset-2 transition-colors hover:text-[#5E7AB8] hover:decoration-[#7D9CD4]/55"
      >
        {doc.caption != null && doc.caption !== "" ? doc.caption : doc.src}
      </a>
    </div>
  ));
}

export function MediaRenderer({ media, children }: MediaRendererProps): React.ReactNode {
  if (media == null) return null;

  const layout = media.layout ?? "default";
  const images = media.images ?? [];
  const diagrams = media.diagrams ?? [];
  const documents = media.documents ?? [];

  const hasImages = images.length > 0;
  const hasDiagrams = diagrams.length > 0;
  const hasDocuments = documents.length > 0;

  if (!hasImages && !hasDiagrams && !hasDocuments) return null;

  const parts: React.ReactNode[] = [];

  if (hasImages) {
    parts.push(...renderImageItems(images, "関連画像"));
  }
  if (hasDiagrams) {
    parts.push(...renderImageItems(diagrams, "関連図"));
  }
  if (hasDocuments) {
    parts.push(...renderDocumentItems(documents));
  }

  const mediaContent = <div className="space-y-6">{parts}</div>;

  if (layout === "left" && children != null) {
    return (
      <div className="after:content-[''] after:table after:clear-both">
        <figure className="float-left mr-6 mb-4 inline-block">
          {mediaContent}
        </figure>
        <div>{children}</div>
      </div>
    );
  }

  return mediaContent;
}
