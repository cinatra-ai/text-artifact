import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import TextArtifactDetail from "../src/renderers/detail";
import type { ArtifactRendererProps } from "../src/artifact-renderer-props";

afterEach(cleanup);

function props(overrides: {
  preview?: string | null;
  download?: string | null;
  title?: string | null;
}): ArtifactRendererProps {
  return {
    propsApiVersion: 1,
    artifact: {
      id: "art_1",
      title: overrides.title === undefined ? "notes.txt" : overrides.title,
      objectType: "@cinatra-ai/text-artifact:artifact",
      mime: "text/plain",
      size: 2048,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      ownerLevel: "workspace",
      visibility: "workspace",
      sourceUrl: null,
    },
    representation: { revisionId: "rev_1", mime: "text/plain" },
    urls: {
      preview: overrides.preview === undefined ? "/api/artifacts/art_1/preview" : overrides.preview,
      download: overrides.download === undefined ? "/api/artifacts/art_1/download" : overrides.download,
    },
    identity: { kind: "mime", extension: null, basis: null, selectable: false },
    actions: {
      download: overrides.download === undefined ? "/api/artifacts/art_1/download" : overrides.download,
      openInSource: null,
    },
  };
}

describe("TextArtifactDetail — the inline text preview", () => {
  it("renders a sandboxed <iframe> pointed at the host preview URL", () => {
    const { container } = render(<TextArtifactDetail {...props({ preview: "/preview/notes.txt" })} />);
    const frame = container.querySelector("iframe");
    expect(frame).not.toBeNull();
    expect(frame?.getAttribute("src")).toBe("/preview/notes.txt");
  });

  it("fully sandboxes the preview frame (no allow-scripts, no allow-same-origin)", () => {
    const { container } = render(<TextArtifactDetail {...props({})} />);
    const frame = container.querySelector("iframe");
    expect(frame?.hasAttribute("sandbox")).toBe(true);
    expect(frame?.getAttribute("sandbox")).toBe("");
  });

  it("wraps the frame in the host soft-panel card", () => {
    const { container } = render(<TextArtifactDetail {...props({})} />);
    const panel = container.querySelector('[data-text-artifact="preview"]');
    expect(panel?.tagName.toLowerCase()).toBe("article");
    expect(panel?.getAttribute("class")).toContain("soft-panel rounded-card");
  });

  it("labels the frame with the artifact title when present", () => {
    const { container } = render(<TextArtifactDetail {...props({ title: "README" })} />);
    expect(container.querySelector("iframe")?.getAttribute("title")).toBe("Text preview: README");
  });

  it("falls back to a generic label when the title is absent", () => {
    const { container } = render(<TextArtifactDetail {...props({ title: null })} />);
    expect(container.querySelector("iframe")?.getAttribute("title")).toBe("Text preview");
  });

  it("NEVER-BLANK: a null preview URL degrades to a notice + download link", () => {
    const { container } = render(
      <TextArtifactDetail {...props({ preview: null, download: "/dl/notes.txt" })} />,
    );
    expect(container.querySelector("iframe")).toBeNull();
    const floor = container.querySelector('[data-text-artifact="floor"]');
    expect(floor).not.toBeNull();
    expect(floor?.textContent).toContain("Text preview is not available");
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/dl/notes.txt");
    expect((container.textContent ?? "").trim().length).toBeGreaterThan(0);
  });

  it("NEVER-BLANK: null preview AND null download still renders the notice", () => {
    const { container } = render(
      <TextArtifactDetail {...props({ preview: null, download: null })} />,
    );
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector('[data-text-artifact="floor"]')).not.toBeNull();
    expect((container.textContent ?? "").trim().length).toBeGreaterThan(0);
  });

  it("tolerates a malformed snapshot missing urls/actions (never throws, never blank)", () => {
    const malformed = {
      propsApiVersion: 1,
      artifact: { title: null },
    } as unknown as ArtifactRendererProps;
    const { container } = render(<TextArtifactDetail {...malformed} />);
    expect(container.querySelector('[data-text-artifact="floor"]')).not.toBeNull();
    expect((container.textContent ?? "").trim().length).toBeGreaterThan(0);
  });
});
