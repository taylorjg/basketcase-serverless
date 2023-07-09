import { describe, expect, it } from "vitest";
import { searchServiceImpl } from "../src/elasticsearch/searchServiceImpl";

describe("direct search tests", () => {
  it.skip("direct", async () => {
    const searchOptions = {
      pageSize: 10,
      currentPage: 1,
      sortBy: 0,
      searchText: "hoover",
      filters: [
        { type: "terms", facetId: 2, keys: ["Beko", "Hotpoint"] },
        { type: "terms", facetId: 3, keys: ["Black"] },
        { type: "range", facetId: 4, keys: ["250-300"], from: 250, to: 300 },
      ],
    };
    const result = await searchServiceImpl(searchOptions);
    expect(result).toBeDefined();
    console.log(result);
  });
});
