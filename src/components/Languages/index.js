import React, { useCallback, useContext, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getFlatDataFromTree, getNodeAtPath, map } from "react-sortable-tree";
import { Button, Icon, Popup } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import Immutable from "immutable";
import { findIndex, isEqual, cloneDeep } from "lodash";
import PropTypes from "prop-types";

import { chooseTranslation } from "api/i18n";
import {
  deleteLanguageMutation,
  dictionariesInfoQuery,
  languagesQuery,
  moveLanguageMutation,
  updateLanguageMetadataMutation
} from "backend";
import CreateLanguageModal from "components/CreateLanguageModal";
import EditLanguageModal from "components/EditLanguageModal";
import SelectUserModal from "components/LanguageUserRoleModal";
import TreeWithSearch from "components/TreeWithSearch";
import { useMutation } from "hooks";
import TranslationContext from "Layout/TranslationContext";
import { buildLanguageTree, uniqSum } from "pages/Search/treeBuilder";
import { compositeIdToString } from "utils/compositeId";
import { queryUsers } from "components/BanModal";

const getNodeKey = ({ node, treeIndex }) => (node.id ? node.id.toString() : treeIndex);

const Languages = ({ height, selected, onSelect, expanded = true, inverted = true, updatableTOC }) => {
  const getTranslation = useContext(TranslationContext);

  const user = useSelector(state => state.user.user);
  const canEdit = useMemo(() => user.id !== undefined, [user]);

  const [treeData, setTreeData] = useState();
  const [selection, setSelection] = useState(selected);
  const [modifyingTocs, setModifyingTocs] = useState([]);
  const [modalInfo, setModalInfo] = useState({});

  const { loading: userLoading, data: userData } = useQuery(queryUsers);

  const { loading: dictionariesLoading, data: dictionariesData } = useQuery(dictionariesInfoQuery);
  const languageStats = useMemo(() => {
    if (!dictionariesData) {
      return undefined;
    }

    const langStats = new Map();
    dictionariesData.dictionaries.forEach(dictionary => {
      const key = dictionary.parent_id.toString();
      const isDictionary = dictionary.category !== 1;
      let stats = langStats[key];
      if (!stats) {
        stats = { dictionariesCount: 0, corporaCount: 0 };
        langStats[key] = stats;
      }
      if (isDictionary) {
        stats.dictionariesCount++;
      } else {
        stats.corporaCount++;
      }
    });
    return langStats;
  }, [dictionariesData]);

  const setTreeDataFromQuery = useCallback(
    (tree, readyData) => {
      setTreeData(
        map({
          treeData: readyData
                    ? readyData
                    : buildLanguageTree(Immutable.fromJS(tree)).toJS(),
          callback: ({ node, path }) => {
            // Preserve expanded state of nodes from the previous state
            const displayedNode = treeData ? getNodeAtPath({ treeData, path, getNodeKey }) : undefined;
            return { ...node, expanded: displayedNode ? displayedNode.node.expanded || false : expanded };
          },
          getNodeKey,
          ignoreCollapsed: false
        })
      );
    },
    [expanded, treeData]
  );

  const {
    loading: languagesLoading,
    data: languagesData,
    refetch
  } = useQuery(languagesQuery, {
    onCompleted: data => setTreeDataFromQuery(data.languages, null)
  });

  const updateLanguageTree = ({language_id, user_id}) => {
    let isFound = false;
    const innerUpdate = (node, toChange) => {
      let langAttUsr = node.additional_metadata.attached_users;

      if (node.id.toString() === language_id.toString()) {
        langAttUsr = uniqSum(langAttUsr, [user_id]);
        node.additional_metadata.attached_users = langAttUsr;
        isFound = true;
        toChange = true;
      }

      if (isFound && toChange) {
        const landInhUsr = node.additional_metadata.inherited_users;
        const langAllUsr = uniqSum(langAttUsr, landInhUsr);
        node.children.forEach(x =>
          x.additional_metadata.inherited_users = langAllUsr);
      }

      //stop search if result is found in another branch of recursion
      if (isFound && !toChange)
        return null;

      return node.children.forEach(n => innerUpdate(n, toChange));
    }
    const readyData = cloneDeep(treeData);
    readyData.forEach(n => innerUpdate(n, false));
    setTreeDataFromQuery(null, readyData);
  }

  const [deleteLanguage] = useMutation(deleteLanguageMutation, { onCompleted: () => refetch() });
  const [moveLanguage] = useMutation(moveLanguageMutation, { onCompleted: () => refetch() });
  const [updateLanguageMetadata] = useMutation(updateLanguageMetadataMutation, { onCompleted: () => refetch() });

  const onNodeSelected = useCallback(
    node => {
      if (node === selection) {
        return;
      }
      setSelection(node);
      onSelect(node);
    },
    [onSelect, selection]
  );

  const onNodeDelete = useCallback(node => deleteLanguage({ variables: { id: node.id } }), [deleteLanguage]);

  const onToggleTOC = useCallback(
    node => {
      const idStr = compositeIdToString(node.id);
      let newModifyingTocs = modifyingTocs.slice();
      newModifyingTocs.push(idStr);
      setModifyingTocs(newModifyingTocs);

      const tocMark = node.additional_metadata.toc_mark;
      updateLanguageMetadata({
        variables: {
          id: node.id,
          metadata: { toc_mark: !tocMark }
        }
      }).then(
        () => {
          node.additional_metadata.toc_mark = !tocMark;
          const success_str = getTranslation(tocMark ? "Successfully removed" : "Successfully added");
          window.logger.suc(
            `${success_str} '${chooseTranslation(node.translations)}' ${getTranslation(
              tocMark ? "from TOC" : "to TOC"
            )}.`
          );
          newModifyingTocs = modifyingTocs.filter(id => id !== idStr);
          setModifyingTocs(newModifyingTocs);
        },
        () => {
          const fail_str = getTranslation(tocMark ? "Failed to remove" : "Failed to add");
          window.logger.err(
            `${fail_str} '${chooseTranslation(node.translations)}' ${getTranslation(tocMark ? "from TOC" : "to TOC")}!`
          );
        }
      );
    },
    [getTranslation, modifyingTocs, updateLanguageMetadata]
  );

  const generateNodeProps = useCallback(
    ({ node }) => {
      if (!canEdit) {
        return { title: chooseTranslation(node.translations) };
      }
      const buttons = [];
      const nodeProps = { buttons };
      const toName = (userIdList) => {
        if (!userData || !userData.users) return "No user data";
        if (!userIdList || !userIdList.length) return "No assigned users";
        return userIdList.map(id => {
          const user = userData.users.find(x => x.id === id);
          if (user) return user.name;
          return "Anonymous";
        }).join(" | ");
      }

      if (user.id === 1) {
        const langAttUsr = node.additional_metadata.attached_users;
        const landInhUsr = node.additional_metadata.inherited_users;
        const langAllUsr = uniqSum(langAttUsr, landInhUsr);
        const attUsrName = toName(langAttUsr);
        const allUsrName = toName(langAllUsr);
        nodeProps.subtitle = (
          <div
            title="Own assigned users"
          >
            {attUsrName}
          </div>
        );
        buttons.push(
          <Popup
            trigger={
              <Button
                color='cyan'
                title={getTranslation("Add assigned user")}
                icon='add'
                onClick={() => setModalInfo({ kind: "sign", node })}
              />
            }
            hideOnScroll={true}
            position='left center'
          >
            <Popup.Header>Own and inherited users</Popup.Header>
            <Popup.Content>
              {allUsrName}
            </Popup.Content>
          </Popup>
        );
      }
      if (onSelect) {
        buttons.push(<Button color="blue" content={getTranslation("Select")} onClick={() => onNodeSelected(node)} />);
      }
      buttons.push(
        <Button color="orange" content={getTranslation("Edit")} onClick={() => setModalInfo({ kind: "edit", node })} />
      );
      buttons.push(
        <Button
          color="green"
          content={getTranslation("Create")}
          onClick={() => setModalInfo({ kind: "create", node })}
        />
      );
      if (!onSelect && user.id === 1) {
        const stats = languageStats[node.id.toString()];
        const dictionariesCount = stats ? stats.dictionariesCount : 0;
        const corporaCount = stats ? stats.corporaCount : 0;
        nodeProps.title = (
          <div
            title={`${getTranslation("Dictionaries")}: ${dictionariesCount}, ${getTranslation(
              "Corpora"
            )}: ${corporaCount}`}
          >
            {chooseTranslation(node.translations)}
          </div>
        );
        if (!stats) {
          buttons.push(<Button color="red" content={getTranslation("Delete")} onClick={() => onNodeDelete(node)} />);
        }
      } else {
        nodeProps.title = chooseTranslation(node.translations);
      }
      if (selection && node.id.toString() === selection.id.toString()) {
        nodeProps.style = { boxShadow: `0 0 0 4px blue` };
      }
      if (updatableTOC && user.id === 1) {
        const modifying = modifyingTocs.includes(compositeIdToString(node.id));
        const tocMark = node.additional_metadata && node.additional_metadata.toc_mark;

        nodeProps.buttons.push(
          <Button
            content={
              modifying
                ? `${getTranslation(tocMark ? "Removing" : "Adding")}...`
                : getTranslation(tocMark ? "Remove from TOC" : "Add to TOC")
            }
            disabled={modifying}
            onClick={() => onToggleTOC(node)}
          />
        );
      }
      if (user.id === 1) {
        nodeProps.buttons.push(
          <Button
            color="violet"
            title="Subscribe all the existing dictionaries and corpora related to this language and its sublanguages"
            content={getTranslation("Add roles")}
            onClick={() => setModalInfo({ kind: "roles", node })}
          />
        );
      }
      return nodeProps;
    },
    [
      canEdit,
      getTranslation,
      languageStats,
      modifyingTocs,
      onNodeDelete,
      onNodeSelected,
      onSelect,
      onToggleTOC,
      selection,
      updatableTOC,
      user,
      userData
    ]
  );

  const onMoveNode = useCallback(
    ({ treeData: td, node }) => {
      // create flat representation of the language tree to make traversals easier
      const langs = getFlatDataFromTree({
        treeData: td,
        getNodeKey: ({ node: n }) => n.id,
        callback: ({ node: n }) => ({ ...n, expanded: false }),
        ignoreCollapsed: false
      }).map(({ node: n, path, treeIndex }) => ({
        id: n.id,
        translation: chooseTranslation(n.translations),
        parent: path.length > 1 ? path[path.length - 2] : null,
        treeIndex
      }));

      // calculate new parent id
      const updNode = langs.find(n => isEqual(n.id, node.id));
      const newParentId = updNode.parent;
      // calculate previous sibling id
      const newSiblings = langs.filter(lang => isEqual(lang.parent, newParentId));
      const nodePosition = findIndex(newSiblings, n => isEqual(n.id, updNode.id));
      const prevLanguageId = nodePosition === 0 ? null : newSiblings[nodePosition - 1].id;

      moveLanguage({ variables: { id: updNode.id, parent_id: newParentId, previous_sibling_id: prevLanguageId } });
    },
    [moveLanguage]
  );

  if (dictionariesLoading || languagesLoading || userLoading) {
    return (
      <span
        style={{
          backgroundColor: "white",
          borderRadius: "0.25em",
          padding: "0.5em"
        }}
      >
        {getTranslation("Loading language data")}... <Icon loading name="spinner" />
      </span>
    );
  }

  if (!dictionariesData || !languagesData || !treeData || !userData) {
    return null;
  }

  return (
    <div className={inverted ? "inverted" : ""} style={height ? { height: height } : { height: "100%" }}>
      <div style={{ height: "100%" }}>
        <TreeWithSearch
          inverted={inverted}
          treeData={treeData}
          onChange={td => setTreeData(td)}
          generateNodeProps={generateNodeProps}
          onMoveNode={onMoveNode}
          canDrag={canEdit}
        />
      </div>
      {modalInfo.kind === "create" && (
        <CreateLanguageModal
          parent={modalInfo.node}
          close={wasCreated => {
            setModalInfo({});
            if (wasCreated) {
              refetch();
            }
          }}
        />
      )}
      {modalInfo.kind === "edit" && <EditLanguageModal language={modalInfo.node} close={() => setModalInfo({})} />}
      {modalInfo.kind === "roles" && <SelectUserModal
        language={modalInfo.node}
        close={() => setModalInfo({})}
        added={info => null} //dummy function
        kind="roles"
      />}
      {modalInfo.kind === "sign" && <SelectUserModal
        language={modalInfo.node}
        close={() => setModalInfo({})}
        added={info => updateLanguageTree(info)}
        kind="sign"
      />}
    </div>
  );
};

Languages.propTypes = {
  height: PropTypes.string,
  selected: PropTypes.object,
  onSelect: PropTypes.func,
  expanded: PropTypes.bool,
  inverted: PropTypes.bool,
  updatableTOC: PropTypes.bool
};

export default Languages;
