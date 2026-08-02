import "dotenv/config";

import { findFacet, findFacetValue, invokeSearchHandler } from "./testHelpers";

describe("search handler facet filter tests", () => {
  it("with some selected facets", async () => {
    const result = await invokeSearchHandler({
      filters: [
        { name: "brand", keys: ["samsung"] },
        { name: "colour", keys: ["silver", "stainless-steel"] },
      ],
    });
    expect(result).toBeDefined();

    const { facets } = result;
    expect(facets).toHaveLength(5);

    const fitTypeFacet = findFacet(facets, "Fit Type");
    expect(fitTypeFacet).toBeDefined();

    const freeStandingFacetValue = findFacetValue(fitTypeFacet, "Free Standing");
    expect(freeStandingFacetValue).toBeDefined();
    expect(freeStandingFacetValue.count).toBe(2);
    expect(freeStandingFacetValue.selected).toBe(false);

    const colourFacet = findFacet(facets, "Colour");
    expect(colourFacet).toBeDefined();

    const whiteFacetValue = findFacetValue(colourFacet, "White");
    expect(whiteFacetValue).toBeDefined();
    expect(whiteFacetValue.count).toBe(3);
    expect(whiteFacetValue.selected).toBe(false);

    const silverValue = findFacetValue(colourFacet, "Silver");
    expect(silverValue).toBeDefined();
    expect(silverValue.count).toBe(1);
    expect(silverValue.selected).toBe(true);

    const stainlessSteelValue = findFacetValue(colourFacet, "Stainless Steel");
    expect(stainlessSteelValue).toBeDefined();
    expect(stainlessSteelValue.count).toBe(1);
    expect(stainlessSteelValue.selected).toBe(true);
  });
});
