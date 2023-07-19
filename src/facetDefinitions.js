import { makeTermsFilter, makeRangeFilter } from "./facetDefinitionsUtils";

export const keyToAltKey = (key) => {
  const altKey = key.toLowerCase().replaceAll(" ", "-");
  // Only use 'altKey' if we can successfully convert it back to 'key' otherwise just return `key' unaltered.
  return altKeyToKey(altKey) === key ? altKey : key;
};

const capitalise = (s) => {
  const [firstChar, ...remainingChars] = Array.from(s);
  return [firstChar.toUpperCase(), ...remainingChars].join("");
};

export const altKeyToKey = (altKey) => {
  const words = altKey.split("-");
  return words.map(capitalise).join(" ");
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
  name: "fitType",
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
  noAltKeys: true,
  definition: {
    range: {
      field: "Price",
      ranges: priceRanges,
    },
  },
  makeFilter: makeRangeFilter("Price", priceRanges),
  displayNameFormatter: priceRangeDisplayNameFormatter,
};

export const facetDescriptions = [fitTypeFacet, brandFacet, colourFacet, priceFacet];
