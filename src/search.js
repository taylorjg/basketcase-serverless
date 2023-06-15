import * as C from "./constants";
import * as U from "./utils";
import { searchServiceImpl } from "./elasticsearch/searchServiceImpl";

export async function handler(event) {
  return U.wrapHandlerImplementation("/api/search", async () => {
    const body = JSON.parse(Buffer.from(event.body, "base64").toString());
    const searchOptions = {
      pageSize: body.pageSize ?? 10,
      currentPage: body.currentPage ?? 1,
      sortBy: body.sortBy ?? C.SORT_BY_PRICE_LOW_TO_HIGH,
      searchText: body.searchText ?? "",
      filters: body.filters ?? [],
    }
    const myResponse = await searchServiceImpl(searchOptions)
    return myResponse;
  });
};
