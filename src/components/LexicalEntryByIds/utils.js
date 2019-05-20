const getParams = (props) => {
  const { perspectiveId, perspectiveParentId } = props;

  const result = {
    id: perspectiveId.map(k => parseInt(k, 10)),
    parent_id: perspectiveParentId.map(k => parseInt(k, 10)),
  };
  return result;
};

const isIdsEquals = (firstId, secondId) => {
  if (!firstId || !secondId) {
    return false;
  }

  return parseInt(firstId[0], 10) === parseInt(secondId[0], 10) &&
    parseInt(firstId[1], 10) === parseInt(secondId[1], 10);
};

const isOnlyViewModeAllowed = (permissionLists, perspectiveId) => {
  if (!permissionLists || !permissionLists.edit || permissionLists.edit.length === 0) {
    return true;
  }

  const { edit: editList } = permissionLists;

  const perspectiveInEditList = editList.find(element => isIdsEquals(element.id, perspectiveId));

  if (!perspectiveInEditList) {
    return true;
  }

  return false;
};

export { isOnlyViewModeAllowed, isIdsEquals, getParams };
