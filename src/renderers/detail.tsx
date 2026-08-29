// Text detail renderer (slot `detail`).
//
// Previews a plain-text document (text/plain, text/csv) inline
// via a FULLY-SANDBOXED `<iframe>` pointed at the host-authorized preview URL.
// The browser renders the text natively; the sandbox (`sandbox=""` — no
// allow-scripts, no allow-same-origin) is defense-in-depth: even if the preview
// route were to mis-serve the bytes as HTML, no script and no same-origin access
// can execute. This is the direct sibling of the audio/video native-element
// renderers — a passive host-authorized URL handed to the browser, no client JS
// beyond React, no content fetch/parse in the renderer.
//
// v1 renderer: requests NO host ports; renders ONLY from the host-supplied
// authorized snapshot (`ArtifactRendererProps`) — `urls.preview` is already
// actor-scoped + access-checked by the host.
//
// NEVER-BLANK: a missing preview URL degrades to an inline notice plus a
// download affordance when one exists — the renderer always emits a panel.

import type { ReactElement } from "react";

import type { ArtifactRendererProps } from "../artifact-renderer-props";

export default function TextArtifactDetail(props: ArtifactRendererProps): ReactElement {
  const previewHref = props.urls?.preview ?? null;
  const downloadHref = props.actions?.download ?? props.urls?.download ?? null;
  const title = props.artifact?.title ?? null;
  const label = title ? `Text preview: ${title}` : "Text preview";

  if (!previewHref) {
    return (
      <article
        className="soft-panel rounded-card overflow-hidden p-6"
        data-text-artifact="floor"
      >
        <p className="text-sm text-muted-foreground">
          Text preview is not available for this artifact.
        </p>
        {downloadHref ? (
          <a href={downloadHref} className="text-sm underline" download>
            Download the text file
          </a>
        ) : null}
      </article>
    );
  }

  return (
    <article
      className="soft-panel rounded-card overflow-hidden p-6"
      data-text-artifact="preview"
    >
      <iframe
        src={previewHref}
        title={label}
        sandbox=""
        className="block h-[75vh] w-full rounded-card border-0 bg-background"
      />
    </article>
  );
}
