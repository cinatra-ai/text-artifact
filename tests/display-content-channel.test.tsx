// THE DISPLAY DRAWS FROM THE CONTENT CHANNEL — the acceptance this wave is for:
// "The json, cms-snapshot and text displays draw through the content channel on
// every host."
//
// This display used to hand the browser an address and let it load the document
// in a subframe. A subframe load carries no credential inside a third-party
// application, so the reader saw an empty plate there. The text now arrives on
// the props, and these assertions pin BOTH halves: the projected text reaches
// the DOM, and the mounted display performs no load of any kind.

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { contentFloorMessage } from "../src/content-view";
import type { ArtifactRendererProps } from "../src/artifact-renderer-props";
import TextArtifactDetail from "../src/renderers/detail";
import { islandProps, noContent, props, textContent } from "./props-fixture";

const DOCUMENT = "first line\nsecond line";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Mount with every network entry point this environment has replaced by a
 * recorder, so a display that reached for one is caught in the act. */
function mountWatched(node: Parameters<typeof render>[0]): {
  container: HTMLElement;
  calls: number;
} {
  const fetchSpy = vi.fn();
  const xhrSpy = vi.fn();
  const beaconSpy = vi.fn();
  vi.stubGlobal("fetch", fetchSpy);
  vi.stubGlobal(
    "XMLHttpRequest",
    class {
      open() {
        xhrSpy();
      }
      send() {
        xhrSpy();
      }
    },
  );
  vi.stubGlobal("navigator", { ...globalThis.navigator, sendBeacon: beaconSpy });
  const { container } = render(node);
  return {
    container,
    calls: fetchSpy.mock.calls.length + xhrSpy.mock.calls.length + beaconSpy.mock.calls.length,
  };
}

describe("the display draws the projected text", () => {
  it("puts the host-projected text in the DOM and asks the network for nothing", () => {
    const { container, calls } = mountWatched(<TextArtifactDetail {...props(textContent(DOCUMENT))} />);
    expect(calls).toBe(0);
    expect(container.querySelector("[data-text-artifact-body]")?.textContent).toBe(DOCUMENT);
  });

  it("draws the same text inside a third-party application, where a session address is unreachable", () => {
    const { container, calls } = mountWatched(
      <TextArtifactDetail {...islandProps(textContent(DOCUMENT))} />,
    );
    expect(calls).toBe(0);
    expect(container.textContent).toContain("second line");
  });

  it("loads the document in NO subframe — the road that painted an empty plate is gone", () => {
    const { container } = mountWatched(<TextArtifactDetail {...props(textContent(DOCUMENT))} />);
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[src]")).toBeNull();
  });

  it("stamps the props version it was drawn at, so a surface can read which contract it got", () => {
    const { container } = mountWatched(<TextArtifactDetail {...props(textContent(DOCUMENT))} />);
    expect(container.querySelector("[data-props-api-version]")?.getAttribute("data-props-api-version")).toBe("2");
  });

  it("offers the byte reference as the download address, which is the one an island reader can use", () => {
    const { container } = mountWatched(<TextArtifactDetail {...islandProps(textContent(DOCUMENT))} />);
    expect(container.querySelector("a")?.getAttribute("href")).toContain(
      "/api/lifecycle-views/artifact-bytes",
    );
  });

  it("says how much of a truncated document it is showing", () => {
    const { container } = mountWatched(
      <TextArtifactDetail
        {...props(textContent(DOCUMENT, { truncated: true, byteLength: 900000, projectedByteLength: 262144 }))}
      />,
    );
    const note = container.querySelector("[data-text-artifact-truncated]");
    expect(note?.textContent).toContain("262,144");
    expect(note?.textContent).toContain("900,000");
  });
});

describe("the display floors, named and never blank", () => {
  function floorOf(snapshot: unknown): HTMLElement | null {
    const { container } = mountWatched(<TextArtifactDetail {...(snapshot as ArtifactRendererProps)} />);
    return container.querySelector("[data-text-floor]");
  }

  it("floors with the named reason when the host builds an older props version", () => {
    const floor = floorOf({ ...props(textContent(DOCUMENT)), propsApiVersion: 1 });
    expect(floor?.getAttribute("data-text-floor")).toBe("props-version");
    expect(floor?.textContent).toContain(contentFloorMessage("props-version"));
  });

  it("floors with the named reason when the surface handed it no projection", () => {
    const { content: _dropped, ...rest } = props(textContent(DOCUMENT));
    expect(floorOf(rest)?.getAttribute("data-text-floor")).toBe("content-unavailable");
  });

  it("floors with the channel's own named absence", () => {
    expect(floorOf(props(noContent("absent")))?.getAttribute("data-text-floor")).toBe("content-absent");
    expect(floorOf(props(noContent("over-cap")))?.getAttribute("data-text-floor")).toBe("content-over-cap");
  });

  it("never blanks, and never throws, on a snapshot that is barely one", () => {
    const { container } = mountWatched(<TextArtifactDetail {...({ propsApiVersion: 2 } as unknown as ArtifactRendererProps)} />);
    expect((container.textContent ?? "").trim().length).toBeGreaterThan(0);
    expect(container.querySelector("[data-text-floor]")).not.toBeNull();
  });

  it("keeps a download affordance beside the floor when there is an address for one", () => {
    const { container } = mountWatched(
      <TextArtifactDetail {...props(noContent("over-cap"))} />,
    );
    expect(container.querySelector("a")?.getAttribute("href")).toBe(
      "/api/artifacts/art_1/versions/rev_1/content",
    );
  });
});

describe("the panel keeps the chrome the surface around it expects", () => {
  // THE SUBFRAME WENT, THE PANEL DID NOT. The retired suite pinned the outer
  // element and its two surface classes, and the road it also pinned — a frame,
  // its sandbox, its title — is correctly gone. The element contract is not:
  // the artifact page lays this display out as a panel, so a renderer that
  // quietly stopped being one would draw the right words in the wrong frame.
  for (const [what, snapshot] of [
    ["content", props(textContent(DOCUMENT))],
    ["floor", props(noContent("absent"))],
  ] as const) {
    it(`draws an article panel on the ${what} road`, () => {
      const { container } = mountWatched(<TextArtifactDetail {...snapshot} />);
      const root = container.firstElementChild;
      expect(root?.tagName.toLowerCase()).toBe("article");
      const className = root?.getAttribute("class") ?? "";
      expect(className).toContain("soft-panel");
      expect(className).toContain("rounded-card");
    });
  }
});
