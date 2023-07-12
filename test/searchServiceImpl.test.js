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
        { name: "brand", keys: ["Beko", "Hotpoint"] },
        { name: "colour", keys: ["Black"] },
        { name: "price", keys: ["250-300"] },
      ],
    };
    const result = await searchServiceImpl(searchOptions);
    expect(result).toBeDefined();
    console.log("searchServiceImpl result:", JSON.stringify(result, null, 2));
  });
});
