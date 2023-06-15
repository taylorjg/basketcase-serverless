import * as ES from "elasticsearch";
import * as ES2MY from "./es2my";
import * as MY2ES from "./my2es";

const esConfig = () => {
  const BONSAI_URL = process.env.BONSAI_URL
  return {
    host: BONSAI_URL || 'localhost:9200'
  }
}

const client = new ES.Client(esConfig())

export const searchServiceImpl = async searchOptions => {

  const esFilters = MY2ES.myFiltersToElasticsearchFilters(searchOptions.filters)
  const esSort = MY2ES.mySortByToElasticsearchSort(searchOptions.sortBy)

  const esRequest = {
    index: 'products',
    type: 'washers',
    body: {
      query: {
        match_all: {}
      },
      _source: [
        'Code',
        'FitTypeName',
        'Brand',
        'Colour',
        'Price',
        'FullTitle',
        'EnergyRating',
        'Image',
        'ReviewCount',
        'RatingValue'
      ]
    }
  }

  if (searchOptions.pageSize && searchOptions.currentPage) {
    esRequest.body.size = searchOptions.pageSize
    esRequest.body.from = searchOptions.pageSize * (searchOptions.currentPage - 1)
  }

  if (esSort) {
    esRequest.body.sort = esSort
  }

  if (searchOptions.searchText) {
    esRequest.body.query = {
      query_string: {
        query: searchOptions.searchText
      }
    }
  }

  if (esFilters.length) {
    esRequest.body.query = {
      bool: {
        filter: esFilters
      }
    }
  }

  try {
    const esResponse = await client.search(MY2ES.addAggregationsToRequest(esRequest, esFilters))
    return ES2MY.elasticsearchResponseToMyResponse(esResponse, searchOptions.filters)
  } catch (error) {
    if (error.displayName && error.statusCode) {
      console.error(`[elasticsearch.searchServiceImpl#search]: ${error.displayName} (${error.statusCode}) ${error.message}`)
    } else {
      console.error(`[elasticsearch.searchServiceImpl#search]: ${error.message}`)
    }
    return error
  }
}