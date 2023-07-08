import * as ES from "elasticsearch";
import { esResponseToAgnosticResponse } from "./es2agnostic";
import {
  addAggregationsToRequest,
  agnosticFiltersToESFilters,
  agnosticSortByToESSort,
} from "./agnostic2es";

const esConfig = {
  host: process.env.BONSAI_URL ?? "localhost:9200",
};

const esClient = new ES.Client(esConfig);

const INDEX_NAME = "products";

const TYPE_NAME = "washers";

const FIELDS_TO_RETURN = [
  "Code",
  "FitTypeName",
  "Brand",
  "Colour",
  "Price",
  "FullTitle",
  "EnergyRating",
  "Image",
  "ReviewCount",
  "RatingValue",
];

export const searchServiceImpl = async (searchOptions) => {
  const searchOptionsFilters = [];

  if (searchOptions.searchText) {
    searchOptionsFilters.push({
      query_string: {
        query: searchOptions.searchText,
      },
    });
  }

  const facetFilters = agnosticFiltersToESFilters(searchOptions.filters);
  const esSort = agnosticSortByToESSort(searchOptions.sortBy);

  const esRequest = {
    index: INDEX_NAME,
    type: TYPE_NAME,
    body: {
      query: {
        match_all: {},
      },
      _source: FIELDS_TO_RETURN,
    },
  };

  if (searchOptions.pageSize && searchOptions.currentPage) {
    esRequest.body.size = searchOptions.pageSize;
    esRequest.body.from = searchOptions.pageSize * (searchOptions.currentPage - 1);
  }

  esRequest.body.sort = esSort;

  if (facetFilters.length || searchOptionsFilters.length) {
    esRequest.body.query = {
      bool: {
        filter: [...searchOptionsFilters, ...facetFilters],
      },
    };
  }

  addAggregationsToRequest(esRequest, facetFilters, searchOptionsFilters);

  try {
    console.info("esRequest:", JSON.stringify(esRequest, null, 2));
    const esResponse = await esClient.search(esRequest);
    console.info("esResponse:", JSON.stringify(esResponse, null, 2));
    return esResponseToAgnosticResponse(esResponse, searchOptions.filters);
  } catch (error) {
    if (error.displayName && error.statusCode) {
      console.error(
        `[searchServiceImpl]: ${error.displayName} (${error.statusCode}) ${error.message}`
      );
    } else {
      console.error(`[searchServiceImpl]: ${error.message}`);
    }
    return error;
  }
};
