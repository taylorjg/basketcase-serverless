export const findFacet = (facets, displayName) => {
  return facets.find((facet) => facet.displayName === displayName);
};

export const findFacetValue = (facet, displayName) => {
  return facet.facetValues.find((facetValue) => facetValue.displayName === displayName);
};
