// The row icon of a text file in the Artifacts list: the shared icon set's
// text-align-start glyph, drawn at 17 pixels inside the application's cell. The
// display reads nothing but its props, requests no host port, fetches nothing
// and draws the same icon for every object type it receives.

import { TextAlignStart } from "lucide-react";

import type { ArtifactRendererProps } from "../artifact-renderer-props";

export interface ListRowProps {
  artifact: Pick<ArtifactRendererProps["artifact"], "objectType">;
}

export default function ListRow(_props: ListRowProps) {
  return <TextAlignStart aria-hidden size={17} strokeWidth={2} data-row-glyph="text-align-start" />;
}
