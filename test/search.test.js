import "dotenv/config";
import axios from "axios";

import { findFacet, findFacetValue } from "./testHelpers";

axios.defaults.baseURL = process.env.SERVERLESS_URL;

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
