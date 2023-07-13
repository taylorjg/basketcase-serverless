export const makeTermsFilter = (field) => (selectedFacetValues) => ({
  terms: {
    [field]: selectedFacetValues,
  },
});

export const makeRangeFilter = (field, ranges) => (selectedFacetValues) => {
  const selectedRanges = ranges.filter((range) => selectedFacetValues.includes(range.key));

  if (selectedRanges.length === 0) {
    return undefined;
  }

  const makeRangeExpression = (range) => {
    const maybeGte = range.from !== undefined ? { gte: range.from } : undefined;
    const maybeLt = range.to !== undefined ? { lt: range.to } : undefined;

    return {
      range: {
        [field]: {
          ...maybeGte,
          ...maybeLt,
        },
      },
    };
  };

  return {
    bool: {
      should: selectedRanges.map(makeRangeExpression),
    },
  };
};
