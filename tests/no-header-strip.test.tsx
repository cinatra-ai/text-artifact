/**
 * A KIND WITH NO HEADER STRIP DRAWS NONE (the review drawing §V.2, §XI).
 *
 * VERBATIM (§V.2): "It has no tabs and nothing else to put in a header, so it
 * carries NO HEADER STRIP AT ALL". A display that divides one artifact into
 * readings gets the design system's tabs (§XI); a display with one reading gets
 * a panel and the work in it, and nothing above the work.
 *
 * AND THE PAGE ALREADY NAMES THE FILE. The artifact page draws the display title
 * over the mono meta line; a strip inside the panel repeating the same name, with
 * a download control of its own beside it, is a second header the drawing does
 * not draw — a proof round measured it, and counted the control as one download
 * too many on a surface the drawing gives none.
 *
 * THE TRUNCATION READING STAYS, because it is a reading the display HAS: where
 * content is capped, "the display draws the named gap in the missing thing's
 * place". What leaves it is the instruction to go and download the rest, which
 * points at a control this panel no longer carries.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";

import Detail from "../src/renderers/detail";
import { props, textContent, noContent } from "./props-fixture";

afterEach(cleanup);

const FILE_NAME = "notes.txt";
const SAMPLE = "The standup notes for Tuesday.";
const MARKER = "standup notes";


describe("the panel carries no header strip and no download of its own", () => {
  it("draws no download control anywhere in the panel", () => {
    const { container } = render(<Detail {...props(textContent(SAMPLE))} />);
    expect(container.querySelector("a[download]")).toBeNull();
    expect(container.querySelectorAll("a").length).toBe(0);
  });

  it("draws no download control on the floor either", () => {
    const { container } = render(<Detail {...props(noContent("absent"))} />);
    expect(container.querySelector("a[download]")).toBeNull();
  });

  it("repeats no file name above the work — the page's own header names it", () => {
    const { container } = render(<Detail {...props(textContent(SAMPLE))} />);
    expect(container.textContent ?? "").not.toContain(FILE_NAME);
  });

  it("names the capped gap without pointing at a control it does not carry", () => {
    const text = SAMPLE;
    const { container } = render(
      <Detail
        {...props(
          textContent(text, { truncated: true, byteLength: 4096, projectedByteLength: text.length }),
        )}
      />,
    );
    const drawn = container.textContent ?? "";
    expect(drawn).toMatch(/Showing the first/);
    expect(drawn).not.toMatch(/Download it to read/);
  });

  it("still draws the work itself", () => {
    const { container } = render(<Detail {...props(textContent(SAMPLE))} />);
    expect(container.textContent ?? "").toContain(MARKER);
  });
});
