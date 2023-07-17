import "dotenv/config";

import { searchServiceImpl } from "../src/searchServiceImpl";

import { findFacet, findFacetValue } from "./testHelpers";

describe("searchServiceImpl tests", () => {
  it("with some selected facets", async () => {
    const searchOptions = {
      pageSize: 10,
      currentPage: 1,
      sortBy: "price-low-to-high",
      searchText: "",
      filters: [
        { name: "brand", keys: ["samsung"] },
        { name: "colour", keys: ["silver", "stainless-steel"] },
      ],
    };
    const result = await searchServiceImpl(searchOptions);
    expect(result).toBeDefined();

    console.log("searchServiceImpl result:", JSON.stringify(result, null, 2));

    const { facets } = result;
    expect(facets).toHaveLength(4);

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
