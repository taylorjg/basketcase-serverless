import { makeTermsFilter, makeRangeFilter } from "./facetDefinitionsUtils";

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

const priceRangesWithoutDisplayNames = [
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

const priceRangesWithDisplayNames = priceRangesWithoutDisplayNames.map((bucket) => ({
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
  makeFilter: (selectedFacetValues) => makeTermsFilter("FitTypeName.keyword", selectedFacetValues),

  // old stuff - we should remove it
  facetId: 1,
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
  makeFilter: (selectedFacetValues) => makeTermsFilter("Brand.keyword", selectedFacetValues),

  // old stuff - we should remove it
  facetId: 2,
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
  makeFilter: (selectedFacetValues) => makeTermsFilter("Colour.keyword", selectedFacetValues),

  // old stuff - we should remove it
  facetId: 3,
  isRange: false,
};

const priceFacet = {
  name: "price",
  displayName: "Price",
  type: "single",
  definition: {
    range: {
      field: "Price",
      ranges: priceRangesWithoutDisplayNames,
    },
  },
  makeFilter: (selectedFacetValues) =>
    makeRangeFilter(priceRangesWithDisplayNames, "Price", selectedFacetValues),

  // old stuff - we should remove it
  facetId: 4,
  isRange: true,
};

export const facetDescriptions = [fitTypeFacet, brandFacet, colourFacet, priceFacet];
