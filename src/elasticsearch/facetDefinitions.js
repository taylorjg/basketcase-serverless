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

const makeRangeDatum = ({ from, to }) => {
  const maybeFrom = from !== undefined ? { from } : undefined;
  const maybeTo = to !== undefined ? { to } : undefined;
  const fromKeyPart = maybeFrom ? from : "undefined";
  const toKeyPart = maybeTo ? to : "undefined";
  const key = `${fromKeyPart}-${toKeyPart}`;

  return {
    ...maybeFrom,
    ...maybeTo,
    key,
  };
};

const priceRangeDataWithoutDisplayNames = [
  makeRangeDatum({ to: 200 }),
  makeRangeDatum({ from: 200, to: 250 }),
  makeRangeDatum({ from: 250, to: 300 }),
  makeRangeDatum({ from: 300, to: 350 }),
  makeRangeDatum({ from: 350, to: 400 }),
  makeRangeDatum({ from: 400, to: 450 }),
  makeRangeDatum({ from: 450, to: 500 }),
  makeRangeDatum({ from: 500, to: 550 }),
  makeRangeDatum({ from: 550, to: 600 }),
  makeRangeDatum({ from: 600, to: 650 }),
  makeRangeDatum({ from: 650 }),
];

const priceRangeDataWithDisplayNames = priceRangeDataWithoutDisplayNames.map((bucket) => ({
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

  // old stuff - we should remove it
  facetId: 1,
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

  // old stuff - we should remove it
  facetId: 2,
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

  // old stuff - we should remove it
  facetId: 3,
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
      ranges: priceRangeDataWithoutDisplayNames,
    },
  },
  makeFilter: (options) => makeRangeFilter(priceRangeDataWithDisplayNames, "Price", options),

  // old stuff - we should remove it
  facetId: 4,
  displayNameFormatter: priceDisplayNameFormatter,
  fieldName: "Price",
  isRange: true,
  ranges: priceRangeDataWithoutDisplayNames,
};

export const FACET_DEFINITIONS = [fitTypeFacet, brandFacet, colourFacet, priceFacet];

export const FACET_IDS_TO_FIELD_NAMES = Object.fromEntries(
  FACET_DEFINITIONS.map(({ facetId, fieldName }) => [facetId, fieldName])
);

export const facetDescriptions = [fitTypeFacet, brandFacet, colourFacet, priceFacet];
