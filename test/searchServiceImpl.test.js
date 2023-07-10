import "dotenv/config";
import { searchServiceImpl } from "../src/elasticsearch/searchServiceImpl";

describe("searchServiceImpl tests", () => {
  it("with some selected facets", async () => {
    const searchOptions = {
      pageSize: 10,
      currentPage: 1,
      sortBy: 0,
      searchText: "",
      filters: [
        { type: "terms", facetId: 2, keys: ["Beko", "Hotpoint"] },
        { type: "terms", facetId: 3, keys: ["Black"] },
        { type: "range", facetId: 4, keys: ["250-300"], from: 250, to: 300 },
      ],
    };
    const result = await searchServiceImpl(searchOptions);
    expect(result).toBeDefined();
    console.log("searchServiceImpl result:", JSON.stringify(result, null, 2));
  });
});
