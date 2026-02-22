import React from "react";
import { MediaRenderer, type Media, type MediaLayout } from "./MediaRenderer";

function getMediaLayout(media: unknown): MediaLayout {
  if (media == null || typeof media !== "object" || Array.isArray(media))
    return "default";
  const m = media as Record<string, unknown>;
  return m.layout === "left" ? "left" : "default";
}

function hasMediaContent(media: unknown): media is Media {
  if (media == null || typeof media !== "object" || Array.isArray(media)) return false;
  const m = media as Record<string, unknown>;
  const img = m.images;
  const dia = m.diagrams;
  const doc = m.documents;
  const hasImages = Array.isArray(img) && img.length > 0;
  const hasDiagrams = Array.isArray(dia) && dia.length > 0;
  const hasDocuments = Array.isArray(doc) && doc.length > 0;
  return hasImages || hasDiagrams || hasDocuments;
}

interface AutoMediaRendererProps {
  data: unknown;
  children?: React.ReactNode;
  visited?: WeakSet<object>;
}

function renderRecursive(
  value: unknown,
  visited: WeakSet<object>,
  currentKey: string,
  externalChildren?: React.ReactNode
): React.ReactNode {
  if (value == null || typeof value !== "object") return null;

  const objRef = value as object;
  if (visited.has(objRef)) return null;
  visited.add(objRef);

  if (Array.isArray(value)) {
    return (value as unknown[]).map((item, i) =>
      renderRecursive(item, visited, `${currentKey}-${i}`, undefined)
    );
  }

  const obj = value as Record<string, unknown>;
  const mediaVal = obj.media;
  const hasMedia =
    mediaVal != null &&
    typeof mediaVal === "object" &&
    !Array.isArray(mediaVal) &&
    hasMediaContent(mediaVal);

  const childNodes = Object.keys(obj)
    .filter((k) => k !== "media")
    .map((k) => renderRecursive(obj[k], visited, `${currentKey}-${k}`, undefined));

  const hasAnyChild = childNodes.some((n) => n != null);
  if (!hasMedia && !hasAnyChild) return null;

  const layout = hasMedia ? getMediaLayout(mediaVal) : "default";
  const useLeftLayout = layout === "left" && hasMedia;

  if (useLeftLayout) {
    return (
      <MediaRenderer key={currentKey} media={mediaVal as Media}>
        {externalChildren ?? childNodes}
      </MediaRenderer>
    );
  }

  return (
    <React.Fragment key={currentKey}>
      {hasMedia && <MediaRenderer media={mediaVal as Media} />}
      {childNodes}
    </React.Fragment>
  );
}

export function AutoMediaRenderer({
  data,
  children,
  visited = new WeakSet<object>(),
}: AutoMediaRendererProps): React.ReactElement | null {
  const isTopLevelObject =
    data != null &&
    typeof data === "object" &&
    !Array.isArray(data) &&
    "media" in (data as object);
  const mediaVal = isTopLevelObject
    ? (data as Record<string, unknown>).media
    : undefined;
  const layout = isTopLevelObject ? getMediaLayout(mediaVal) : "default";
  const hasMedia = mediaVal != null && hasMediaContent(mediaVal);
  const useLeftLayout = layout === "left" && hasMedia && children != null;

  const result = renderRecursive(
    data,
    visited,
    "0",
    useLeftLayout ? children : undefined
  );

  if (result == null && children == null) return null;

  return (
    <>
      {result}
      {!useLeftLayout && children}
    </>
  );
}
