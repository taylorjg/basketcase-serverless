import { FACET_DEFINITIONS, FACET_IDS_TO_FIELD_NAMES } from "./facetDefinitions";
import * as C from "../constants";

const outTermFilterFor = field => f => {
  if (f.terms && f.terms[field]) return false
  return true
}

const outRangeFilterFor = field => f => {
  if (f.range && f.range[field]) return false
  return true
}

const addTermAggregation = (aggs, activeFilters, name, field) => {
  const otherActiveFilters = activeFilters.filter(outTermFilterFor(field))
  aggs[name] = {
    filter: {
      bool: {
        filter: otherActiveFilters
      }
    },
    aggs: {
      [name]: {
        terms: {
          field
        }
      }
    }
  }
}

const addRangeAggregation = (aggs, activeFilters, name, field, ranges) => {
  const otherActiveFilters = activeFilters.filter(outRangeFilterFor(field))
  aggs[name] = {
    filter: {
      bool: {
        filter: otherActiveFilters
      }
    },
    aggs: {
      [name]: {
        range: {
          field,
          ranges
        }
      }
    }
  }
}

export const addAggregationsToRequest = (request, filters) => {
  filters = filters || []
  request.body.aggs = {
    global: {
      global: {},
      aggs: {}
    }
  }
  const aggs = request.body.aggs.global.aggs
  FACET_DEFINITIONS.forEach(fd => {
    if (fd.isRange) {
      addRangeAggregation(aggs, filters, fd.aggregationName, fd.fieldName, fd.ranges)
    } else {
      addTermAggregation(aggs, filters, fd.aggregationName, fd.fieldName)
    }
  })
  return request
}

const myFilterToTermsFilter = filter => {
  const fieldName = FACET_IDS_TO_FIELD_NAMES[filter.facetId]
  return {
    terms: {
      [fieldName]: filter.keys
    }
  }
}

const myFilterToRangeFilter = filter => {
  const fieldName = FACET_IDS_TO_FIELD_NAMES[filter.facetId]
  const f = {
    range: {
      [fieldName]: {}
    }
  }
  if (filter.from) {
    f.range[fieldName].gte = filter.from
  }
  if (filter.to) {
    f.range[fieldName].lt = filter.to
  }
  return f
}

const myFilterToElasticsearchFilter = filter => {
  switch (filter.type) {
    case 'terms': return myFilterToTermsFilter(filter)
    case 'range': return myFilterToRangeFilter(filter)
    default: return null
  }
}

export const myFiltersToElasticsearchFilters = filters =>
  filters
    .map(myFilterToElasticsearchFilter)
    .filter(f => f)

export const mySortByToElasticsearchSort = sortBy => {
  switch (sortBy) {
    case C.SORT_BY_PRICE_LOW_TO_HIGH: return { 'Price': { order: 'asc' } }
    case C.SORT_BY_PRICE_HIGH_TO_LOW: return { 'Price': { order: 'desc' } }
    case C.SORT_BY_AVERAGE_RATING: return { 'RatingValue': { order: 'desc' } }
    case C.SORT_BY_REVIEW_COUNT: return { 'ReviewCount': { order: 'desc' } }
    default: mySortByToElasticsearchSort(C.SORT_BY_PRICE_LOW_TO_HIGH)
  }
}
