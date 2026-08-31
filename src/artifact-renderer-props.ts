// The versioned, normalized, SERIALIZABLE props snapshot a Cinatra
// extension-shipped artifact renderer receives from the host.
//
// A renderer requests NO host ports — it renders ONLY from this host-supplied
// authorized snapshot. Every field is plain JSON data: row metadata, the
// resolved representation, host-authorized URLs, sanctioned action handles as
// navigational hrefs (never closures / host context), and the content the server
// already read from the pinned revision.
//
// THE VERSION IS 2 SINCE THIS DISPLAY MOVED ONTO THE CONTENT CHANNEL. A v1
// snapshot carries no content field at all, which is why this display used to
// hand the browser an address and let it load the document itself — and why it
// painted an empty plate inside a third-party application, where that load
// carries no credential. The host still BUILDS v1 for a display that declares
// v1, so the move is negotiated per display and is not a flag day; this display
// declares 2 and floors, named, on anything older.
//
// This is a HOST-NEUTRAL STRUCTURAL MIRROR of the host's props contract,
// declared locally so the renderer stays standalone-typecheckable and -testable
// (the concrete host type lives in the host application and is not a published
// package). The shape is byte-compatible with the host contract: a host that
// hands a superset object still assigns to this structural type.

import type { ArtifactContentProjection } from "./artifact-content-channel";

export const ARTIFACT_RENDERER_PROPS_API_VERSION = 2;

// THE CANONICAL PROJECTIONS THE HOST ACTUALLY SENDS, spelled out rather than
// widened to `string`, because a mirror that accepts anything proves nothing:
// the whole reason this file exists is to fail when the host's shape and this
// display's expectation drift apart.
/** The ownership levels an authorized row is projected at. */
export const ARTIFACT_OWNER_LEVELS = ["user", "team", "organization", "workspace"] as const;
/** The visibilities an authorized row is projected at. */
export const ARTIFACT_VISIBILITIES = ["private", "team", "organization", "public"] as const;
/** The effective-identity kinds: a type-driven identity is either an installed
 * extension, or it has no primary one. The retired binding/classic `basis` and
 * the `selectable` activation barrier are gone from the host contract, so they
 * are gone from here — a mirror that still demanded them would refuse every
 * snapshot the host now builds. */
export const EFFECTIVE_IDENTITY_KINDS = ["extension", "no-primary"] as const;

export type ArtifactOwnerLevel = (typeof ARTIFACT_OWNER_LEVELS)[number];
export type ArtifactVisibility = (typeof ARTIFACT_VISIBILITIES)[number];
export type EffectiveIdentityKind = (typeof EFFECTIVE_IDENTITY_KINDS)[number];

export interface ArtifactRendererProps {
  /** The props-contract version this snapshot conforms to. A renderer declares
   * the `propsApiVersion` it expects; the host refuses to mount a renderer whose
   * expected version this snapshot does not satisfy. */
  propsApiVersion: number;
  /** Row metadata (a projection of the authorized artifact summary). */
  artifact: {
    id: string;
    title: string | null;
    objectType: string;
    mime: string;
    size: number;
    createdAt: string;
    updatedAt: string;
    ownerLevel: ArtifactOwnerLevel;
    visibility: ArtifactVisibility;
    sourceUrl: string | null;
  };
  /** The resolved representation to serve (null when the artifact has no
   * materialized representation). */
  representation: {
    revisionId: string;
    mime: string;
  } | null;
  /** Host-authorized SESSION URLs, already access-checked by the host. They
   * re-authorize against the reading actor's cookie, so they are reachable on a
   * first-party surface and NOT inside a third-party application — see `bytes`
   * below for the address that is. */
  urls: {
    preview: string | null;
    download: string | null;
  };
  /** The resolved effective identity, flattened to plain data. */
  identity: {
    kind: EffectiveIdentityKind;
    extension: string | null;
  };
  /** Sanctioned action handles — SERIALIZABLE navigational hrefs only. */
  actions: {
    download: string | null;
    openInSource: string | null;
  };
  /**
   * THE VERSIONED SERVER CONTENT CHANNEL: the discriminated content projection,
   * read from the PINNED revision on the server and capped there. A display
   * switches on `content.kind` and reaches for nothing; `none` is a first-class
   * answer with a named reason. This is what lets a display draw inside a
   * third-party application at all.
   */
  content: ArtifactContentProjection;
  /**
   * THE BYTE REFERENCE for this pinned revision, from the surface's own road.
   *
   * `road` names which one it is, because the two are not interchangeable: an
   * `island` address is a sealed, short-lived, single-revision capability, and a
   * `session` address is the cookie-gated route. It is an ADDRESS and never a
   * payload.
   *
   * ABSENT AT THE OLDER VERSION, deliberately — a snapshot built at v1 has no
   * such key at all, so this field is read defensively and never assumed.
   */
  bytes?: {
    road: "session" | "island";
    preview: string | null;
    download: string | null;
  };
}
