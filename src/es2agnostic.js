import { facetDescriptions, keyToAltKey } from "./facetDefinitions";

const isFacetValueSelected = (selectedFacet, key) =>
  (selectedFacet?.selectedFacetValues ?? []).some((k) => k === key);

const bucketToFacetValue = (selectedFacet, displayNameFormatter) => (bucket) => {
  const displayName = displayNameFormatter ? displayNameFormatter(bucket) : bucket.key;
  return {
    displayName,
    key: bucket.key,
    altKey: keyToAltKey(bucket.key),
    count: bucket.doc_count,
    selected: isFacetValueSelected(selectedFacet, bucket.key),
  };
};

const bucketsToFacetValues = (selectedFacet, displayNameFormatter, buckets) =>
  buckets
    .filter((bucket) => bucket.doc_count > 0)
    .map(bucketToFacetValue(selectedFacet, displayNameFormatter));

const esAggregationsToAgnosticFacets = (aggregations, selectedFacets = []) => {
  return facetDescriptions.map((fd) => {
    const selectedFacet = selectedFacets.find(({ name }) => name === fd.name);
    const aggregation = aggregations[fd.name][fd.name];

    return {
      name: fd.name,
      displayName: fd.displayName,
      type: fd.type,
      facetValues: bucketsToFacetValues(
        selectedFacet,
        fd.displayNameFormatter,
        aggregation.buckets
      ),
    };
  });
};

const esHitsToAgnosticResults = (hits) => ({
  total: hits.total.value,
  products: hits.hits.map((hit) => hit._source),
});

export const esResponseToAgnosticResponse = (response, selectedFacets) => ({
  results: esHitsToAgnosticResults(response.hits),
  facets: esAggregationsToAgnosticFacets(
    response.aggregations.all_documents.common_filters,
    selectedFacets
  ),
});
