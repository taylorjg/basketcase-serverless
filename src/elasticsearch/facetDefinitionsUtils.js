export const makeTermsFilter = (field, options) => ({
  terms: {
    [field]: options,
  },
});

export const makeRangeFilter = (rangeData, field, options) => {
  const ranges = rangeData.filter((rangeDatum) => options.includes(rangeDatum.key));

  if (ranges.length === 0) {
    return undefined;
  }

  const makeRange = (rangeDatum) => {
    const maybeGte = rangeDatum.from !== undefined ? { gte: rangeDatum.from } : undefined;
    const maybeLt = rangeDatum.to !== undefined ? { lt: rangeDatum.to } : undefined;

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
      should: ranges.map(makeRange),
    },
  };
};
