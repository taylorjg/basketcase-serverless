import { describe, expect, it } from "vitest";
import axios from "axios";

axios.defaults.baseURL = "https://rqnfyvya7e.execute-api.us-east-1.amazonaws.com";

const findFacet = (facets, displayName) => {
  return facets.find((facet) => facet.displayName === displayName);
};

const findFacetValue = (facet, displayName) => {
  return facet.facetValues.find((facetValue) => facetValue.displayName === displayName);
};

describe("search tests", () => {
  it("vanilla", async () => {
    const response = await axios.post("/api/search");
    const { results, facets } = response.data;

    expect(results.total.value).toBe(60);
    expect(results.products).toHaveLength(10);

    expect(facets).toHaveLength(4);
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
    const response = await axios.post("/api/search", { searchText: "candy" });
    const { results, facets } = response.data;

    expect(results.total.value).toBe(4);
    expect(results.products).toHaveLength(4);

    expect(facets).toHaveLength(4);
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
