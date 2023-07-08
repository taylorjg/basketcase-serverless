import { makeTermsFilter, makeRangeFilter } from "./facetDefinitionsUtils";

const priceDisplayNameFormatter = (bucket) => {
  const gotFrom = Number.isInteger(bucket.from);
  const gotTo = Number.isInteger(bucket.to);
  if (gotFrom && gotTo) {
    return `&pound;${bucket.from} - &pound;${bucket.to}`;
  }
  if (gotFrom) {
    return `&pound;${bucket.from} or more`;
  }
  if (gotTo) {
    return `&pound;${bucket.to} or less`;
  }
  return bucket.key;
};

const priceRangeDataBuckets = [
  { to: 200, key: "unspecified-200" },
  { from: 200, to: 250, key: "200-250" },
  { from: 250, to: 300, key: "250-300" },
  { from: 300, to: 350, key: "300-350" },
  { from: 350, to: 400, key: "350-400" },
  { from: 400, to: 450, key: "400-450" },
  { from: 450, to: 500, key: "450-500" },
  { from: 500, to: 550, key: "500-550" },
  { from: 550, to: 600, key: "550-600" },
  { from: 600, to: 650, key: "600-650" },
  { from: 650, key: "650-unspecified" },
];

const priceRangeData = priceRangeDataBuckets.map((bucket) => ({
  ...bucket,
  displayName: priceDisplayNameFormatter(bucket),
}));

const fitTypeFacet = {
  name: "fitType",
  displayName: "Fit Type",
  type: "multi",
  definition: {
    terms: {
      field: "FitTypeName.keyword",
    },
  },
  makeFilter: (options) => makeTermsFilter("FitTypeName.keyword", options),

  facetId: 1,
  aggregationName: "fitType",
  fieldName: "FitTypeName.keyword",
  isRange: false,
};

const brandFacet = {
  name: "brand",
  displayName: "Brand",
  type: "multi",
  definition: {
    terms: {
      field: "Brand.keyword",
    },
  },
  makeFilter: (options) => makeTermsFilter("Brand.keyword", options),

  facetId: 2,
  aggregationName: "brand",
  fieldName: "Brand.keyword",
  isRange: false,
};

const colourFacet = {
  name: "colour",
  displayName: "Colour",
  type: "multi",
  definition: {
    terms: {
      field: "Colour.keyword",
    },
  },
  makeFilter: (options) => makeTermsFilter("Colour.keyword", options),

  facetId: 3,
  aggregationName: "colour",
  fieldName: "Colour.keyword",
  isRange: false,
};

const priceFacet = {
  name: "price",
  displayName: "Price",
  type: "single",
  definition: {
    range: {
      field: "Price",
      ranges: priceRangeData,
    },
  },
  makeFilter: (options) => makeRangeFilter(priceRangeData, "Price", options),

  facetId: 4,
  aggregationName: "price",
  displayNameFormatter: priceDisplayNameFormatter,
  fieldName: "Price",
  isRange: true,
  ranges: [
    { to: 200 },
    { from: 200, to: 250 },
    { from: 250, to: 300 },
    { from: 300, to: 350 },
    { from: 350, to: 400 },
    { from: 400, to: 450 },
    { from: 450, to: 500 },
    { from: 500, to: 550 },
    { from: 550, to: 600 },
    { from: 600, to: 650 },
    { from: 650 },
  ],
};

export const FACET_DEFINITIONS = [fitTypeFacet, brandFacet, colourFacet, priceFacet];

export const FACET_IDS_TO_FIELD_NAMES = Object.fromEntries(
  FACET_DEFINITIONS.map(({ facetId, fieldName }) => [facetId, fieldName])
);

export const facetDescriptionsDictionary = {
  fitTypeFacet,
  brandFacet,
  colourFacet,
  priceFacet,
};

export const facetDescriptions = Object.values(facetDescriptionsDictionary);
