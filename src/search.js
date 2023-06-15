import * as C from "./constants";
import * as U from "./utils";
import { searchServiceImpl } from "./elasticsearch/searchServiceImpl";
import packageJson from "../package.json";

export async function handler(event) {
  return U.wrapHandlerImplementation("/api/search", async () => {
    console.warn("version:", packageJson.version);
    const buffer = Buffer.from(event.body);
    const text = buffer.toString();
    const body = JSON.parse(text);
    console.warn("body:", body);
    const searchOptions = {
      pageSize: body.pageSize ?? 10,
      currentPage: body.currentPage ?? 1,
      sortBy: body.sortBy ?? C.SORT_BY_PRICE_LOW_TO_HIGH,
      searchText: body.searchText ?? "",
      filters: body.filters ?? [],
    }
    console.warn("searchOptions:", searchOptions);
    const myResponse = await searchServiceImpl(searchOptions)
    return myResponse;
  });
};
