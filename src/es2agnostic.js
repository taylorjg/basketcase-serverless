import { facetDescriptions, keyToAltKey } from "./facetDefinitions";

const isFacetValueSelected = (selectedFacet, key) =>
  (selectedFacet?.selectedFacetValues ?? []).some((k) => k === key);

const bucketToFacetValue = (selectedFacet, facetDescription) => (bucket) => {
  const { displayNameFormatter } = facetDescription;
  const { key } = bucket;
  const displayName = displayNameFormatter ? displayNameFormatter(bucket) : key;
  const altKey = keyToAltKey(facetDescription, key);

  return {
    displayName,
    key,
    altKey,
    count: bucket.doc_count,
    selected: isFacetValueSelected(selectedFacet, key),
  };
};

const bucketsToFacetValues = (selectedFacet, facetDescription, buckets) =>
  buckets
    .filter((bucket) => bucket.doc_count > 0)
    .map(bucketToFacetValue(selectedFacet, facetDescription));

const esAggregationsToAgnosticFacets = (aggregations, selectedFacets = []) => {
  return facetDescriptions.map((facetDescription) => {
    const selectedFacet = selectedFacets.find(({ name }) => name === facetDescription.name);
    const aggregation = aggregations[facetDescription.name][facetDescription.name];

    return {
      name: facetDescription.name,
      displayName: facetDescription.displayName,
      type: facetDescription.type,
      facetValues: bucketsToFacetValues(selectedFacet, facetDescription, aggregation.buckets),
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
