const MAX_LIMIT = 50;

function parsePagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const rawLimit = query.limit === undefined ? 10 : Number(query.limit);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(rawLimit) ||
    rawLimit < 1
  ) {
    return { error: 'page and limit must be positive integers' };
  }

  return { page, limit: Math.min(rawLimit, MAX_LIMIT) };
}

module.exports = { parsePagination };
