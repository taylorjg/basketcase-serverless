import * as ES from "elasticsearch";

import { esResponseToAgnosticResponse } from "./es2agnostic";
import { facetDescriptions, altKeyToKey } from "./facetDefinitions";
import * as C from "./constants";

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

const makeFacetFilterKvp = (selectedFacets) => (facetDescription) => {
  const name = facetDescription.name;
  const selectedFacet = selectedFacets.find((selectedFacet) => selectedFacet.name === name);
  const selectedFacetValues = selectedFacet?.selectedFacetValues ?? [];
  const filter = selectedFacetValues.length
    ? facetDescription.makeFilter(selectedFacetValues)
    : undefined;
  return [name, filter];
};

// Make a dictionary where the keys are facet names (e.g. "fitTypeFacet")
// and the values are Elasticsearch filter expression objects representing
// all the currently selected values for that facet. If a particular
// facet does not have any currently selected values, there won't be an
// entry for that facet in the dictionary.
const makeFacetFiltersDictionary = (facetDescriptions, selectedFacets) => {
  const facetFiltersKvps = facetDescriptions
    .map(makeFacetFilterKvp(selectedFacets))
    .filter(([, filter]) => Boolean(filter));
  return Object.fromEntries(facetFiltersKvps);
};

const makeNestedAggregation = (facetFiltersDictionary) => (facetDescription) => {
  const name = facetDescription.name;

  const filtersForOtherFacetsKvps = Object.entries(facetFiltersDictionary)
    .filter(([key]) => key !== name)
    .map(([, value]) => value);

  const filter = {
    bool: {
      filter: filtersForOtherFacetsKvps,
    },
  };

  const aggregation = {
    filter,
    aggregations: {
      [name]: facetDescription.definition,
    },
  };

  return [name, aggregation];
};

const makeAggregations = (queryFilters, facetDescriptions, facetFiltersDictionary) => {
  const nestedAggregationsKvps = facetDescriptions.map(
    makeNestedAggregation(facetFiltersDictionary)
  );
  const nestedAggregations = Object.fromEntries(nestedAggregationsKvps);

  return {
    all_documents: {
      global: {},
      aggregations: {
        common_filters: {
          filter: {
            bool: {
              filter: queryFilters,
            },
          },
          aggregations: nestedAggregations,
        },
      },
    },
  };
};

const toSelectedFacets = (searchOptionsFilters) =>
  searchOptionsFilters.map((searchOptionsFilter) => ({
    name: searchOptionsFilter.name,
    selectedFacetValues: searchOptionsFilter.keys.map(altKeyToKey),
  }));

const mapSortBy = (sortBy) => {
  switch (sortBy) {
    case C.SORT_BY_PRICE_LOW_TO_HIGH:
      return { Price: { order: "asc" } };
    case C.SORT_BY_PRICE_HIGH_TO_LOW:
      return { Price: { order: "desc" } };
    case C.SORT_BY_AVERAGE_RATING:
      return { RatingValue: { order: "desc" } };
    case C.SORT_BY_REVIEW_COUNT:
      return { ReviewCount: { order: "desc" } };
    default:
      mapSortBy(C.DEFAULT_SORT_BY);
  }
};

export const searchServiceImpl = async (searchOptions) => {
  const queryFilters = [];

  if (searchOptions.searchText) {
    queryFilters.push({
      query_string: {
        query: searchOptions.searchText,
      },
    });
  }

  const selectedFacets = toSelectedFacets(searchOptions.filters);
  const facetFiltersDictionary = makeFacetFiltersDictionary(facetDescriptions, selectedFacets);
  const aggregations = makeAggregations(queryFilters, facetDescriptions, facetFiltersDictionary);
  const facetFilters = Object.values(facetFiltersDictionary);

  const query = {
    bool: {
      filter: [...queryFilters, ...facetFilters],
    },
  };

  const esRequest = {
    index: INDEX_NAME,
    type: TYPE_NAME,
    body: {
      query,
      size: searchOptions.pageSize,
      from: searchOptions.pageSize * (searchOptions.currentPage - 1),
      sort: mapSortBy(searchOptions.sortBy),
      _source: FIELDS_TO_RETURN,
      aggregations,
    },
  };

  if (facetFilters.length || queryFilters.length) {
    esRequest.body.query = {
      bool: {
        filter: [...queryFilters, ...facetFilters],
      },
    };
  }

  try {
    console.info("esRequest:", JSON.stringify(esRequest, null, 2));
    const esResponse = await esClient.search(esRequest);
    console.info("esResponse:", JSON.stringify(esResponse, null, 2));
    return esResponseToAgnosticResponse(esResponse, selectedFacets);
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
