# Text

The system text handler for the Cinatra artifact library. It recognizes uploaded plain-text documents — `text/plain` and `text/csv` — and files them in the library under a dedicated text type, so a note or a CSV you attach in chat or upload to `/artifacts` lands correctly typed instead of being refused. Markdown is not part of this type: Markdown has a base extension of its own, and in any Cinatra version that ships both, `text/markdown` uploads land in that dedicated Markdown type instead of here.

Install from the Cinatra marketplace by searching for "Text" and clicking **Add**. No credentials or configuration are required; the type is active immediately for all workspace members. Opening a text document previews it inline in a fully-sandboxed frame, so the content is visible directly in the artifact detail view. If a document has no available preview yet, the view shows a short notice and, where possible, a download link, so the detail view is never blank.

## Works with

- Cinatra chat — attach a text or CSV file directly in any thread
- The artifact library — open any text item to read it inline

## Capabilities

- Accept `text/plain` and `text/csv` uploads as a dedicated artifact type
- Preview the document inline in a fully-sandboxed frame
- Download the original file
- Degrade to a clear notice when a preview is unavailable, never a blank view
