// Text detail renderer (slot `detail`).
//
// It draws the plain-text document the host projected onto these props, read
// from the pinned revision on the server and capped there. It is READ-ONLY: the
// content as it was stored at that revision.
//
// WHAT CHANGED AND WHY. This display used to hand the browser a host-authorized
// address and let it load the document in a fully-sandboxed subframe. A
// subresource load from inside somebody else's website carries no cookie, so the
// address answered nothing and the reader met an empty plate — the exact failure
// the content channel exists to end. The text now arrives ON THE PROPS and this
// display performs no load of any kind, on any road, so the same document is
// drawn on every host.
//
// NEVER BLANK, NEVER THROWN: content it cannot draw becomes a NAMED floor.//
// NO HEADER STRIP, AND NO DOWNLOAD INSIDE THE PANEL (the review drawing §V.2,
// §XI). "It has no tabs and nothing else to put in a header, so it carries no
// header strip at all." A proof round graded the download control this panel
// appended as a control on a surface the drawing gives none: the page's own
// header names the file, and the panel is the work and nothing else.

import type { ReactElement } from "react";

import {
  ARTIFACT_RENDERER_PROPS_API_VERSION,
  type ArtifactRendererProps,
} from "../artifact-renderer-props";
import { contentFloorMessage, resolveArtifactTextView } from "../content-view";

export default function TextArtifactDetail(props: ArtifactRendererProps): ReactElement {
  const view = resolveArtifactTextView(props);
  if (view.kind === "floor") {
    return (
      <article
        className="soft-panel rounded-card overflow-hidden p-6"
        data-text-artifact="floor"
        data-text-floor={view.reason}
        data-props-api-version={ARTIFACT_RENDERER_PROPS_API_VERSION}
      >
        <p className="text-sm text-muted-foreground">{contentFloorMessage(view.reason)}</p>
      </article>
    );
  }

  return (
    <article
      className="soft-panel rounded-card overflow-hidden p-6"
      data-text-artifact="content"
      data-revision={view.revisionId}
      data-props-api-version={ARTIFACT_RENDERER_PROPS_API_VERSION}
      {...(view.truncated ? { "data-truncated": "true" } : {})}
    >
      <pre
        data-text-artifact-body=""
        className="max-h-[75vh] overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed"
      >
        {view.text}
      </pre>
      {view.truncated ? (
        <p className="mt-4 text-xs text-muted-foreground" data-text-artifact-truncated="">
          {`Showing the first ${view.projectedByteLength.toLocaleString("en-US")} of ${view.byteLength.toLocaleString("en-US")} bytes.`}
        </p>
      ) : null}
    </article>
  );
}
