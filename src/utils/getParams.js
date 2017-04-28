export function getParams(location) {
  return new URLSearchParams(location.search);
}

export function getPage(location) {
  return parseInt(getParams(location).get('page'), 10) || 1;
}

export function getFilter(location) {
  return getParams(location).get('filter') || '';
}

export default getParams;
