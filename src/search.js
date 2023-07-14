import { searchServiceImpl } from "./searchServiceImpl";
import { wrapHandlerImplementation } from "./serverlessUtils";
import { facetDescriptions } from "./facetDefinitions";
import * as C from "./constants";

const makeSearchOptions = (eventBody) => {
  if (!eventBody) return C.DEFAULT_SEARCH_OPTIONS;

  const buffer = Buffer.from(eventBody);
  const text = buffer.toString();
  const requestBody = JSON.parse(text);
  console.info("requestBody:", requestBody);

  const newStyleFilters = [];

  for (const { name } of facetDescriptions) {
    if (requestBody[name]) {
      const keys = requestBody[name];
      if (Array.isArray(keys)) {
        newStyleFilters.push({ name, keys });
      } else {
        newStyleFilters.push({ name, keys: [keys] });
      }
    }
  }

  const searchOptions = {
    pageSize: requestBody.pageSize ?? C.DEFAULT_PAGE_SIZE,
    currentPage: requestBody.currentPage ?? C.DEFAULT_CURRENT_PAGE,
    sortBy: requestBody.sortBy ?? C.DEFAULT_SORT_BY,
    searchText: requestBody.searchText ?? C.DEFAULT_SEARCH_TEXT,
    filters:
      newStyleFilters.length > 0 ? newStyleFilters : requestBody.filters ?? C.DEFAULT_FILTERS,
  };

  return searchOptions;
};

export async function handler(event) {
  return wrapHandlerImplementation("/api/search", async () => {
    const searchOptions = makeSearchOptions(event.body);
    console.info("searchOptions:", searchOptions);
    return searchServiceImpl(searchOptions);
  });
}
