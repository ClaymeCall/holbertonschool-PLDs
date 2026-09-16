export function effectiveEventDate(item) {
  return item.publishedAt ;
}

export function isFresh(item, now, maxAgeHours) {
  const date = new Date(effectiveEventDate(item));
  const ageMs = new Date(now) - date;
  return ageMs >= 0 && ageMs <= maxAgeHours * 3600 * 1000;
}
