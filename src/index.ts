// `@cinatra-ai/text-artifact` — the system-base plain-text renderer. It ships a
// `detail`-slot renderer that draws a text document (plain text / CSV) from the
// content the host projected onto its props.
//
// A renderer artifact: it declares its accepted upload MIME set (the required
// MIME-base expansion, epic cinatra#1883 slice A1), a single `detail`-slot
// renderer, and a dedicated `objectTypes` claim (`@cinatra-ai/text-artifact:artifact`) so the
// core upload pipeline can map an accepted MIME to exactly this type (the
// exactly-one-or-refuse resolver in src/lib/artifacts/upload-artifact-type-map).
// The accepted MIME set is DISJOINT from every other required base — the
// DECLARED media type decides the type, never magic byte-sniffing (a .docx is a
// ZIP container on disk, but its declared OOXML media type routes it here, not
// to zip-artifact).
//
// THE DOCUMENT ARRIVES ON THE PROPS, through the versioned server content
// channel, read from the pinned revision on the server and capped there. The
// display performs no load of its own, on any road, which is what lets it draw
// inside a third-party application — where the subframe road it used before
// carried no credential and painted an empty plate. Anything the channel cannot
// supply degrades to a NAMED floor, never a blank.
//
// The AUTHORITATIVE manifest is the `cinatra` block in `package.json` (what the
// host install pipeline + the marketplace publish gate read). This module
// re-declares the `artifact` descriptor as a typed value for programmatic use;
// the manifest test keeps the two in agreement.

export {
  type ArtifactRendererProps,
  ARTIFACT_RENDERER_PROPS_API_VERSION,
} from "./artifact-renderer-props";

// The content channel the display reads, and the total resolver over it.
export {
  ARTIFACT_CONTENT_CHANNEL_VERSION,
  ARTIFACT_CONTENT_CLASSES,
  ARTIFACT_CONTENT_ABSENCES,
} from "./artifact-content-channel";
export type {
  ArtifactContentProjection,
  ArtifactContentClass,
  ArtifactContentAbsence,
} from "./artifact-content-channel";
export {
  resolveArtifactTextView,
  contentFloorMessage,
  contentFloorSummary,
  byteDownloadHref,
} from "./content-view";
export type { ArtifactTextView, ArtifactTextViewInput, ContentFloorReason } from "./content-view";

/** The closed renderer-slot names. This base ships `detail` only. */
export type ArtifactUiSlot = "detail" | "preview";

/** A single slot renderer. It requests NO host ports — only these three keys. */
export interface ArtifactUiRenderer {
  entry: string;
  propsApiVersion: number;
  representations?: string[];
}

export interface ArtifactUiManifest {
  abiVersion: 1;
  sdkAbiRange: string;
  renderers: Partial<Record<ArtifactUiSlot, ArtifactUiRenderer>>;
}

export interface TextArtifactManifest {
  accepts: { file: { mimeTypes: string[] } };
  ui: ArtifactUiManifest;
}

export const textArtifactManifest: TextArtifactManifest = {
  accepts: {
    file: {
      mimeTypes: ["text/plain","text/csv"],
    },
  },
  ui: {
    abiVersion: 1,
    sdkAbiRange: "^2.5.0",
    renderers: {
      detail: {
        // The renderer DRAWS only text/csv — the accepted text format the host
        // has no first-party renderer for. text/plain is accepted (upload
        // TYPING below) but keeps its richer host-owned renderer (the `text`
        // first-party floor), so this base never displaces it.
        // `representations` (what this pack draws) is deliberately a subset of
        // `accepts` (what this pack types). text/markdown is NOT accepted here:
        // markdown has a dedicated base of its own, and exactly one installed
        // base may claim a form.
        entry: "./src/renderers/detail.tsx",
        propsApiVersion: 2,
        representations: ["text/csv"],
      },
    },
  },
};
