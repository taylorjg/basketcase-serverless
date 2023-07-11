import { facetDescriptions } from "./facetDefinitions";

const isFacetValueSelected = (selectedFacet, key) =>
  (selectedFacet?.selectedFacetValues ?? []).some((k) => k === key);

const bucketToCommonFacetValue = (selectedFacet, bucket, index) => ({
  index,
  displayName: bucket.displayName ?? bucket.key,
  key: bucket.key,
  count: bucket.doc_count,
  selected: isFacetValueSelected(selectedFacet, bucket.key),
});

const bucketToTermsFacetValue = (selectedFacet) => (bucket, index) =>
  bucketToCommonFacetValue(selectedFacet, bucket, index);

const bucketToRangeFacetValue = (selectedFacet) => (bucket, index) => {
  const facetValue = bucketToCommonFacetValue(selectedFacet, bucket, index);
  return {
    ...facetValue,
    from: bucket.from,
    to: bucket.to,
  };
};

const bucketsToTermsFacetValues = (filter, buckets) => buckets.map(bucketToTermsFacetValue(filter));

const bucketsToRangeFacetValues = (filter, buckets) =>
  buckets.filter((bucket) => bucket.doc_count).map(bucketToRangeFacetValue(filter));

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
      facetValues: bucketsToFacetValuesFn(selectedFacet, aggregation.buckets),
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
