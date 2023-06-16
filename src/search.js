import { searchServiceImpl } from "./elasticsearch/searchServiceImpl";
import * as C from "./constants";
import * as U from "./utils";
import packageJson from "../package.json";

export async function handler(event) {
  return U.wrapHandlerImplementation("/api/search", async () => {
    console.info("version:", packageJson.version);

    const buffer = Buffer.from(event.body);
    const text = buffer.toString();
    const body = JSON.parse(text);
    console.info("body:", body);
    
    const searchOptions = {
      pageSize: body.pageSize ?? 10,
      currentPage: body.currentPage ?? 1,
      sortBy: body.sortBy ?? C.SORT_BY_PRICE_LOW_TO_HIGH,
      searchText: body.searchText ?? "",
      filters: body.filters ?? [],
    }
    console.info("searchOptions:", searchOptions);

    return searchServiceImpl(searchOptions)
  });
};
