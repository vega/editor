export const isValidDate = dateString =>
  Object.prototype.toString.call(dateString) === "[object Date]";
