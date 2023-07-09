import { FACET_DEFINITIONS } from "./facetDefinitions";

const defaultDisplayNameFormatter = (bucket) => bucket.key;

const filterContainsKey = (filter, key) => (filter?.keys ?? []).some((k) => k === key);

const bucketToCommonFacetValue = (
  filter,
  bucket,
  index,
  displayNameFormatter = defaultDisplayNameFormatter
) => ({
  index,
  displayName: displayNameFormatter(bucket),
  key: bucket.key,
  count: bucket.doc_count,
  selected: filterContainsKey(filter, bucket.key),
});

const bucketToTermsFacetValue = (filter, displayNameFormatter) => (bucket, index) =>
  bucketToCommonFacetValue(filter, bucket, index, displayNameFormatter);

const bucketToRangeFacetValue = (filter, displayNameFormatter) => (bucket, index) => {
  const facetValue = bucketToCommonFacetValue(filter, bucket, index, displayNameFormatter);
  return {
    ...facetValue,
    from: bucket.from,
    to: bucket.to,
  };
};

const bucketsToTermsFacetValues = (filter, buckets, displayNameFormatter) =>
  buckets.map(bucketToTermsFacetValue(filter, displayNameFormatter));

const bucketsToRangeFacetValues = (filter, buckets, displayNameFormatter) =>
  buckets
    .filter((bucket) => bucket.doc_count)
    .map(bucketToRangeFacetValue(filter, displayNameFormatter));

const esAggsToAgnosticFacets = (aggs, filters = []) => {
  return FACET_DEFINITIONS.map((fd) => {
    const filter = filters.find((f) => f.facetId === fd.facetId);
    const agg = aggs[fd.aggregationName][fd.aggregationName];
    const bucketsToFacetValuesFn = fd.isRange
      ? bucketsToRangeFacetValues
      : bucketsToTermsFacetValues;
    return {
      name: fd.name,
      facetId: fd.facetId,
      isRange: fd.isRange,
      displayName: fd.displayName,
      facetValues: bucketsToFacetValuesFn(filter, agg.buckets, fd.displayNameFormatter),
    };
  });
};

const esHitsToAgnosticResults = (hits) => ({
  total: hits.total,
  products: hits.hits.map((hit) => hit._source),
});

export const esResponseToAgnosticResponse = (response, filters) => ({
  results: esHitsToAgnosticResults(response.hits),
  facets: esAggsToAgnosticFacets(response.aggregations.all_documents.common_filters, filters),
});
