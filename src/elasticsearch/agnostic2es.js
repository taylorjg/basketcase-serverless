import { FACET_DEFINITIONS, FACET_IDS_TO_FIELD_NAMES } from "./facetDefinitions";

const outTermFilterFor = (field) => (f) => {
  if (f.terms && f.terms[field]) return false;
  return true;
};

const outRangeFilterFor = (field) => (f) => {
  if (f.range && f.range[field]) return false;
  return true;
};

const addTermAggregation = (aggregations, activeFilters, name, field) => {
  const otherActiveFilters = activeFilters.filter(outTermFilterFor(field));
  aggregations[name] = {
    filter: {
      bool: {
        filter: otherActiveFilters,
      },
    },
    aggregations: {
      [name]: {
        terms: {
          field,
        },
      },
    },
  };
};

const addRangeAggregation = (aggregations, activeFilters, name, field, ranges) => {
  const otherActiveFilters = activeFilters.filter(outRangeFilterFor(field));
  aggregations[name] = {
    filter: {
      bool: {
        filter: otherActiveFilters,
      },
    },
    aggregations: {
      [name]: {
        range: {
          field,
          ranges,
        },
      },
    },
  };
};

export const addAggregationsToRequest = (request, filters = [], queryFilters = []) => {
  request.body.aggregations = {
    all_documents: {
      global: {},
      aggregations: {
        common_filters: {
          filter: {
            bool: {
              filter: queryFilters,
            },
          },
          aggregations: {},
        },
      },
    },
  };
  const aggregations =
    request.body.aggregations.all_documents.aggregations.common_filters.aggregations;
  FACET_DEFINITIONS.forEach((fd) => {
    if (fd.isRange) {
      addRangeAggregation(aggregations, filters, fd.name, fd.fieldName, fd.ranges);
    } else {
      addTermAggregation(aggregations, filters, fd.name, fd.fieldName);
    }
  });
  return request;
};

const agnosticFilterToESTermsFilter = (filter) => {
  const fieldName = FACET_IDS_TO_FIELD_NAMES[filter.facetId];
  return {
    terms: {
      [fieldName]: filter.keys,
    },
  };
};

const agnosticFilterToESRangeFilter = (filter) => {
  const fieldName = FACET_IDS_TO_FIELD_NAMES[filter.facetId];
  const f = {
    range: {
      [fieldName]: {},
    },
  };
  if (filter.from) {
    f.range[fieldName].gte = filter.from;
  }
  if (filter.to) {
    f.range[fieldName].lt = filter.to;
  }
  return f;
};

const agnosticFilterToESFilter = (filter) => {
  switch (filter.type) {
    case "terms":
      return agnosticFilterToESTermsFilter(filter);
    case "range":
      return agnosticFilterToESRangeFilter(filter);
    default:
      return null;
  }
};

export const agnosticFiltersToESFilters = (filters) =>
  filters.map(agnosticFilterToESFilter).filter(Boolean);
