import { matchPath } from 'react-router-dom';
import { getPage, getFilter } from 'utils/getParams';

function getIds(path) {
  const match = matchPath(path, {
    path: '/dictionary/:pcid/:poid/perspective/:cid/:oid',
  });
  return match && match.params;
}

function getMode(path) {
  const match = matchPath(path, {
    path: '/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode',
  });
  if (match && match.params && match.params.mode) {
    return match.params.mode;
  }
  return 'view';
}

export default function getParams(location) {
  const ids = getIds(location.pathname);
  if (!ids) return null;

  const result = {
    id: [ids.cid, ids.oid],
    parent_id: [ids.pcid, ids.poid],
    mode: getMode(location.pathname),
    page: getPage(location),
    filter: getFilter(location),
    baseUrl: `/dictionary/${ids.pcid}/${ids.poid}/perspective/${ids.cid}/${ids.oid}`,
  };
  return result;
}
