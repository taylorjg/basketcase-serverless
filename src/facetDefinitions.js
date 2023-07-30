import { makeTermsFilter, makeRangeFilter } from "./facetDefinitionsUtils";

const identity = (x) => x;

const capitaliseFirstChar = (s) => {
  const [firstChar, ...remainingChars] = Array.from(s);
  return [firstChar.toUpperCase(), ...remainingChars].join("");
};

const keyToAltKeyDefaultFn = (key) => key.toLowerCase().replaceAll(" ", "-");

const altKeyToKeyDefaultFn = (altKey) => {
  const words = altKey.split("-");
  return words.map(capitaliseFirstChar).join(" ");
};

export const keyToAltKey = (facetDescription, key) => {
  const keyToAltKeyFn = facetDescription.keyToAltKey ?? keyToAltKeyDefaultFn;
  const altKeyToKeyFn = facetDescription.altKeyToKey ?? altKeyToKeyDefaultFn;
  const altKey = keyToAltKeyFn(key);
  // Only use 'altKey' if we can successfully convert it back to 'key' otherwise just return `key' unaltered.
  return altKeyToKeyFn(altKey) === key ? altKey : key;
};

export const altKeyToKey = (facetDescription) => (altKey) => {
  const altKeyToKeyFn = facetDescription.altKeyToKey ?? altKeyToKeyDefaultFn;
  return altKeyToKeyFn(altKey);
};

const makeRangeKey = (from, to) => {
  const gotFrom = Number.isInteger(from);
  const gotTo = Number.isInteger(to);
  if (gotFrom && gotTo) return `${from}-${to}`;
  if (gotFrom) return `${from}-or-more`;
  if (gotTo) return `${to}-or-less`;
  return `${from}-${to}`;
};

const makeRangeDatum = ({ from, to }) => {
  const maybeFrom = from !== undefined ? { from } : undefined;
  const maybeTo = to !== undefined ? { to } : undefined;
  const key = makeRangeKey(from, to);

  return {
    ...maybeFrom,
    ...maybeTo,
    key,
  };
};

const priceRangeDisplayNameFormatter = (bucket) => {
  const gotFrom = Number.isInteger(bucket.from);
  const gotTo = Number.isInteger(bucket.to);
  if (gotFrom && gotTo) {
    return `£${bucket.from} - £${bucket.to}`;
  }
  if (gotFrom) {
    return `£${bucket.from} or more`;
  }
  if (gotTo) {
    return `£${bucket.to} or less`;
  }
  return bucket.key;
};

const priceRanges = [
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

const fitTypeFacet = {
  name: "fit-type",
  displayName: "Fit Type",
  type: "multi",
  definition: {
    terms: {
      field: "FitTypeName.keyword",
    },
  },
  makeFilter: makeTermsFilter("FitTypeName.keyword"),
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
  makeFilter: makeTermsFilter("Brand.keyword"),
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
  makeFilter: makeTermsFilter("Colour.keyword"),
};

const priceFacet = {
  name: "price",
  displayName: "Price",
  type: "single",
  definition: {
    range: {
      field: "Price",
      ranges: priceRanges,
    },
  },
  makeFilter: makeRangeFilter("Price", priceRanges),
  displayNameFormatter: priceRangeDisplayNameFormatter,
  keyToAltKey: identity,
  altKeyToKey: identity,
};

const energyRatingFacet = {
  name: "energy-rating",
  displayName: "Energy Rating",
  type: "multi",
  definition: {
    terms: {
      field: "EnergyRating.keyword",
    },
  },
  makeFilter: makeTermsFilter("EnergyRating.keyword"),
  keyToAltKey: (key) => key.replaceAll("+", "plus").toLowerCase(),
  altKeyToKey: (altKey) => altKey.replaceAll("plus", "+").toUpperCase(),
};

export const facetDescriptions = [
  fitTypeFacet,
  brandFacet,
  colourFacet,
  priceFacet,
  energyRatingFacet,
];
