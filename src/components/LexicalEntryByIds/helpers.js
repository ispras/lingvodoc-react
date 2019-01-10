// const editRolesIds = [
//   21, // can create lexical entries
//   26, // can delete lexical entries and enteties
// ];

// const getAllowedRolesIds = (perspective) => {
//   if (!perspective ||
//     !perspective.roles ||
//     !perspective.roles.roles_users
//   ) {
//     return null;
//   }

//   const { roles: { roles_users: allowedRoles } } = perspective;

//   if (allowedRoles.length === 0 || allowedRoles[0].roles_ids.length === 0) {
//     return null;
//   }

//   const allowedRolesIds = allowedRoles[0].roles_ids;

//   return allowedRolesIds;
// };

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
  // const allowedRolesIds = getAllowedRolesIds(perspective);

  // if (allowedRolesIds === null) {
  //   return true;
  // }

  // return false;
};

export { isOnlyViewModeAllowed, isIdsEquals };
