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

const client = new ES.Client(esConfig);

export const searchServiceImpl = async (searchOptions) => {
  const esFilters = agnosticFiltersToESFilters(searchOptions.filters);
  const esSort = agnosticSortByToESSort(searchOptions.sortBy);

  const esRequest = {
    index: "products",
    type: "washers",
    body: {
      query: {
        match_all: {},
      },
      _source: [
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
      ],
    },
  };

  if (searchOptions.pageSize && searchOptions.currentPage) {
    esRequest.body.size = searchOptions.pageSize;
    esRequest.body.from = searchOptions.pageSize * (searchOptions.currentPage - 1);
  }

  if (esSort) {
    esRequest.body.sort = esSort;
  }

  if (searchOptions.searchText) {
    esRequest.body.query = {
      query_string: {
        query: searchOptions.searchText,
      },
    };
  }

  if (esFilters.length) {
    esRequest.body.query = {
      bool: {
        filter: esFilters,
      },
    };
  }

  try {
    const esResponse = await client.search(addAggregationsToRequest(esRequest, esFilters));
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
