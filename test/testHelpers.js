import { handler } from "../src/search.js";

export const invokeSearchHandler = async (requestBody) => {
  const event = requestBody ? { body: JSON.stringify(requestBody) } : {};
  const response = await handler(event);
  expect(response.statusCode).toBe(200);
  return JSON.parse(response.body);
};

export const findFacet = (facets, displayName) => {
  return facets.find((facet) => facet.displayName === displayName);
};

export const findFacetValue = (facet, displayName) => {
  return facet.facetValues.find((facetValue) => facetValue.displayName === displayName);
};
