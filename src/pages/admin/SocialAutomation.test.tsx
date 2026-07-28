import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SocialAutomation from "./SocialAutomation";

describe("SocialAutomation", () => {
  it("shows the supplied targets without claiming they are connected", () => {
    const markup = renderToStaticMarkup(<SocialAutomation />);

    expect(markup).toContain("Social Automation");
    expect(markup).toContain("61588024972553");
    expect(markup).toContain("@emergencytradesmen");
    expect(markup).toContain("Action required");
    expect(markup).toContain("US accounts are still required");
    expect(markup).not.toContain("Connected and ready");
  });
});
