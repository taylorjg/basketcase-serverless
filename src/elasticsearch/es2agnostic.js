import { facetDescriptions } from "./facetDefinitions";

const isFacetValueSelected = (selectedFacet, key) =>
  (selectedFacet?.selectedFacetValues ?? []).some((k) => k === key);

const bucketToCommonFacetValue = (selectedFacet, displayNameFormatter, bucket, index) => {
  const displayName = displayNameFormatter ? displayNameFormatter(bucket) : bucket.key;
  return {
    index,
    displayName,
    key: bucket.key,
    count: bucket.doc_count,
    selected: isFacetValueSelected(selectedFacet, bucket.key),
  };
};

const bucketToTermsFacetValue = (selectedFacet, displayNameFormatter) => (bucket, index) =>
  bucketToCommonFacetValue(selectedFacet, displayNameFormatter, bucket, index);

const bucketToRangeFacetValue = (selectedFacet, displayNameFormatter) => (bucket, index) => {
  const facetValue = bucketToCommonFacetValue(selectedFacet, displayNameFormatter, bucket, index);
  return {
    ...facetValue,
    from: bucket.from,
    to: bucket.to,
  };
};

const bucketsToTermsFacetValues = (selectedFacet, displayNameFormatter, buckets) =>
  buckets.map(bucketToTermsFacetValue(selectedFacet, displayNameFormatter));

const bucketsToRangeFacetValues = (selectedFacet, displayNameFormatter, buckets) =>
  buckets
    .filter((bucket) => bucket.doc_count > 0)
    .map(bucketToRangeFacetValue(selectedFacet, displayNameFormatter));

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
        fd.displayNameFormatter,
        aggregation.buckets
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
