import "dotenv/config";

import { findFacet, findFacetValue, invokeSearchHandler } from "./testHelpers";

describe("search tests", () => {
  it("vanilla", async () => {
    const { results, facets } = await invokeSearchHandler();

    expect(results.total).toBe(60);
    expect(results.products).toHaveLength(10);

    expect(facets).toHaveLength(5);

    const fitTypeFacet = findFacet(facets, "Fit Type");
    expect(fitTypeFacet).toBeDefined();

    const freeStandingFacetValue = findFacetValue(fitTypeFacet, "Free Standing");
    expect(freeStandingFacetValue).toBeDefined();
    expect(freeStandingFacetValue.count).toBe(48);

    const builtInFacetValue = findFacetValue(fitTypeFacet, "Built In");
    expect(builtInFacetValue).toBeDefined();
    expect(builtInFacetValue.count).toBe(12);
  });

  it("with search text", async () => {
    const { results, facets } = await invokeSearchHandler({ searchText: "candy" });

    expect(results.total).toBe(4);
    expect(results.products).toHaveLength(4);

    expect(facets).toHaveLength(5);

    const fitTypeFacet = findFacet(facets, "Fit Type");
    expect(fitTypeFacet).toBeDefined();

    const freeStandingFacetValue = findFacetValue(fitTypeFacet, "Free Standing");
    expect(freeStandingFacetValue).toBeDefined();
    expect(freeStandingFacetValue.count).toBe(3);

    const builtInFacetValue = findFacetValue(fitTypeFacet, "Built In");
    expect(builtInFacetValue).toBeDefined();
    expect(builtInFacetValue.count).toBe(1);
  });
});
