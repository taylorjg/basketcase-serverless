export const SORT_BY_PRICE_LOW_TO_HIGH = "price-low-to-high";
export const SORT_BY_PRICE_HIGH_TO_LOW = "price-high-to-low";
export const SORT_BY_AVERAGE_RATING = "average-rating";
export const SORT_BY_REVIEW_COUNT = "review-count";

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_CURRENT_PAGE = 1;
export const DEFAULT_SORT_BY = SORT_BY_PRICE_LOW_TO_HIGH;
export const DEFAULT_SEARCH_TEXT = "";
export const DEFAULT_FILTERS = [];

export const DEFAULT_SEARCH_OPTIONS = {
  pageSize: DEFAULT_PAGE_SIZE,
  currentPage: DEFAULT_CURRENT_PAGE,
  sortBy: DEFAULT_SORT_BY,
  searchText: DEFAULT_SEARCH_TEXT,
  filters: DEFAULT_FILTERS,
};
