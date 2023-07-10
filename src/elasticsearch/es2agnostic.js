import { facetDescriptions } from "./facetDefinitions";

const defaultDisplayNameFormatter = (bucket) => bucket.key;

const isFacetValueSelected = (selectedFacet, key) =>
  (selectedFacet?.selectedFacetValues ?? []).some((k) => k === key);

const bucketToCommonFacetValue = (
  selectedFacet,
  bucket,
  index,
  displayNameFormatter = defaultDisplayNameFormatter
) => ({
  index,
  displayName: displayNameFormatter(bucket),
  key: bucket.key,
  count: bucket.doc_count,
  selected: isFacetValueSelected(selectedFacet, bucket.key),
});

const bucketToTermsFacetValue = (selectedFacet, displayNameFormatter) => (bucket, index) =>
  bucketToCommonFacetValue(selectedFacet, bucket, index, displayNameFormatter);

const bucketToRangeFacetValue = (selectedFacet, displayNameFormatter) => (bucket, index) => {
  const facetValue = bucketToCommonFacetValue(selectedFacet, bucket, index, displayNameFormatter);
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

const esAggregationsToAgnosticFacets = (aggregations, selectedFacets = []) => {
  return facetDescriptions.map((fd) => {
    const selectedFacet = selectedFacets.find(({ name }) => name === fd.name);
    const aggregation = aggregations[fd.name][fd.name];
    const bucketsToFacetValuesFn = fd.isRange
      ? bucketsToRangeFacetValues
      : bucketsToTermsFacetValues;

    return {
      name: fd.name,
      displayName: fd.displayName,
      type: fd.type,
      facetValues: bucketsToFacetValuesFn(
        selectedFacet,
        aggregation.buckets,
        fd.displayNameFormatter
      ),
      isRange: fd.isRange,
      facetId: fd.facetId,
    };
  });
};

const esHitsToAgnosticResults = (hits) => ({
  total: hits.total,
  products: hits.hits.map((hit) => hit._source),
});

export const esResponseToAgnosticResponse = (response, selectedFacets) => ({
  results: esHitsToAgnosticResults(response.hits),
  facets: esAggregationsToAgnosticFacets(
    response.aggregations.all_documents.common_filters,
    selectedFacets
  ),
});
