import * as ES from "elasticsearch";
import { esResponseToAgnosticResponse } from "./es2agnostic";
import {
  addAggregationsToRequest,
  agnosticFiltersToESFilters,
  agnosticSortByToESSort,
} from "./agnostic2es";
import { facetDescriptions } from "./facetDefinitions";

const makeFacetFilterDictionaryEntry = (selectedFacets) => (facetDescription) => {
  const name = facetDescription.name;
  const selectedFacet = selectedFacets.find((selectedFacet) => selectedFacet.name === name);
  const options = selectedFacet?.options ?? [];
  const filter = options.length ? facetDescription.makeFilter(options) : undefined;
  return [name, filter];
};

// Make a dictionary where the keys are facet names (e.g. "fitTypeFacet")
// and the values are Elasticsearch filter expression objects representing
// all the currently selected options for that facet. If a particular
// facet does not have any currently selected options, there won't be an
// entry for that facet in the dictionary.
const makeFacetFiltersDictionary = (facetDescriptions, selectedFacets) => {
  const facetFilterDictionaryEntries = facetDescriptions
    .map(makeFacetFilterDictionaryEntry(selectedFacets))
    .filter(([, filter]) => Boolean(filter));
  return Object.fromEntries(facetFilterDictionaryEntries);
};

const makeSubAggregation = (facetFiltersDictionary) => (facetDescription) => {
  const name = facetDescription.name;

  const filtersForOtherFacetSelections = Object.entries(facetFiltersDictionary)
    .filter(([key]) => key !== name)
    .map(([, value]) => value);

  const filter = filtersForOtherFacetSelections.length
    ? { bool: { filter: filtersForOtherFacetSelections } }
    : { match_all: {} }; // placeholder match_all filter to maintain consistent query structure

  const aggregation = {
    filter,
    aggregations: {
      [name]: facetDescription.definition,
    },
  };

  return [name, aggregation];
};

const makeGlobalAggregation = (queryFilters, facetDescriptions, facetFiltersDictionary) => {
  const aggregationsEntries = facetDescriptions.map(makeSubAggregation(facetFiltersDictionary));
  const aggregations = Object.fromEntries(aggregationsEntries);

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
          aggregations,
        },
      },
    },
  };
};

const toSelectedFacets = (searchOptionsFilters) => {
  const options = [];
  for (const searchOptionsFilter of searchOptionsFilters) {
    const facetDescription = facetDescriptions.find(
      ({ facetId }) => facetId === searchOptionsFilter.facetId
    );
    if (facetDescription) {
      options.push({
        name: facetDescription.name,
        options: searchOptionsFilter.keys,
      });
    }
  }
  return options;
};

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
  const queryFilters = [];

  if (searchOptions.searchText) {
    queryFilters.push({
      query_string: {
        query: searchOptions.searchText,
      },
    });
  }

  // const selectedFacets = toSelectedFacets(searchOptions.filters);
  // console.log("selectedFacets:", JSON.stringify(selectedFacets, null, 2));

  // const facetFiltersDictionary = makeFacetFiltersDictionary(facetDescriptions, selectedFacets);
  // console.log("facetFiltersDictionary:", JSON.stringify(facetFiltersDictionary, null, 2));

  // const globalAggregations = makeGlobalAggregation(
  //   queryFilters,
  //   facetDescriptions,
  //   facetFiltersDictionary
  // );
  // console.log("globalAggregation:", JSON.stringify(globalAggregations, null, 2));

  const facetFilters = agnosticFiltersToESFilters(searchOptions.filters);
  // const facetFilters = Object.values(facetFiltersDictionary);
  const esSort = agnosticSortByToESSort(searchOptions.sortBy);

  const esRequest = {
    index: INDEX_NAME,
    type: TYPE_NAME,
    body: {
      query: {
        match_all: {},
      },
      _source: FIELDS_TO_RETURN,
      // aggregations: globalAggregations,
    },
  };

  if (searchOptions.pageSize && searchOptions.currentPage) {
    esRequest.body.size = searchOptions.pageSize;
    esRequest.body.from = searchOptions.pageSize * (searchOptions.currentPage - 1);
  }

  esRequest.body.sort = esSort;

  if (facetFilters.length || queryFilters.length) {
    esRequest.body.query = {
      bool: {
        filter: [...queryFilters, ...facetFilters],
      },
    };
  }

  addAggregationsToRequest(esRequest, facetFilters, queryFilters);

  try {
    console.info("esRequest:", JSON.stringify(esRequest, null, 2));
    const esResponse = await esClient.search(esRequest);
    console.info("esResponse:", JSON.stringify(esResponse, null, 2));
    // TODO: decide what to do re "selected"
    // Should we maintain this client side ?
    // Or should the search service impl figure it out when building the response ?
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
