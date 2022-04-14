import { matchPath } from "react-router-dom";

import { getPage } from "utils/getParams";

function getIds(path) {
  const match = matchPath(
    {
      path: "/dictionary/:pcid/:poid/perspective/:cid/:oid/*"
    },
    path
  );
  return match && match.params;
}

function getMode(path) {
  const match = matchPath(
    {
      path: "/dictionary/:pcid/:poid/perspective/:cid/:oid/:mode"
    },
    path
  );
  if (match && match.params && match.params.mode) {
    return match.params.mode;
  }
  return "view";
}

export default function getParams(location) {
  const ids = getIds(location.pathname);
  if (!ids) {
    return null;
  }

  const result = {
    id: [ids.cid, ids.oid].map(k => parseInt(k, 10)),
    parent_id: [ids.pcid, ids.poid].map(k => parseInt(k, 10)),
    mode: getMode(location.pathname),
    page: getPage(location),
    baseUrl: `/dictionary/${ids.pcid}/${ids.poid}/perspective/${ids.cid}/${ids.oid}`
  };
  return result;
}
