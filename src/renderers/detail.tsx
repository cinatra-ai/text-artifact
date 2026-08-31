// Text detail renderer (slot `detail`).
//
// It draws the plain-text document the host projected onto these props, read
// from the pinned revision on the server and capped there. It is READ-ONLY: the
// content as it was stored at that revision, with a download affordance beside
// it when there is an address for one.
//
// WHAT CHANGED AND WHY. This display used to hand the browser a host-authorized
// address and let it load the document in a fully-sandboxed subframe. A
// subresource load from inside somebody else's website carries no cookie, so the
// address answered nothing and the reader met an empty plate — the exact failure
// the content channel exists to end. The text now arrives ON THE PROPS and this
// display performs no load of any kind, on any road, so the same document is
// drawn on every host.
//
// NEVER BLANK, NEVER THROWN: content it cannot draw becomes a NAMED floor, and
// the floor keeps the download affordance when there is an address for one.

import type { ReactElement } from "react";

import {
  ARTIFACT_RENDERER_PROPS_API_VERSION,
  type ArtifactRendererProps,
} from "../artifact-renderer-props";
import { byteDownloadHref, contentFloorMessage, resolveArtifactTextView } from "../content-view";

export default function TextArtifactDetail(props: ArtifactRendererProps): ReactElement {
  const view = resolveArtifactTextView(props);
  const downloadHref = byteDownloadHref(props);
  const download = downloadHref ? (
    <a href={downloadHref} className="text-sm underline" download>
      Download the text file
    </a>
  ) : null;

  if (view.kind === "floor") {
    return (
      <article
        className="soft-panel rounded-card overflow-hidden p-6"
        data-text-artifact="floor"
        data-text-floor={view.reason}
        data-props-api-version={ARTIFACT_RENDERER_PROPS_API_VERSION}
      >
        <p className="text-sm text-muted-foreground">{contentFloorMessage(view.reason)}</p>
        {download}
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
          {`Showing the first ${view.projectedByteLength.toLocaleString("en-US")} of ${view.byteLength.toLocaleString("en-US")} bytes. Download it to read the whole of it.`}
        </p>
      ) : null}
      {download}
    </article>
  );
}
